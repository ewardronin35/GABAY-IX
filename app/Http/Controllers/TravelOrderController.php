<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TravelOrder; // You'll need to create this model next
use App\Models\SubAllotment; // Assuming you have SAA models
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TravelOrderController extends Controller
{
    /**
     * Show the "Request Authority to Travel" form.
     */
    public function create()
    {
        // Pass SAAs (Fund Sources) to the dropdown
        // $saas = SubAllotment::where('status', 'Active')->get(); 
        
        return Inertia::render('Travel/CreateTravelOrder', [
            'saa_list' => [], // Replace with $saas when ready
        ]);
    }

    /**
     * Save the Travel Request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string|max:255',
            'date_range.from' => 'required|date',
            'date_range.to' => 'required|date|after_or_equal:date_range.from',
            'purpose' => 'required|string',
            'fund_source_id' => 'required',
            'est_total' => 'required|numeric',
        ]);

        // Create the record
        TravelOrder::create([
            'user_id' => Auth::id(),
            'destination' => $validated['destination'],
            'date_from' => $validated['date_range']['from'],
            'date_to' => $validated['date_range']['to'],
            'purpose' => $validated['purpose'],
            'fund_source_id' => $validated['fund_source_id'],
            'total_estimated_cost' => $validated['est_total'],
            'status' => 'Pending', // Waiting for RD Approval
        ]);

        return redirect()->route('dashboard')->with('success', 'Travel Request submitted for approval.');
    }
}