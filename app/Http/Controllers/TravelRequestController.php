<?php

namespace App\Http\Controllers;

use App\Models\TravelOrder; // We'll use the same model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TravelRequestController extends Controller
{
    public function create()
    {
        return Inertia::render('Travel/CreateTravelRequest');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'purpose' => 'required|string',
            'memo_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
        ]);

        // 1. Handle File Upload
        $memoPath = null;
        if ($request->hasFile('memo_file')) {
            // Store in 'travel_memos' folder on the 'public' disk
            $memoPath = $request->file('memo_file')->store('travel_memos', 'public');
        }

        // 2. Create the Travel Order Request
        TravelOrder::create([
            'user_id' => Auth::id(),
            'destination' => $validated['destination'],
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
            'purpose' => $validated['purpose'],
            'status' => 'Pending', // Initial status
            'memo_path' => $memoPath, // Save the file path
            // Other fields like fund_source, travel_type will be filled by RD later
        ]);

        return redirect()->route('dashboard')->with('success', 'Travel Authority Request submitted for approval.');
    }
}