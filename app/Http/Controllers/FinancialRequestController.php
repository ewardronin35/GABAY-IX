<?php

namespace App\Http\Controllers;

use App\Models\FinancialRequest;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BudgetRequestsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Notification;
use App\Notifications\FinancialRequestStatusUpdated;
use App\Notifications\NewRequestInQueue;
use App\Models\User;
use App\Events\FinancialRequestUpdated;

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
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        // 6. Render the *SAME* page, passing in ALL data
        return Inertia::render('Budget/AllRequests', [
            'requests' => $requests,    // The paginated list
            'charts' => $charts,        // The new chart data
            'filters' => $filters,      // All active filters
            'request' => $financialRequest, // Data for the modal (or null)
        ]);
    }
    public function budgetSkipToCashier(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_cashier', // Skip accounting
            'budget_approver_id' => Auth::id(),
            'budget_approved_at' => now(),
            // Add a remark so there is a record of this
            'remarks' => $request->remarks . " [Skipped Accounting by " . Auth::user()->name . "]",
        ]);
        $request->logs()->create([
            'user_id' => Auth::id(),
            'action'  => 'budget_skipped_to_cashier',
            'remarks' => 'Skipped Accounting approval.'
        ]);
        // --- Notify ---
        // 1. Notify the submitter their status changed
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        // 2. Notify all users in the 'Cashier' role
        $cashierUsers = User::role('Cashier')->get();
        Notification::send($cashierUsers, new NewRequestInQueue($request, 'cashier'));
        broadcast(new FinancialRequestUpdated($request, 'Cashier'))->toOthers();
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('success', 'Request approved and skipped straight to Cashier.');
    }

    // ✨ 2. ADD THE 'show' METHOD FOR THE "VIEW" BUTTON
    public function show(FinancialRequest $financialRequest)
    {
        // ⬇️ **START FIX 1: Add PHPDoc and use $user variable**
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 1. Security check
        $isOwner = $financialRequest->user_id === $user->id;
        $isApprover = $user->hasAnyRole(['Budget', 'Accounting', 'Cashier', 'Super Admin']);
        // ⬆️ **END FIX 1**

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
            ->map(fn ($item) => [
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
    // ⬇️ **START FIX 2: Add '?' to make parameter explicitly nullable**
    public function budgetQueue(Request $request, ?FinancialRequest $financialRequest = null)
    // ⬆️ **END FIX 2**
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

        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'attachments' => 'required|array|min:1', // FilePond server IDs
            'attachments.*' => 'string', // Validate each ID is a string
            'request_type' => 'required|string',
        ]);

        // ⬇️ **START FIX 3: Add PHPDoc before $user assignment**
        /** @var \App\Models\User $user */
        $user = Auth::user();
        // ⬆️ **END FIX 3**

        $logAction = 'submitted';
        // --- ✨ START: Role-Based Skip Logic ---
        $data = [
            'user_id' => $user->id,
            'title' => $request->title,
            'amount' => $request->amount,
            'description' => $request->description,
            'request_type' => $request->request_type,
            'status' => 'pending_budget', // Default status
        ];

        $nextRoleToNotify = 'Budget'; // Default role to notify

        if ($user->hasRole('Budget')) { // This line is now error-free for the linter
            $data['status'] = 'pending_accounting';
            $data['budget_approver_id'] = $user->id;
            $data['budget_approved_at'] = now();
            $nextRoleToNotify = 'Accounting';
            $logAction = 'submitted_and_budget_approved';
        } elseif ($user->hasRole('Accounting')) { // This line is now error-free for the linter
            $data['status'] = 'pending_cashier';
            $data['budget_approver_id'] = $user->id; // Auto-approve budget
            $data['budget_approved_at'] = now();
            $data['accounting_approver_id'] = $user->id; // Auto-approve accounting
            $data['accounting_approved_at'] = now();
            $logAction = 'submitted_and_auto_approved';
            $nextRoleToNotify = 'Cashier';
        } elseif ($user->hasRole('Cashier')) { // This line is now error-free for the linter
            $data['status'] = 'completed';
            $data['budget_approver_id'] = $user->id; // Auto-approve budget
            $data['budget_approved_at'] = now();
            $data['accounting_approver_id'] = $user->id; // Auto-approve accounting
            $data['accounting_approved_at'] = now();
            $data['cashier_processor_id'] = $user->id; // Auto-approve cashier
            $data['cashier_paid_at'] = now();
            $logAction = 'submitted_and_auto_approved';
        }
        $financialRequest = FinancialRequest::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'amount' => $request->amount,
            'description' => $request->description,
            'status' => 'pending_budget',
            'request_type' => $request->request_type,
        ]);
        $financialRequest->logs()->create([
            'user_id' => $user->id,
            'action'  => $logAction,
            'remarks' => 'Submitted new request.'
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
        $usersToNotify = User::role($nextRoleToNotify)->get();
        Notification::send($usersToNotify, new NewRequestInQueue($financialRequest, $nextRoleToNotify));
        broadcast(new FinancialRequestUpdated($financialRequest, 'Budget'))->toOthers();
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
        $request->logs()->create([
            'user_id' => Auth::id(), 'action'  => 'budget_approved',
        ]);
        // --- Notify ---
        // 1. Notify the submitter their status changed
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        // 2. Notify all users in the 'Accounting' role
        $accountingUsers = User::role('Accounting')->get();
        Notification::send($accountingUsers, new NewRequestInQueue($request, 'accounting'));
        broadcast(new FinancialRequestUpdated($request, 'Accounting'))->toOthers();
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('success', 'Request approved and sent to Accounting.');
    }

    public function accountingApprove(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_cashier',
            'accounting_approver_id' => Auth::id(),
            'accounting_approved_at' => now(),
        ]);
        $request->logs()->create([
            'user_id' => Auth::id(), 'action'  => 'accounting_approved',
        ]);
        // --- Notify ---
        // 1. Notify the submitter
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        // 2. Notify all users in the 'Cashier' role
        $cashierUsers = User::role('Cashier')->get();
        Notification::send($cashierUsers, new NewRequestInQueue($request, 'cashier'));
        broadcast(new FinancialRequestUpdated($request, 'Cashier'))->toOthers();
        return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
            ->with('success', 'Request approved and sent to Cashier.');
    }
    public function managementViewAll(Request $request, ?FinancialRequest $financialRequest = null)
    {
        // 1. Get all possible filters from the request
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);

        // 2. Create the base query (Identical to budgetAllRequests)
        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            // ... (all other 'when' filters are the same) ...
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
        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

        // --- 4. GET PAGINATED LIST DATA ---
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

        $requests = $listQuery->paginate(10)->withQueryString();

        // 5. Load modal data
        if ($financialRequest) {
            // Since they are managers, they can load any request
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        // 6. Render the new Management page
        // We will create this file in the next step
        return Inertia::render('Management/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest, // Data for the modal
        ]);
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
        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

        // --- 4. GET PAGINATED LIST DATA ---
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
        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

        // --- 4. GET PAGINATED LIST DATA ---
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
        $request->logs()->create([
            'user_id' => Auth::id(), 'action'  => 'cashier_paid (completed)',
        ]);
        broadcast(new FinancialRequestUpdated($request, null))->toOthers();
        // <-- 2. FIX: Redirect to the new "all-requests" page, filtered to the queue
        return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
            ->with('success', 'Request marked as paid and completed.');
    }

    public function reject(FinancialRequest $request, Request $httpReq)
    {
        // ⬇️ **START FIX 4: Add PHPDoc and use $user variable**
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $httpReq->validate(['remarks' => 'required|string']);

        $request->update([
            'status' => 'rejected',
            'remarks' => $httpReq->remarks,
        ]);
        $request->logs()->create([
            'user_id' => $user->id,
            'action'  => 'rejected',
            'remarks' => $httpReq->remarks,
        ]);
        // ✨ FIX: Add intelligent redirect for Cashier
        if ($user->hasRole('Cashier')) { // This line is now error-free for the linter
            return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
                ->with('error', 'Request has been rejected.');
        }

        if ($user->hasRole('Accounting')) { // This line is now error-free for the linter
            return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
                ->with('error', 'Request has been rejected.');
        }
        // ⬆️ **END FIX 4**

        broadcast(new FinancialRequestUpdated($request, null))->toOthers();
        // Default to budget
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('error', 'Request has been rejected.');
    }
}