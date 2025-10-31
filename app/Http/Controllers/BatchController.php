<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Scholar;
use App\Models\GlobalAcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BatchController extends Controller
{

    // --- DASHBOARD PAGES ---
    // These methods just show the right UI for each role

    /**
     * Show the main dashboard for the Scholarship Admin
     * to create and view batches.
     */
    public function adminDashboard(Request $request)
    {
        // TODO: Pass batches, scholars, and academic periods as props
        $batches = Batch::with('academicPeriod', 'creator')->latest()->get();
        
        return Inertia::render('Admin/Batches/Index', [
             'batches' => $batches
        ]);
    }

    /**
     * Show the Chief's dashboard with batches to endorse.
     */
    public function chiefDashboard(Request $request)
    {
        $pendingBatches = Batch::with('academicPeriod', 'creator')
            ->where('batch_status', 'pending_chief')
            ->latest()
            ->get();
            
        return Inertia::render('Chief/Dashboard', [
            'pendingBatches' => $pendingBatches
        ]);
    }

    /**
     * Show the RD's dashboard with batches to approve.
     */
    public function rdDashboard(Request $request)
    {
        $pendingBatches = Batch::with('academicPeriod', 'creator', 'chiefApprover')
            ->where('batch_status', 'pending_rd')
            ->latest()
            ->get();
            
        return Inertia::render('RD/Dashboard', [
            'pendingBatches' => $pendingBatches
        ]);
    }

    /**
     * Show the Cashier's dashboard with batches to pay.
     */
    public function cashierDashboard(Request $request)
    {
        $pendingBatches = Batch::with('academicPeriod', 'creator', 'rdApprover')
            ->where('batch_status', 'approved')
            ->latest()
            ->get();
            
        return Inertia::render('Cashier/Dashboard', [
            'pendingBatches' => $pendingBatches
        ]);
    }


    // --- BATCH CREATION ---

    /**
     * Show the page to create a new batch.
     */
    public function create()
    {
        // You need to pass all eligible scholars and available academic periods
        // This is a simplified query. You'll need to make it more complex
        // to find scholars who are "Active" and not already in a batch for this period.
        $scholars = Scholar::where('scholar_status', 'Active')->get(); 
        $periods = GlobalAcademicPeriod::all();

        return Inertia::render('Admin/Batches/Create', [
            'scholars' => $scholars,
            'academicPeriods' => $periods,
        ]);
    }

    /**
     * Store a new batch (Payroll or NOA) in the database.
     * This is called when the Scholarship Admin clicks "Submit to Chief".
     */
    public function store(Request $request)
    {
        $request->validate([
            'global_academic_period_id' => 'required|exists:global_academic_periods,id',
            'batch_type' => 'required|in:PAYROLL,NOA',
            'program_type' => 'required|string',
            'scholar_ids' => 'required|array|min:1',
            'scholar_ids.*' => 'exists:scholars,id', // Ensure all IDs are valid
            'total_amount' => 'nullable|numeric',
        ]);

        // 1. Create the Batch
        $batch = Batch::create([
            'global_academic_period_id' => $request->global_academic_period_id,
            'batch_type' => $request->batch_type,
            'program_type' => $request->program_type,
            'total_amount' => $request->total_amount,
            'batch_status' => 'pending_chief',
            'created_by_user_id' => Auth::id(),
        ]);

        // 2. Attach all the scholars to the batch
        foreach ($request->scholar_ids as $scholarId) {
            $batch->batchScholars()->create(['scholar_id' => $scholarId]);
        }

        // 3. TODO: Send email notification to Chief

        return redirect()->route('admin.batches.dashboard')->with('success', 'Batch created and submitted to Chief.');
    }


    // --- WORKFLOW ACTIONS ---

    /**
     * Endorse a batch (Chief's action)
     * Moves status from 'pending_chief' to 'pending_rd'.
     */
    public function endorse(Batch $batch, Request $request)
    {
        $batch->update([
            'batch_status' => 'pending_rd',
            'chief_approver_id' => Auth::id(),
        ]);

        // TODO: Send email notification to RD

        return redirect()->route('chief.dashboard')->with('success', 'Batch endorsed and sent to RD.');
    }

    /**
     * Approve a batch (RD's action)
     * Moves status from 'pending_rd' to 'approved'.
     */
    public function approve(Batch $batch, Request $request)
    {
        $batch->update([
            'batch_status' => 'approved',
            'rd_approver_id' => Auth::id(),
        ]);

        // TODO: Send email to Cashier
        // TODO: Send email to Scholars (Good news!)

        // If it's an NOA batch, this is where you create the NOA records
        if ($batch->batch_type === 'NOA') {
            foreach ($batch->batchScholars as $batchScholar) {
                // Create the Notice of Award record
                \App\Models\NoticeOfAward::create([
                    'scholar_id' => $batchScholar->scholar_id,
                    'batch_id' => $batch->id,
                    'status' => 'pending_acceptance', // Ready for scholar to see
                ]);

                // TODO: Send email to this specific scholar
            }
        }

        return redirect()->route('rd.dashboard')->with('success', 'Batch approved and sent to Cashier.');
    }

    /**
     * Mark a batch as paid (Cashier's action)
     * Moves status from 'approved' to 'paid'.
     */
    public function pay(Batch $batch, Request $request)
    {
        $batch->update([
            'batch_status' => 'paid',
            'cashier_processor_id' => Auth::id(),
        ]);

        // TODO: Send email to Scholars (Stipend sent!)

        return redirect()->route('cashier.dashboard')->with('success', 'Batch marked as paid.');
    }

    /**
     * Return a batch (Chief or RD action)
     * Moves status to 'returned'.
     */
    public function returnBatch(Batch $batch, Request $request)
    {
        $request->validate(['remarks' => 'required|string|min:10']);

        $batch->update([
            'batch_status' => 'returned',
            'remarks' => $request->remarks,
        ]);

        // TODO: Send email to Scholarship Admin with the remarks

        return back()->with('success', 'Batch returned to Admin with remarks.');
    }
}