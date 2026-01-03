<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\LocatorSlip;
use App\Models\LeaveApplication;
use App\Models\VehicleTripTicket;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminApprovalController extends Controller
{
    public function index()
    {
        // --- 1. FETCH PENDING REQUESTS ---
        $pendingLocators = LocatorSlip::where('status', 'pending')
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        $pendingLeaves = LeaveApplication::where('status', 'pending')
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        $pendingTickets = VehicleTripTicket::where('status', 'pending')
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        // --- 2. FETCH HISTORY (Approved/Rejected) ---
        $historyLocators = LocatorSlip::whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($slip) {
                if ($slip->time_departure && $slip->time_arrival) {
                    $start = Carbon::parse($slip->time_departure);
                    $end = Carbon::parse($slip->time_arrival);
                    $slip->duration_str = $start->diff($end)->format('%Hh %Im');
                } else {
                    $slip->duration_str = 'Ongoing';
                }
                return $slip;
            });

        $historyLeaves = LeaveApplication::whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get();

        $historyTickets = VehicleTripTicket::whereIn('status', ['approved', 'rejected'])
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get();

        // --- 3. GENERATE MONTHLY REPORTS (Personal vs Official) ---
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $reports = User::with(['locatorSlips' => function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                  ->where('status', 'approved')
                  ->whereNotNull('time_arrival');
        }, 'leaveApplications' => function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                  ->where('status', 'approved');
        }])->get()->map(function ($user) {
            
            // Filter Slips
            $personalSlips = $user->locatorSlips->where('type', 'personal'); // Deduct from allowance
            $officialSlips = $user->locatorSlips->where('type', 'official'); // Does not deduct

            // Calculate Seconds
            $personalSeconds = $personalSlips->sum(function ($slip) {
                return Carbon::parse($slip->time_departure)->diffInSeconds(Carbon::parse($slip->time_arrival));
            });

            $officialSeconds = $officialSlips->sum(function ($slip) {
                return Carbon::parse($slip->time_departure)->diffInSeconds(Carbon::parse($slip->time_arrival));
            });

            // Calculate Leave Days
            $leaveDays = $user->leaveApplications->sum('working_days');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'department' => $user->office_department ?? 'N/A',
                'personal_hours' => round($personalSeconds / 3600, 2), // The 4-hour limit tracker
                'official_hours' => round($officialSeconds / 3600, 2), // Official business
                'leave_days' => $leaveDays,
                'is_over_limit' => $personalSeconds > 14400, // > 4 hours
            ];
        })->sortByDesc('personal_hours')->values();

        // --- 4. STATISTICS ---
        $today = Carbon::today();
        $stats = [
            'pending_total' => $pendingLocators->count() + $pendingLeaves->count() + $pendingTickets->count(),
            'approved_today' => 
                LocatorSlip::whereDate('updated_at', $today)->where('status', 'approved')->count() +
                LeaveApplication::whereDate('updated_at', $today)->where('status', 'approved')->count() +
                VehicleTripTicket::whereDate('updated_at', $today)->where('status', 'approved')->count(),
            'rejected_today' => 
                LocatorSlip::whereDate('updated_at', $today)->where('status', 'rejected')->count() +
                LeaveApplication::whereDate('updated_at', $today)->where('status', 'rejected')->count() +
                VehicleTripTicket::whereDate('updated_at', $today)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Approvals/Dashboard', [
            'pending' => [
                'locators' => $pendingLocators,
                'leaves' => $pendingLeaves,
                'tickets' => $pendingTickets,
            ],
            'history' => [
                'locators' => $historyLocators,
                'leaves' => $historyLeaves,
                'tickets' => $historyTickets,
            ],
            'reports' => $reports,
            'stats' => $stats
        ]);
    }

    public function updateStatus(Request $request, $type, $id)
    {
        $validated = $request->validate(['status' => 'required|in:approved,rejected']);
        $status = $validated['status'];
        $record = null;
        $documentName = '';

        switch ($type) {
            case 'locator':
                $record = LocatorSlip::with('user')->findOrFail($id);
                $documentName = 'Personnel Locator Slip';
                break;
            case 'leave':
                $record = LeaveApplication::with('user')->findOrFail($id);
                $documentName = 'Leave Application';
                break;
            case 'ticket':
                $record = VehicleTripTicket::with('user')->findOrFail($id);
                $documentName = 'Vehicle Trip Ticket';
                break;
            default:
                abort(404, 'Invalid request type');
        }

        $record->update(['status' => $status]);

        // --- RAW EMAIL NOTIFICATION ---
        if ($record->user && $record->user->email) {
            $userEmail = $record->user->email;
            $userName = $record->user->name;
            $dateFiled = $record->created_at->format('F d, Y');
            $statusUpper = strtoupper($status);

            $subject = "Request Update: {$documentName} ({$statusUpper})";
            
            $message = <<<EOT
Dear {$userName},

This is an automated notification regarding your request.

Document: {$documentName}
Date Filed: {$dateFiled}
Status: {$statusUpper}

Please log in to your dashboard for more details.

Regards,
Administrative Office
CHED Regional Office IX
EOT;

            try {
                Mail::raw($message, function ($msg) use ($userEmail, $subject) {
                    $msg->to($userEmail)->subject($subject);
                });
            } catch (\Exception $e) {
                // Log but continue
                Log::error("Email failed for {$userEmail}: " . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', "Request marked as {$status}.");
    }
}