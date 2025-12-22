<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TravelOrder;
use App\Models\SubAllotment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf; // Import PDF facade
use Carbon\Carbon;
use App\Events\TravelOrderUpdated; // <--- Import this
use App\Models\TravelClaim;
use Illuminate\Support\Facades\Mail; // ✨ IMPORTED
use App\Mail\TravelOrderApproved;
use App\Mail\TravelOrderRejected;
use Illuminate\Support\Facades\Log; // IMPORT LOGGING

class TravelOrderController extends Controller
{
    /**
     * Display the "My Requests" Dashboard.
     */
   public function index()
    {
        $requests = TravelOrder::where('user_id', Auth::id())
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($order) => $this->formatOrder($order));

        return Inertia::render('Travel/TravelOrderList', [
            'requests' => $requests,
            'pageTitle' => 'My Travel Requests' // Distinct Title
        ]);
    }

    /**
     * PAGE 2: APPROVALS QUEUE (New Function!)
     * Shows only the requests waiting for the current user's approval.
     */
 public function approvals()
    {
        $user = Auth::user();
        $query = TravelOrder::query();

        // 1. BROADEN THE FILTER (Include History)
        // We fetch EVERYTHING relevant to the role, so the Frontend Tabs can filter them.
        
        if ($user->hasRole('Chief Education Program Specialist') || $user->hasRole('Chief')) {
            // Chief sees: Pending (Action) + Approved/Rejected (History)
            $query->whereIn('status', ['Pending', 'Chief Approved', 'Approved', 'Rejected']);
        } 
        elseif ($user->hasRole('Regional Director') || $user->hasRole('RD')) {
            // RD sees: Chief Approved (Action) + Approved/Rejected (History)
            $query->whereIn('status', ['Chief Approved', 'Approved', 'Rejected']);
        } 
        else {
            // Regular staff shouldn't be here
            $query->where('id', 0); 
        }

        // 2. FETCH DATA
        // ✨ FIX: Removed "where('user_id', '!=', $user->id)" so you can see your own test data
        $requests = $query->with('user')
            ->orderBy('created_at', 'desc') // Newest first
            ->get()
            ->map(fn($order) => $this->formatOrder($order));

        return Inertia::render('Travel/TravelOrderList', [
            'requests' => $requests,
            'pageTitle' => 'Approvals & History'
        ]);
    }
    /**
     * HELPER: Formats the order data for the frontend
     */
    private function formatOrder($order) 
    {
        return [
            'id' => $order->id,
            'ref_no' => 'TO-REQ-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
            'destination' => $order->destination,
            'date_range' => date('M d', strtotime($order->date_from)) . ' - ' . date('M d, Y', strtotime($order->date_to)),
            'total_cost' => $order->total_estimated_cost,
            'status' => match($order->status) {
                'Pending' => 'pending_ceps',
                'Chief Approved' => 'pending_rd',
                'Approved' => 'approved',
                'Rejected' => 'rejected',
                default => 'pending_ceps',
            },
            'travel_order_code' => $order->travel_order_code,
            'rejection_reason' => $order->rejection_reason,
            'reimbursement_status' => $order->travel_order_code ? 'Processing' : 'Not Started',
            'created_at' => $order->created_at->format('Y-m-d'),
            'official_name' => $order->official_name ?? $order->user->name,
        ];
    }
    /**
     * Show the "Request Authority to Travel" form.
     */
    public function create(Request $request)
    {
        // Fetch Fund Sources with Balance > 0
        // Adjust 'balance' logic based on your specific column names in sub_allotments
        $saas = SubAllotment::where('status', 'Active')
                    ->select('id', 'saa_number', 'description', 'total_amount') 
                    ->get()
                    ->map(function($saa) {
                        return [
                            'id' => $saa->id,
                            // specific format for the frontend dropdown
                            'label' => "{$saa->description} ({$saa->saa_number})", 
                        ];
                    });
        

        return Inertia::render('Travel/CreateTravelOrder', [
           'prefilledCode' => $request->query('code', ''),
           
            'fundSources' => $saas, // Matching the prop name in your React component
        ]);
    }

    /**
     * Save the Travel Request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'purpose' => 'required|string',
            'fund_source_id' => 'required|exists:sub_allotments,id',
            
            // Financials
            'est_airfare' => 'nullable|numeric',
            'est_registration' => 'nullable|numeric',
            'est_allowance' => 'nullable|numeric',
            'est_total' => 'required|numeric',

            // Signatories (Optional, can be used for generating PDF later)
            'official_name' => 'nullable|string',
            'position' => 'nullable|string',

            'memo_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('memo_file')) {
            $path = $request->file('memo_file')->store('travel_memos', 'public');
        }

        TravelOrder::create([
            'user_id' => Auth::id(),
            'destination' => $validated['destination'],
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
            'purpose' => $validated['purpose'],
            'sub_allotment_id' => $validated['fund_source_id'], // Mapping fund_source_id -> sub_allotment_id
            
            // Save breakdowns if your DB has these columns (Recommended)
            'est_airfare' => $validated['est_airfare'] ?? 0,
            'est_registration' => $validated['est_registration'] ?? 0,
            'est_per_diem' => $validated['est_allowance'] ?? 0, // Mapping allowance -> per_diem
            'total_estimated_cost' => $validated['est_total'],
            
            'memo_path' => $path,
            'status' => 'Pending', // Default status: Waiting for Chief EPS
        ]);

        TravelOrderUpdated::dispatch();
        return redirect()->route('travel-orders.index')->with('success', 'Travel Request submitted for approval.');
    }

    public function printMemo($id)
{
    $order = TravelOrder::findOrFail($id);
    
    // Check if user is allowed to view this
    if ($order->user_id !== Auth::id()) {
        abort(403);
    }

    // Load a Blade view designed for the "Memorandum"
    $pdf = Pdf::loadView('pdfs.travel-memo', ['order' => $order]);
    return $pdf->stream("Memo-{$order->id}.pdf");
}

public function printAuthority($id)
{
    $order = TravelOrder::findOrFail($id);
    
    if ($order->user_id !== Auth::id()) {
        abort(403);
    }

    // Load a Blade view designed for the "Authority to Travel" grid
    $pdf = Pdf::loadView('pdfs.travel-authority', ['order' => $order]);
    return $pdf->stream("Authority-{$order->id}.pdf");
}
// ... inside TravelOrderController

    /**
     * Display the specific Travel Order for viewing/approval.
     */
    public function show(Request $request, $id)
    {
        $order = TravelOrder::with('subAllotment', 'user')->findOrFail($id);
        $user = Auth::user();

        // 1. DETERMINE ROLE (Matches your Database Strings)
        $userRole = 'staff'; 

        // Check for Regional Director
        if ($user->hasRole('Regional Director') || $user->hasRole('RD')) {
            $userRole = 'rd';
        } 
        // Check for Chief
        elseif ($user->hasRole('Chief Education Program Specialist') || $user->hasRole('Chief')) {
            $userRole = 'chief';
        } 
        
        // TEST MODE: Override via URL (e.g., ?role=rd)
        if ($request->has('role')) {
            $userRole = $request->query('role');
        }

        // 2. CHECK PERMISSIONS (The Logic Switch)
        $canApprove = false;

        // Chief can ONLY approve if status is 'Pending'
        if ($userRole === 'chief' && $order->status === 'Pending') {
            $canApprove = true;
        }

        // RD can ONLY approve if status is 'Chief Approved'
        if ($userRole === 'rd' && $order->status === 'Chief Approved') {
            $canApprove = true;
        }

        // 3. RENDER THE VIEW
            return Inertia::render('Travel/ViewTravelOrder', [
            'order' => [
                'id' => $order->id,
                'ref_no' => 'TO-REQ-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                'official_name' => $order->official_name ?? $order->user->name,
                'position' => $order->position,
                'destination' => $order->destination,
                'date_range' => Carbon::parse($order->date_from)->format('M d') . ' - ' . Carbon::parse($order->date_to)->format('M d, Y'),
                'purpose' => $order->purpose,
                'status' => $order->status,
                
                // Financials
                'est_airfare' => $order->est_airfare,
                'est_registration' => $order->est_registration,
                'est_allowance' => $order->est_per_diem,
                'est_total' => $order->total_estimated_cost,
                'fund_source' => $order->subAllotment ? $order->subAllotment->description : 'Local Funds',
                
                // ✨ ATTACHMENT URL
                'memo_url' => $order->memo_path ? Storage::url($order->memo_path) : null,

                'travel_order_code' => $order->travel_order_code,
                'rejection_reason' => $order->rejection_reason,
            ],
            'isApprover' => $canApprove,
            'userRole' => $userRole, 
        ]);
    }

    /**
     * CHIEF ACTION: Endorse to RD
     * Accessed via Route::middleware(['role:Chief...'])
     */
    public function endorse($id)
    {
        $order = TravelOrder::findOrFail($id);

        if ($order->status !== 'Pending') {
            return back()->with('error', 'This order has already been processed.');
        }

        $order->update([
            'status' => 'Chief Approved',
            // You might want to track who endorsed it
            // 'endorsed_by' => Auth::id(), 
            // 'endorsed_at' => now(),
        ]);
        TravelOrderUpdated::dispatch();
        return back()->with('success', 'Travel Order endorsed to Regional Director.');
    }

    /**
     * RD ACTION: Final Approval & Code Generation
     * Accessed via Route::middleware(['role:Regional Director'])
     */
 public function finalApprove($id)
    {
        // Load user to get email address
        $order = TravelOrder::with('user')->findOrFail($id);

        if ($order->status !== 'Chief Approved') {
            return back()->with('error', 'Status mismatch.');
        }

        // 1. Generate Code
        $code = 'TO-' . now()->format('Y-m-') . str_pad($order->id, 3, '0', STR_PAD_LEFT);

        // 2. Update DB
        $order->update([
            'status' => 'Approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'travel_order_code' => $code
        ]);

        // 3. ✨ SEND EMAIL
        if ($order->user && $order->user->email) {
            try {
                Mail::to($order->user->email)->send(new TravelOrderApproved($order));
            } catch (\Exception $e) {
                // Log error so app doesn't crash if internet is down
                Log::error('Email failed: ' . $e->getMessage());
            }
        }

        // 4. Update UI
        TravelOrderUpdated::dispatch();

        return back()->with('success', 'Approved! Code generated and email sent.');
    }

    /**
     * SHARED ACTION: Reject
     * Can be called by either Chief or RD
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string|max:1000']);
        
        $order = TravelOrder::findOrFail($id);
        
        // Prevent modifying already final orders
        if (in_array($order->status, ['Approved', 'Rejected'])) {
            return back()->with('error', 'Cannot reject a finalized order.');
        }

        $order->update([
            'status' => 'Rejected',
            'rejection_reason' => $request->reason,
            'approved_by' => Auth::id(), // Track who rejected it
        ]);
        if ($order->user && $order->user->email) {
            try {
                Mail::to($order->user->email)->send(new TravelOrderRejected($order));
            } catch (\Exception $e) {
                // Log error so app doesn't crash if internet is down
                Log::error('Email failed: ' . $e->getMessage());
            }
        }
        TravelOrderUpdated::dispatch();
        return back()->with('success', 'Travel Order has been rejected.');
    }
}