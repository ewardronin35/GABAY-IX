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
use Maatwebsite\Excel\Facades\Excel; // ✨ 1. Import Excel
use App\Exports\BudgetRequestsExport; // ✨ 2. Import your new Export class
use Barryvdh\DomPDF\Facade\Pdf; // ✨ 1. Import the PDF facade

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

    public function budgetExport(Request $request)
    {
        // Get the same filters from the request
        $filters = $request->only(['sort', 'direction', 'type', 'status']);
        
        $filename = 'budget_report_' . now()->format('Y-m-d') . '.xlsx';

        // Pass the filters to the export class and download
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }
  public function budgetAllRequests(Request $request, ?FinancialRequest $financialRequest = null)
    {
        // 1. Get all possible filters from the request
        $filters = $request->only([
            'sort', 
            'direction', 
            'type', 
            'status', 
            'start_date', 
            'end_date'
        ]);
        
        // 2. Create the base query using all filters EXCEPT sort/pagination
        // This query will be used for both charts and the list
        $baseQuery = FinancialRequest::query()
            ->with('user:id,name') // Eager load user for all queries
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
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });
            
        // --- 3. GET CHART DATA ---
        // We clone the base query to run separate aggregate queries
        $charts = [
            'typeChart' => (clone $baseQuery)
                ->select('request_type', DB::raw('count(*) as count'))
                ->groupBy('request_type')
                ->get(),
            'statusChart' => (clone $baseQuery)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'amountByTypeChart' => (clone $baseQuery)
                ->select('request_type', DB::raw('sum(amount) as total'))
                ->groupBy('request_type')
                ->get(),
        ];
        
        // --- 4. GET PAGINATED LIST DATA ---
        // Now we clone the base query again to get the paginated list
        $listQuery = (clone $baseQuery)
            ->select(
                'id', 
                'user_id', 
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
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            });

        // 4. Paginate the results
        $requests = $listQuery->paginate(10)->withQueryString();
            
        // 5. Load modal data if a request ID is in the URL
        if ($financialRequest) {
            $financialRequest->load('user', 'attachments');
        }

        // 6. Render the *SAME* page, passing in ALL data
        return Inertia::render('Budget/AllRequests', [
            'requests' => $requests,    // The paginated list
            'charts' => $charts,        // The new chart data
            'filters' => $filters,      // All active filters
            'request' => $financialRequest, // Data for the modal (or null)
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
    public function budgetQueue(Request $request, FinancialRequest $financialRequest = null)
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
            
        // ✨ 2. If a financialRequest was passed in the URL, load its data
        if ($financialRequest) {
            $financialRequest->load('user', 'attachments');
        }

        return Inertia::render('Budget/Queue', [
            'requests' => $pendingRequests,
            'filters' => $filters,
            'request' => $financialRequest, // ✨ 3. Pass the modal data (or null) to the page
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

        // FIX: Redirect to the main queue route, not 'back()'.
        // This closes the modal and refreshes the list.
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
                         ->with('success', 'Request approved and sent to Accounting.');
    }

   public function accountingApprove(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_cashier', // <-- 1. FIX: Set next status
            'accounting_approver_id' => Auth::id(),
            'accounting_approved_at' => now(),
        ]);
        
        // <-- 2. FIX: Redirect to the new "all-requests" page, filtered to the queue
        return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
                         ->with('success', 'Request approved and sent to Cashier.');
    }

   
public function accountingAllRequests(Request $request, ?FinancialRequest $financialRequest = null)
    {
        // 1. Get all possible filters from the request
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);
        
        // 2. Create the base query
        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') { $query->where('request_type', $type); }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'All') { $query->where('status', $status); }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });
            
        // --- 3. GET CHART DATA ---
        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];
        
        // --- 4. GET PAGINATED LIST DATA ---
        $listQuery = (clone $baseQuery)
            ->select(
                'id', 'user_id', 'title', 'request_type', 'amount', 'status', 
                'created_at', 'remarks', 'budget_approved_at', 
                'accounting_approved_at', 'cashier_paid_at'
            )
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            });

        $requests = $listQuery->paginate(10)->withQueryString();
            
        // 5. Load modal data
        if ($financialRequest) {
            $financialRequest->load('user', 'attachments');
        }

        // 6. Render the new Accounting page
        return Inertia::render('Accounting/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }

    // ✨ --- 2. ADD NEW EXPORT METHODS for Accounting --- ✨
    public function accountingExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'accounting_report_' . now()->format('Y-m-d') . '.xlsx';
        
        // We can re-use the same export class!
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

    public function accountingPdfExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = (new BudgetRequestsExport($filters))->query();
        $requests = $query->get();
        $filename = 'accounting_report_' . now()->format('Y-m-d') . '.pdf';
        
        // We can re-use the same PDF view!
        $pdf = Pdf::loadView('exports.budget-report-pdf', ['requests' => $requests]);
        return $pdf->download($filename);
    }


    // ✨ --- 3. FIX EXISTING APPROVAL/REJECT METHODS --- ✨
 
 
   public function budgetReportPage(Request $request)
    {
        // 1. Get all filters from the URL
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);

        // 2. Create the base query using the filters
        $query = FinancialRequest::query()
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') { $query->where('request_type', $type); }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'All') { $query->where('status', $status); }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });

        // 3. Get Chart Data
        $charts = [
            'typeChart' => (clone $query)
                ->select('request_type', DB::raw('count(*) as count'))
                ->groupBy('request_type')
                ->get(),
            'statusChart' => (clone $query)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'amountByTypeChart' => (clone $query)
                ->select('request_type', DB::raw('sum(amount) as total'))
                ->groupBy('request_type')
                ->get(),
        ];

        // 4. Render the new Reports page component
        return Inertia::render('Budget/Reports', [
            'filters' => $filters,
            'charts' => $charts
        ]);
    }

    // ✨ 4. RENAME 'budgetExport' to 'budgetExcelExport' and ADD FILTERS
 public function budgetExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'budget_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

    // ✨ 5. ADD THE NEW PDF EXPORT METHOD
    public function budgetPdfExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = (new BudgetRequestsExport($filters))->query();
        $requests = $query->get();
        $filename = 'budget_report_' . now()->format('Y-m-d') . '.pdf';
        $pdf = Pdf::loadView('exports.budget-report-pdf', [
            'requests' => $requests
        ]);
        return $pdf->download($filename);
    }
    public function cashierAllRequests(Request $request, ?FinancialRequest $financialRequest = null)
    {
        // 1. Get all possible filters
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);
        
        // 2. Create the base query
        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            // (All 'when' filters for type, status, start_date, end_date are identical)
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') { $query->where('request_type', $type); }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'All') { $query->where('status', $status); }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });
            
        // --- 3. GET CHART DATA ---
        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];
        
        // --- 4. GET PAGINATED LIST DATA ---
        $listQuery = (clone $baseQuery)
            ->select(
                'id', 'user_id', 'title', 'request_type', 'amount', 'status', 
                'created_at', 'remarks', 'budget_approved_at', 
                'accounting_approved_at', 'cashier_paid_at'
            )
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            });

        $requests = $listQuery->paginate(10)->withQueryString();
            
        // 5. Load modal data
        if ($financialRequest) {
            $financialRequest->load('user', 'attachments');
        }

        // 6. Render the new Cashier page
        return Inertia::render('Cashier/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }

    // ✨ --- 2. ADD NEW EXPORT METHODS for Cashier --- ✨
    public function cashierExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'cashier_report_' . now()->format('Y-m-d') . '.xlsx';
        
        // We can re-use the same export class!
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

    public function cashierPdfExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = (new BudgetRequestsExport($filters))->query();
        $requests = $query->get();
        $filename = 'cashier_report_' . now()->format('Y-m-d') . '.pdf';
        
        // We can re-use the same PDF view!
        $pdf = Pdf::loadView('exports.budget-report-pdf', ['requests' => $requests]);
        return $pdf->download($filename);
    }


    // ✨ --- 3. FIX EXISTING APPROVAL/REJECT METHODS --- ✨
    
    // ... (accountingApprove is unchanged) ...

    public function cashierPay(FinancialRequest $request)
    {
        $request->update([
            'status' => 'completed', // <-- 1. FIX: Set final status
            'cashier_processor_id' => Auth::id(),
            'cashier_paid_at' => now(),
        ]);
        
        // <-- 2. FIX: Redirect to the new "all-requests" page, filtered to the queue
        return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
                         ->with('success', 'Request marked as paid and completed.');
    }

    public function reject(FinancialRequest $request, Request $httpReq)
    {
        $httpReq->validate(['remarks' => 'required|string']);

        $request->update([
            'status' => 'rejected',
            'remarks' => $httpReq->remarks,
        ]);
        
        // ✨ FIX: Add intelligent redirect for Cashier
        if (Auth::user()->hasRole('Cashier')) {
            return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
                             ->with('error', 'Request has been rejected.');
        }
        
        if (Auth::user()->hasRole('Accounting')) {
            return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
                             ->with('error', 'Request has been rejected.');
        }
        
        // Default to budget
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
                         ->with('error', 'Request has been rejected.');
    }
}
