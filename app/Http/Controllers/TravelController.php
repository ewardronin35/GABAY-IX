<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TravelOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SubAllotment; // ✅ Import this
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TravelController extends Controller
{
    /**
     * Show the Unified Request Form
     */
    public function create()
    {
        $saas = SubAllotment::where('status', 'Active')
                    ->select('id', 'saa_number', 'description')
                    ->get();

        return Inertia::render('Travel/Create', [
            'saa_list' => $saas // ✅ Pass to frontend
        ]);
    }

    /**
     * Save the Request (File + Data)
     */
    public function store(Request $request)
    {
        // 1. Validate Everything
        $validated = $request->validate([
            'memo_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB Max
            'destination' => 'required|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'purpose' => 'required|string',
            'fund_source_id' => 'required',
            'total_estimated' => 'nullable|numeric',
            'fund_source_id' => 'required|exists:sub_allotments,id', // ✅ Validates ID exists
        ]);

        // 2. Handle File Upload
        $path = null;
        if ($request->hasFile('memo_file')) {
            $path = $request->file('memo_file')->store('travel_memos', 'public');
        }

        // 3. Create Record
        TravelOrder::create([
            'user_id' => Auth::id(),
            'destination' => $validated['destination'],
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
            'purpose' => $validated['purpose'],
            'fund_source_id' => $validated['fund_source_id'],
            'total_estimated_cost' => $validated['total_estimated'] ?? 0,
            'memo_path' => $path,
            'status' => 'Pending', // Waiting for RD
        ]);

        return redirect()->route('dashboard')->with('success', 'Travel Request Created Successfully!');
    }
}