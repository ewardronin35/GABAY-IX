<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\UserPersonalLocatorTime;
use App\Models\LocatorSlip; 
use App\Models\LeaveApplication;
use App\Models\VehicleTripTicket;
use Carbon\Carbon;
use Inertia\Inertia;

class PersonnelLocatorController extends Controller
{
   public function index(Request $request)
    {
        $user = Auth::user();
        $currentMonth = now()->format('Y-m');

        // 1. Time Calculations
        $timeRecord = UserPersonalLocatorTime::getOrCreateForMonth($user->id, $currentMonth);
        $consumedSeconds = $timeRecord->time_consumed_seconds;
        $remainingSeconds = $timeRecord->getRemainingSeconds();

        // 2. Active Trip Check
        $activeTrip = LocatorSlip::where('user_id', $user->id)
            ->whereNull('time_arrival')
            ->where('status', '!=', 'rejected')
            ->first();

        if ($activeTrip && $activeTrip->status === 'approved') {
            $hoursRunning = Carbon::parse($activeTrip->time_departure)->diffInHours(now());

        if ($hoursRunning > 8) {
                // FIXED: Use Mail::raw instead of missing ReminderEmail class
                $message = "REMINDER: You have an active trip to {$activeTrip->destination} running for {$hoursRunning} hours. Please mark it as arrived.";
                Mail::raw($message, function($msg) use ($user) {
                    $msg->to($user->email)->subject('Action Required: Ongoing Trip');
                });
            }
        }

        // 4. Fetch Histories
        $locatorHistory = LocatorSlip::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        $ticketHistory = VehicleTripTicket::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        $leaveHistory = LeaveApplication::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();

        return Inertia::render('Personnellocator/UserDashboard', [
            'consumedSeconds' => $consumedSeconds,
            'remainingSeconds' => $remainingSeconds,
            'activeTrip' => $activeTrip,
            'locatorHistory' => $locatorHistory,
            'ticketHistory' => $ticketHistory,
            'leaveHistory' => $leaveHistory,
            'user' => $user
        ]);
    }
// PersonnelLocatorController.php

public function storeTripTicket(Request $request)
{
    // The frontend is now sending matching keys
    $validated = $request->validate([
        'driver_name' => 'required|string',
        'vehicle_plate' => 'required|string', // Matches 'vehicle_plate' from React
        'date_of_travel' => 'required|date',  // Matches 'date_of_travel' from React
        'destination' => 'required|string',
        'purpose' => 'required|string',
        'passengers' => 'required|string',
    ]);

    VehicleTripTicket::create([
        'user_id' => Auth::id(),
        'driver_name' => $validated['driver_name'],
        'vehicle_plate' => $validated['vehicle_plate'],
        'date_of_travel' => $validated['date_of_travel'],
        'destination' => $validated['destination'],
        'purpose' => $validated['purpose'],
        'passengers' => $validated['passengers'],
        'departure_time' => now(),
        'status' => 'pending' // This ensures it shows up in Admin Pending tab
    ]);

    return redirect()->back()->with('success', 'Trip Ticket Request Submitted.');
}
public function store(Request $request)
    {
        // 1. Check for Active Trip
        if (LocatorSlip::where('user_id', Auth::id())->whereNull('time_arrival')->exists()) {
            return redirect()->back()->with('error', 'You have an ongoing trip. Please mark it as arrived first.');
        }

        $validated = $request->validate([
            'purpose' => 'required|string',
            'destination' => 'required|string',
            'nature_of_travel' => 'required|string|in:Official,Personal',
            'representative_signature' => 'nullable|string',
        ]);

        $type = strtolower($validated['nature_of_travel']);
        $isOfficial = $validated['nature_of_travel'] === 'Official';

        // --- ENFORCE 4-HOUR LIMIT FOR PERSONAL TRAVEL ---
        if (!$isOfficial) {
            $currentMonth = now()->format('Y-m');
            $timeRecord = UserPersonalLocatorTime::getOrCreateForMonth(Auth::id(), $currentMonth);
            
            // 4 Hours = 14400 Seconds
            if ($timeRecord->time_consumed_seconds >= 14400) {
                return redirect()->back()->with('error', 'Monthly personal allowance (4 hours) exceeded. Please file a Leave Form.');
            }
        }

        $slip = LocatorSlip::create([
            'user_id' => Auth::id(),
            'date' => now()->toDateString(),
            'time_departure' => now(), 
            'purpose' => $validated['purpose'],
            'destination' => $validated['destination'],
            'type' => $type,
            // Personal is auto-approved ONLY if within limit (checked above), Official needs approval
            // Change to this:
            'status' => 'pending',
            'representative' => $validated['representative_signature'] ?? null,
        ]);

        $msg = $isOfficial 
            ? 'Locator Slip submitted for approval.' 
            : 'Personal travel started. Timer running.';

        return redirect()->back()->with('success', $msg);
    }
public function markArrived($id)
    {
        $slip = LocatorSlip::where('user_id', Auth::id())->findOrFail($id);
        
        // Validation: Cannot arrive if pending
        if ($slip->status === 'pending') {
            return redirect()->back()->with('error', 'Cannot mark arrival. Trip is still pending approval.');
        }

        if ($slip->time_arrival) {
            return redirect()->back()->with('error', 'Trip already ended.');
        }

        $arrival = now();
        $slip->update(['time_arrival' => $arrival]);

        // Logic: Calculate Duration if Personal
        if ($slip->type === 'personal') {
            $departure = Carbon::parse($slip->time_departure);
            $durationSeconds = $departure->diffInSeconds($arrival);

            $currentMonth = now()->format('Y-m');
            $timeRecord = UserPersonalLocatorTime::getOrCreateForMonth(Auth::id(), $currentMonth);
            $timeRecord->addTime($durationSeconds);

            // CHECK 4-HOUR LIMIT
            if ($timeRecord->isOvertime()) {
                $excessMinutes = round($timeRecord->getOvertimeSeconds() / 60);
                return redirect()->back()->with('warning', 
                    "Arrival recorded. NOTE: You exceeded allowance by {$excessMinutes} mins. Please file a Leave Form.");
            }
        }

        // --- EMAIL NOTIFICATION LOGIC ---
        $this->sendArrivalNotification($slip);

        return redirect()->back()->with('success', 'Arrival recorded. Admin notified.');
    }

  private function sendArrivalNotification($slip) {
        $user = Auth::user();
        $recipients = [
            $user->email, 
            'eduarddonor12@gmail.com', // Assistant Admin
            'elolegend1@gmail.com'     // Chief Admin
        ];

        $subject = "Trip Completed: {$user->name}";
        $body = "Employee: {$user->name}\nDestination: {$slip->destination}\nDeparture: {$slip->time_departure}\nArrival: " . now();

        Mail::raw($body, function($message) use ($recipients, $subject) {
            $message->to($recipients)->subject($subject);
        });
    }
}