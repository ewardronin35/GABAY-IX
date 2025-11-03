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
    public function index(Request $request) 
    {
        $filters = $request->only(['sort', 'direction', 'type', 'status']);
        $tab = $request->input('tab', 'my-submissions');
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
            ->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
                $direction = $filters['direction'] ?? 'desc';
                if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                    $query->orderBy($sort, $direction);
                }
            })
            ->paginate(10)
            ->withQueryString(); 

        return Inertia::render('Financial/Index', [
            'requests' => $requests,
            'filters' => $filters, 
        ]);
    }

    public function budgetExport(Request $request)
    {
        $filters = $request->only(['sort', 'direction', 'type', 'status']);
        $filename = 'budget_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }
    public function budgetAllRequests(Request $request, ?FinancialRequest $financialRequest = null)
    {
        $tab = $request->input('tab', 'my-submissions');
        $filters = $request->only([
            'sort', 
            'direction', 
            'type', 
            'status',
            'start_date',
            'end_date'
        ]);

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

        if ($financialRequest) {
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        return Inertia::render('Budget/AllRequests', [
            'requests' => $requests,    
            'charts' => $charts,        
            'filters' => $filters,      
            'request' => $financialRequest, 
            'tab' => $tab,
        ]);
    }
    public function budgetSkipToCashier(FinancialRequest $request)
    {
        $request->update([
            'status' => 'pending_cashier', 
            'budget_approver_id' => Auth::id(),
            'budget_approved_at' => now(),
            'remarks' => $request->remarks . " [Skipped Accounting by " . Auth::user()->name . "]",
        ]);
        $request->logs()->create([
            'user_id' => Auth::id(),
            'action'  => 'budget_skipped_to_cashier',
            'remarks' => 'Skipped Accounting approval.'
        ]);
        
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        $cashierUsers = User::role('Cashier')->get();
        Notification::send($cashierUsers, new NewRequestInQueue($request, 'cashier'));
        broadcast(new FinancialRequestUpdated($request, 'Cashier'))->toOthers();
        if (Auth::user()->hasRole('RD') || Auth::user()->hasRole('Chief') || Auth::user()->hasRole('Super Admin')) {
             return redirect()->route('management.financial.all-requests', ['status' => 'pending'])
                             ->with('success', 'Request approved and skipped straight to Cashier.');
        }
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('success', 'Request approved and skipped straight to Cashier.');
    }

  
    public function budgetDashboard()
    {
        $approvedCount = FinancialRequest::where('budget_approver_id', Auth::id())
            ->count();
        $pendingCount = FinancialRequest::where('status', 'pending_budget')
            ->count();
        $totalAmountApproved = FinancialRequest::where('budget_approver_id', Auth::id())
            ->sum('amount');
        $typeChart = FinancialRequest::where('status', 'pending_budget')
            ->select('request_type', DB::raw('count(*) as count'))
            ->groupBy('request_type')
            ->get(); 
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
            'totalAmountApproved' => $totalAmountApproved,
            'submissionsChartData' => $submissionsChart,
            'typeChartData' => $typeChart,
        ]);
    }

    public function budgetQueue(Request $request, ?FinancialRequest $financialRequest = null)
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

        if ($financialRequest) {
            $financialRequest->load('user', 'attachments', 'logs.user'); // Load logs.user
        }

        return Inertia::render('Budget/Queue', [
            'requests' => $pendingRequests,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }

public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'attachments' => 'required|array|min:1',
            'attachments.*' => 'string',
            'request_type' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $logAction = 'submitted';
        
        // Base data for the new request
        $data = [
            'user_id' => $user->id,
            'title' => $request->title,
            'amount' => $request->amount,
            'description' => $request->description,
            'request_type' => $request->request_type,
            'status' => 'pending_budget', // Default: send to Budget
        ];

        $nextRoleToNotify = 'Budget'; // Default: notify Budget team

        // YOUR LOGIC: Budget automatic goes to Accounting
        if ($user->hasRole('Budget')) { 
            $data['status'] = 'pending_accounting';
            $data['budget_approver_id'] = $user->id;
            $data['budget_approved_at'] = now();
            $nextRoleToNotify = 'Accounting';
            $logAction = 'submitted_and_budget_approved';
        } 
        // YOUR LOGIC: Accounting goes to Budget
        elseif ($user->hasRole('Accounting')) { 
            $data['status'] = 'pending_budget'; // <-- This is your new rule
            $nextRoleToNotify = 'Budget';
            $logAction = 'submitted_for_budget_approval';
        } 
        // YOUR LOGIC: Cashier auto approves
        elseif ($user->hasRole('Cashier')) { 
            $data['status'] = 'completed';
            $data['budget_approver_id'] = $user->id; 
            $data['budget_approved_at'] = now();
            $data['accounting_approver_id'] = $user->id; 
            $data['accounting_approved_at'] = now();
            $data['cashier_processor_id'] = $user->id; 
            $data['cashier_paid_at'] = now();
            $logAction = 'submitted_and_auto_approved';
            $nextRoleToNotify = null; // No one to notify
        }
        // RD/Chief/Super Admin submit as a normal user (no auto-approval)
        elseif ($user->hasRole('RD') || $user->hasRole('Chief') || $user->hasRole('Super Admin')) {
            $data['status'] = 'pending_budget';
            $nextRoleToNotify = 'Budget';
            $logAction = 'submitted';
        }
        
        $financialRequest = FinancialRequest::create($data);

        $financialRequest->logs()->create([
            'user_id' => $user->id,
            'action'  => $logAction,
            'remarks' => 'Submitted new request.'
        ]);
        
        foreach ($request->attachments as $serverId) {
            $tempPath = $serverId; 
            $newFilename = basename($tempPath);
            $newPath = "attachments/financial/{$financialRequest->id}/{$newFilename}";

            if (Storage::disk('private')->exists($tempPath)) {
                Storage::disk('private')->move($tempPath, $newPath);
                $financialRequest->attachments()->create([
                    'user_id' => Auth::id(),
                    'disk' => 'private',
                    'filepath' => $newPath,
                    'filename' => $newFilename,
                ]);
            }
        }
        
        if($nextRoleToNotify) {
            $usersToNotify = User::role($nextRoleToNotify)->get();
            Notification::send($usersToNotify, new NewRequestInQueue($financialRequest, $nextRoleToNotify));
            broadcast(new FinancialRequestUpdated($financialRequest, $nextRoleToNotify))->toOthers();
        }

        // This redirect is correct. It sends you back to your personal "My Requests" page.
        return redirect()->route('financial.index')->with('success', 'Request submitted successfully.');
    }



    // --- APPROVER ACTIONS ---

  public function budgetApprove(FinancialRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        $submitter = $request->user; 
        
        $nextStatus = 'pending_accounting'; // Default next step
        $nextRoleToNotify = 'Accounting';

        // YOUR LOGIC: If submitter was Accounting, next step is Cashier
        if ($submitter->hasRole('Accounting')) {
            $nextStatus = 'pending_cashier';
            $nextRoleToNotify = 'Cashier';
        }

        $request->update([
            'status' => $nextStatus, // Use the dynamic next status
            'budget_approver_id' => $user->id,
            'budget_approved_at' => now(),
        ]);
        $request->logs()->create([
            'user_id' => $user->id, 'action'  => 'budget_approved',
        ]);
        
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        
        $usersToNotify = User::role($nextRoleToNotify)->get();
        Notification::send($usersToNotify, new NewRequestInQueue($request, strtolower($nextRoleToNotify)));
        broadcast(new FinancialRequestUpdated($request, $nextRoleToNotify))->toOthers();
        
        // ⬇️ **THIS IS THE MISSING LOGIC FOR YOU (RD/CHIEF)** ⬇️
        // Check for roles and redirect to the correct dashboard
        if ($user->hasRole('RD') || $user->hasRole('Chief') || $user->hasRole('Super Admin')) {
             return redirect()->route('management.financial.all-requests', ['status' => 'pending'])
                             ->with('success', "Request approved and sent to $nextRoleToNotify.");
        }

        // Default redirect for the Budget role
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('success', "Request approved and sent to $nextRoleToNotify.");
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
        
        $request->user->notify(new FinancialRequestStatusUpdated($request));
        $cashierUsers = User::role('Cashier')->get();
        Notification::send($cashierUsers, new NewRequestInQueue($request, 'cashier'));
        broadcast(new FinancialRequestUpdated($request, 'Cashier'))->toOthers();
        return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
            ->with('success', 'Request approved and sent to Cashier.');
    }
    
    public function managementViewAll(Request $request, ?FinancialRequest $financialRequest = null)
    {
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);

        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'all' && $type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            // This 'pending' filter logic is correct
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status === 'pending') {
                    $query->whereIn('status', ['pending_budget', 'pending_accounting', 'pending_cashier']);
                } elseif ($status !== 'all' && $status !== 'All') {
                    $query->where('status', $status);
                }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });

        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

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

        if ($financialRequest) {
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        return Inertia::render('Management/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }


    public function accountingAllRequests(Request $request, ?FinancialRequest $financialRequest = null)
    {
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);

        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                 if ($status === 'pending') {
                    $query->whereIn('status', ['pending_budget', 'pending_accounting', 'pending_cashier']);
                } elseif ($status !== 'all' && $status !== 'All') {
                    $query->where('status', $status);
                }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });

        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

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

        if ($financialRequest) {
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        return Inertia::render('Accounting/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }

    public function accountingExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'accounting_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

    public function accountingPdfExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = (new BudgetRequestsExport($filters))->query();
        $requests = $query->get();
        $filename = 'accounting_report_' . now()->format('Y-m-d') . '.pdf';

        $pdf = Pdf::loadView('exports.budget-report-pdf', ['requests' => $requests]);
        return $pdf->download($filename);
    }


    public function budgetReportPage(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = FinancialRequest::query()
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                 if ($status === 'pending') {
                    $query->whereIn('status', ['pending_budget', 'pending_accounting', 'pending_cashier']);
                } elseif ($status !== 'all' && $status !== 'All') {
                    $query->where('status', $status);
                }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });

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

        return Inertia::render('Budget/Reports', [
            'filters' => $filters,
            'charts' => $charts
        ]);
    }

    public function budgetExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'budget_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

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
        $filters = $request->only([
            'sort', 'direction', 'type', 'status', 'start_date', 'end_date'
        ]);

        $baseQuery = FinancialRequest::query()
            ->with('user:id,name')
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type !== 'All') {
                    $query->where('request_type', $type);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                 if ($status === 'pending') {
                    $query->whereIn('status', ['pending_budget', 'pending_accounting', 'pending_cashier']);
                } elseif ($status !== 'all' && $status !== 'All') {
                    $query->where('status', $status);
                }
            })
            ->when($filters['start_date'] ?? null, function ($query, $start_date) {
                $query->where('created_at', '>=', $start_date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $end_date) {
                $query->where('created_at', '<=', $end_date . ' 23:59:59');
            });

        $charts = [
            'typeChart' => (clone $baseQuery)->select('request_type', DB::raw('count(*) as count'))->groupBy('request_type')->get(),
            'statusChart' => (clone $baseQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
            'amountByTypeChart' => (clone $baseQuery)->select('request_type', DB::raw('sum(amount) as total'))->groupBy('request_type')->get(),
        ];

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

        if ($financialRequest) {
            $financialRequest->load('user', 'attachments', 'logs.user');
        }

        return Inertia::render('Cashier/AllRequests', [
            'requests' => $requests,
            'charts' => $charts,
            'filters' => $filters,
            'request' => $financialRequest,
        ]);
    }

    public function cashierExcelExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $filename = 'cashier_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new BudgetRequestsExport($filters), $filename);
    }

    public function cashierPdfExport(Request $request)
    {
        $filters = $request->only(['type', 'status', 'start_date', 'end_date']);
        $query = (new BudgetRequestsExport($filters))->query();
        $requests = $query->get();
        $filename = 'cashier_report_' . now()->format('Y-m-d') . '.pdf';

        $pdf = Pdf::loadView('exports.budget-report-pdf', ['requests' => $requests]);
        return $pdf->download($filename);
    }


    public function cashierPay(FinancialRequest $request)
    {
        $request->update([
            'status' => 'completed', 
            'cashier_processor_id' => Auth::id(),
            'cashier_paid_at' => now(),
        ]);
        $request->logs()->create([
            'user_id' => Auth::id(), 'action'  => 'cashier_paid (completed)',
        ]);
        broadcast(new FinancialRequestUpdated($request, null))->toOthers();
        return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
            ->with('success', 'Request marked as paid and completed.');
    }


    // ⬇️ **START FIX 3: The `reject` function** ⬇️
    // This fixes the `Route [Budget.all-requests] not defined.` error
    public function reject(FinancialRequest $request, Request $httpReq)
    {
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

        // Redirect for Cashier
        if ($user->hasRole('Cashier')) { 
            return redirect()->route('cashier.all-requests', ['status' => 'pending_cashier'])
                ->with('error', 'Request has been rejected.');
        }

        // Redirect for Accounting
        if ($user->hasRole('Accounting')) { 
            return redirect()->route('accounting.all-requests', ['status' => 'pending_accounting'])
                ->with('error', 'Request has been rejected.');
        }
       
if ($user->hasRole('RD') || $user->hasRole('Chief') || $user->hasRole('Super Admin')) {
             return redirect()->route('management.financial.all-requests', ['status' => 'pending'])
                             ->with('error', 'Request has been rejected.');
        }
        broadcast(new FinancialRequestUpdated($request, null))->toOthers();
        
        // Default redirect for the Budget role
        return redirect()->route('budget.all-requests', ['status' => 'pending_budget'])
            ->with('error', 'Request has been rejected.');
    }
    
    // ⬆️ **END FIX 3** ⬆️
}