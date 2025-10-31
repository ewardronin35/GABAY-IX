<?php

namespace App\Http\Controllers;

use App\Models\FinancialRequest;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // 👈 1. ADD THIS
use Illuminate\Support\Facades\DB; // ✨ 1. Import DB facade

class FinancialRequestController extends Controller
{
    // --- USER ACTIONS ---
public function index(Request $request) // ✨ 1. Add Request
    {
        // 2. Get sort/filter params from the URL, with defaults
        $filters = $request->only(['sort', 'direction', 'type', 'status']);
        
        $requests = FinancialRequest::where('user_id', Auth::id())
            ->latest() 
            ->select(
                'id', 
                'title', 
                'request_type', 
                'amount', 
                'status', 
                'created_at', 
                'remarks',
                'budget_approved_at',
                'accounting_approved_at',
                'cashier_paid_at'
            )
            // ✨ 3. Add filtering logic
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'All') {
                    $query->where('status', $status);
                }
            })
            // ✨ 4. Add sorting logic
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            })
            // ✨ 5. Paginate!
            ->paginate(10)
            ->withQueryString(); // This adds all filter/sort params to the pagelinks
            
        return Inertia::render('Financial/Index', [
            'requests' => $requests,
            'filters' => $filters, // Send the active filters back to the page
        ]);
    }
public function budgetAllRequests(Request $request)
    {
        // Get all filters
        $filters = $request->only(['sort', 'direction', 'type', 'status']);
        
        $requests = FinancialRequest::query() // Query all requests
            ->with('user:id,name')
            ->select(
                'id', 
                'user_id', // Need user_id for the user.name column
                'title', 
                'request_type', 
                'amount', 
                'status', 
                'created_at', 
                'remarks',
                'budget_approved_at',
                'accounting_approved_at',
                'cashier_paid_at'
            )
            // Add filtering logic
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'All') {
                    $query->where('status', $status);
                }
            })
            // Add sorting logic
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            })
            ->paginate(10)
            ->withQueryString();
            
        return Inertia::render('Budget/AllRequests', [
            'requests' => $requests,
            'filters' => $filters,
        ]);
    }
    // ✨ 2. ADD THE 'show' METHOD FOR THE "VIEW" BUTTON
public function show(FinancialRequest $financialRequest)
    {
        // 1. Security check
        $isOwner = $financialRequest->user_id === Auth::id();
        $isApprover = Auth::user()->hasAnyRole(['Budget', 'Accounting', 'Cashier', 'Super Admin']);

        if (!$isOwner && !$isApprover) {
            abort(403);
        }

        // 2. Load data for the modal
        $financialRequest->load('user', 'attachments');

        // ✨ 3. FIX: Check which page to render based on URL
        // This is a simple way to check where the user is
        $isBudgetQueue = str_contains(url()->previous(), '/budget/queue');
        $isBudgetAll = str_contains(url()->previous(), '/budget/all-requests');
        
        // --- If viewing from the BUDGET QUEUE page ---
        if ($isBudgetQueue) {
            $requests = FinancialRequest::where('status', 'pending_budget')
                ->with('user:id,name') 
                ->latest()
                ->paginate(10)
                ->withQueryString();
            
            return Inertia::render('Budget/Queue', [
                'requests' => $requests,
                'request' => $financialRequest, // The single request for the modal
                'filters' => [],
            ]);
        }
        
        // --- If viewing from the BUDGET ALL REQUESTS page ---
        if ($isBudgetAll) {
            // (We'll skip re-fetching all requests for now to keep it simple)
            // This will work, but filters will reset on modal close.
            // A full fix is more complex. Let's start here.
            $requests = FinancialRequest::query()->with('user:id,name')->paginate(10);
            
             return Inertia::render('Budget/AllRequests', [
                'requests' => $requests,
                'request' => $financialRequest,
                'filters' => [],
            ]);
        }

        // --- Default: If you are the OWNER ---
        $requests = FinancialRequest::where('user_id', $financialRequest->user_id)
            ->latest() 
            ->paginate(10)
            ->withQueryString();
            
        return Inertia::render('Financial/Index', [
            'requests' => $requests, 
            'request' => $financialRequest,
            'filters' => [], 
        ]);
    }
  public function budgetDashboard()
    {
        // 1. Stat: How many requests this officer has approved
        $approvedCount = FinancialRequest::where('budget_approver_id', Auth::id())
            ->count();

        // 2. Stat: How many requests are waiting for them
        $pendingCount = FinancialRequest::where('status', 'pending_budget')
            ->count();
        
        // ✨ 3. NEW Stat: Total amount approved by this user
        $totalAmountApproved = FinancialRequest::where('budget_approver_id', Auth::id())
            ->sum('amount');

        // ✨ 4. NEW Chart: Pending requests by type
        $typeChart = FinancialRequest::where('status', 'pending_budget')
            ->select('request_type', DB::raw('count(*) as count'))
            ->groupBy('request_type')
            ->get(); // Using get() as this will be a small dataset

        // 3. Chart Data: Submissions over the last 30 days
        $submissionsChart = FinancialRequest::where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date' => (new \DateTime($item->date))->format('M d'),
                'Submissions' => $item->count,
            ]);

        return Inertia::render('Budget/Dashboard', [
            'approvedCount' => $approvedCount,
            'pendingCount' => $pendingCount,
            'totalAmountApproved' => $totalAmountApproved, // ✨ Send new stat
            'submissionsChartData' => $submissionsChart,
            'typeChartData' => $typeChart, // ✨ Send new chart data
        ]);
    }
    // ✨ 4. RENAMED method for the approval queue
    public function budgetQueue(Request $request)
    {
        $filters = $request->only(['sort', 'direction']);

        $pendingRequests = FinancialRequest::where('status', 'pending_budget')
            ->with('user:id,name') 
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount'])) {
                    $query->orderBy($sort, $direction);
                }
            })
            ->paginate(10)
            ->withQueryString();
            
        // ✨ 5. Render the renamed page 'Budget/Queue'
        return Inertia::render('Budget/Queue', [
            'requests' => $pendingRequests,
            'filters' => $filters,
        ]);
    }
    public function store(Request $request)
    {
        Log::info('--- FinancialRequest Store ---');
        Log::info('Incoming request data:', $request->all());
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'attachments' => 'required|array|min:1', // FilePond server IDs
            'attachments.*' => 'string', // Validate each ID is a string
            'request_type' => 'required|string',
        ]);

        $financialRequest = FinancialRequest::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'amount' => $request->amount,
            'description' => $request->description,
            'status' => 'pending_budget',
            'request_type' => $request->request_type,
        ]);

        // Process FilePond attachments
        foreach ($request->attachments as $serverId) {
            // $serverId is now the path from UploadController, e.g., "temp/XYZ.pdf"
            
            // ✨ FIX 1: The $serverId *is* the temporary path
            $tempPath = $serverId; 

            // ✨ FIX 2: Extract the base filename for the new path and DB record
            $newFilename = basename($tempPath);
            $newPath = "attachments/financial/{$financialRequest->id}/{$newFilename}";

            // ✨ FIX 3: Check the 'private' disk, which is where UploadController saved it
            if (Storage::disk('private')->exists($tempPath)) {
                // Move the file from its temp location to the permanent one
                Storage::disk('private')->move($tempPath, $newPath);

                // Create the attachment record
                $financialRequest->attachments()->create([
                    'user_id' => Auth::id(),
                    'disk' => 'private',
                    'filepath' => $newPath,
                    // ✨ FIX 4: Save the filename, not the full temp path
                    'filename' => $newFilename, // Was 'name'
                ]);
            }
        }

        return redirect()->route('financial.index')->with('success', 'Request submitted successfully.');
    }

    // --- APPROVER ACTIONS ---

    public function budgetApprove(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_accounting',
            'budget_approver_id' => Auth::id(),
            'budget_approved_at' => now(),
        ]);
        return back()->with('success', 'Request approved and sent to Accounting.');
    }

    public function accountingApprove(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_cashier',
            'accounting_approver_id' => Auth::id(),
            'accounting_approved_at' => now(),
        ]);
        return back()->with('success', 'Request approved and sent to Cashier.');
    }

    public function cashierPay(FinancialRequest $request)
    {
        $request->update([
            'status' => 'completed',
            'cashier_processor_id' => Auth::id(),
            'cashier_paid_at' => now(),
        ]);
        return back()->with('success', 'Request marked as paid and completed.');
    }

    public function reject(FinancialRequest $request, Request $httpReq)
    {
        $httpReq->validate(['remarks' => 'required|string']);

        $request->update([
            'status' => 'rejected',
            'remarks' => $httpReq->remarks,
        ]);
        return back()->with('error', 'Request has been rejected.');
    }
}