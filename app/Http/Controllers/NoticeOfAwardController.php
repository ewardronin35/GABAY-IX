<?php

namespace App\Http\Controllers;

use App\Models\NoticeOfAward;
use App\Models\Scholar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NoticeOfAwardController extends Controller
{
    /**
     * Show the scholar their pending Notice of Award.
     * This will be the main page for a new scholar until they accept.
     */
    public function show()
    {
        $user = Auth::user();
        
        // CRITICAL: Find the scholar record associated with the logged-in user.
        // I am assuming you have a 'scholar' relationship on your User model.
        // If not, you must implement this relationship first.
        
        // Find the User's associated Scholar record
        $scholar = $user->scholar; // <--- This assumes User->scholar() exists
        
        if (!$scholar) {
             // Handle users who are not scholars (e.g., Admins)
             return redirect()->route('dashboard');
        }

        // Find the NOA for this scholar that is 'pending_acceptance'
        $pendingNoa = NoticeOfAward::with('batch.academicPeriod')
            ->where('scholar_id', $scholar->id)
            ->where('status', 'pending_acceptance')
            ->first();

        // If they don't have a pending NOA, just redirect to their regular dashboard
        if (!$pendingNoa) {
            return redirect()->route('dashboard'); // Or whatever your main scholar dashboard route is
        }

        // Show the NOA acceptance page
        return Inertia::render('Scholar/AcceptNoa', [
            'noa' => $pendingNoa,
        ]);
    }

    /**
     * Mark the Notice of Award as 'accepted' by the scholar.
     * This action officially makes them an 'Active Scholar'.
     */
    public function accept(NoticeOfAward $noa, Request $request)
    {
        $user = Auth::user();
        $scholar = $user->scholar; // <--- Assumes User->scholar() relationship

        // Security check: Make sure this NOA actually belongs to the logged-in scholar
        if ($noa->scholar_id !== $scholar->id) {
            abort(403, 'Unauthorized action.');
        }

        // 1. Update the NOA status
        $noa->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // 2. CRITICAL STEP: Update the main scholar record
        // This is what makes them eligible for payroll
        $scholar->update([
            'scholar_status' => 'Active', // Or whatever your 'Active' status is called
        ]);

        return redirect()->route('dashboard')->with('success', 'Notice of Award accepted! Welcome to the program.');
    }
}