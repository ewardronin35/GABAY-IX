<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTravelClaimRequest; // ✅ Uses your custom Request
use App\Models\TravelClaim;
use App\Models\TravelOrder;
use App\Models\Itinerary;
use App\Models\Rer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TravelClaimController extends Controller
{
    /**
     * Display the form for creating a new travel claim.
     */
    public function index(): Response
    {
        return Inertia::render('TravelClaims/CreateTravelClaims');
    }

    public function create(Request $request): Response
    {
        return Inertia::render('TravelClaims/CreateTravelClaims', [
            'prefilledCode' => $request->query('code', ''),
        ]);
    }

    /**
     * Store a newly created travel claim in storage.
     */
    public function store(StoreTravelClaimRequest $request)
    {
        try {
            DB::beginTransaction();

            // 1. Create the Main Travel Claim (The Header)
            $travelClaim = TravelClaim::create([
                'user_id' => Auth::id(),
                'travel_order_id' => $request->travel_order_id,
                'claim_code' => 'CLM-' . now()->timestamp, // Auto-generate unique code
                'actual_total_amount' => $request->actual_amount ?? 0,
                'status' => 'Submitted',
                'submitted_at' => now(),
            ]);

            // 2. Save Itinerary Items (Normalized)
            // Handles both direct array or { items: [...] } structure
            $itineraryData = $request->input('itinerary.items') ?? $request->input('itinerary');
            
            if (is_array($itineraryData)) {
                foreach ($itineraryData as $item) {
                    // Skip empty rows
                    if (empty($item['date']) || empty($item['place_visited'])) continue;

                    Itinerary::create([
                        'travel_claim_id' => $travelClaim->id,
                        'date' => $item['date'],
                        'place_visited' => $item['place_visited'],
                        'departure_time' => $item['departure_time'] ?? null,
                        'arrival_time' => $item['arrival_time'] ?? null,
                        'means_of_transport' => $item['means_of_transport'] ?? null,
                        'transport_cost' => $item['transport_cost'] ?? 0,
                        'per_diem' => $item['per_diem'] ?? 0,
                        'other_expenses' => $item['other_expenses'] ?? 0,
                    ]);
                }
            }

            // 3. Save RER / Expense Items (Normalized)
            // Handles both direct array or { items: [...] } structure
            $rerData = $request->input('rer.items') ?? $request->input('rers');

            if (is_array($rerData)) {
                foreach ($rerData as $item) {
                    // Skip empty rows
                    if (empty($item['description']) || empty($item['amount'])) continue;

                    Rer::create([
                        'travel_claim_id' => $travelClaim->id,
                        'date' => $item['date'] ?? now(), // Default to today if missing
                        'or_number' => $item['or_number'] ?? null,
                        'description' => $item['description'],
                        'amount' => $item['amount'],
                        'expense_type' => $item['expense_type'] ?? 'Other',
                    ]);
                }
            }

            // 4. Handle Attachments (Move from Temp -> Final)
            if ($request->filled('attachments')) {
                foreach ($request->attachments as $tempPath) {
                    if (Storage::disk('public')->exists($tempPath)) {
                        $filename = basename($tempPath);
                        $permanentPath = 'travel_claims/' . $travelClaim->id . '/' . $filename;
                        
                        // Move file
                        Storage::disk('public')->move($tempPath, $permanentPath);
                        
                        // Save to 'attachments' table
                        $travelClaim->attachments()->create([
                            'file_name' => $filename,
                            'file_path' => $permanentPath,
                            'file_type' => Storage::disk('public')->mimeType($permanentPath),
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json(['message' => 'Travel claim submitted successfully!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Travel Claim Error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error' => $e->getMessage() // Optional: Remove in production
            ], 500);
        }
    }

    /**
     * API: Verify the Travel Order Code
     */
    public function verifyCode(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $code = trim($request->code);

        // 1. Find Order
        $order = TravelOrder::where('travel_order_code', $code)
            ->where('user_id', Auth::id()) // Security: Ensure ownership
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Code not found or access denied.'], 404);
        }

        // 2. Check Status
        if ($order->status !== 'Approved') {
            return response()->json(['error' => "Travel Order status is '{$order->status}'. It must be 'Approved'."], 422);
        }

        // 3. Check for Duplicate Claims
        $existingClaim = TravelClaim::where('travel_order_id', $order->id)->first();
        if ($existingClaim) {
            return response()->json(['error' => 'A claim has already been submitted for this order.'], 422);
        }

        // 4. Return Data
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'destination' => $order->destination,
                'purpose' => $order->purpose,
                'date_range' => date('M d', strtotime($order->date_from)) . ' - ' . date('M d, Y', strtotime($order->date_to)),
                'amount' => $order->total_estimated_cost,
            ]
        ]);
    }
}