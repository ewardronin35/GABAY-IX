<?php

namespace App\Http\Controllers;

// ⬇️ **1. ADD THIS IMPORT**
use App\Http\Requests\StoreTravelClaimRequest;
use App\Models\TravelClaim;
use Illuminate\Http\Request; // You can remove this if 'StoreTravelClaimRequest' is the only one
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
        return Inertia::render('Admin/TravelClaims/CreateTravelClaims');
    }
     public function create(): Response
    {
        return Inertia::render('Admin/TravelClaims/CreateTravelClaims');
    }


    /**
     * Store a newly created travel claim in storage.
     */
    // ⬇️ **2. CHANGE 'Request' back to 'StoreTravelClaimRequest'**
    public function store(StoreTravelClaimRequest $request)
    {
        // 🌟 **NO VALIDATION NEEDED HERE!** // Laravel automatically validates the request *before* // this method is even called.
        // If validation fails, it will automatically send a 422
        // error response back to your React form.

        try {
            DB::beginTransaction();
            
            // The rest of your 'store' logic is perfect.
            // The $request object is now guaranteed to be safe and valid.

            // 1. Create the main Travel Claim record.
            $travelClaim = TravelClaim::create(['status' => 'pending']);

            // 2. Create the Itinerary and its items.
            $itinerary = $travelClaim->itinerary()->create($request->itinerary);
            if (!empty($request->itinerary['items'])) {
                $itinerary->items()->createMany($request->itinerary['items']);
            }
            
            // ... (rest of your logic for AppendixB, RER, attachments) ...
            
            // 3. Create the Appendix B form.
            $travelClaim->appendixB()->create($request->appendixB);

            // 4. Create the RER (expense report) and its items.
            $rer = $travelClaim->rer()->create($request->rer);
            if (!empty($request->rer['items'])) {
                $rer->items()->createMany($request->rer['items']);
            }

            // 5. Create the Travel Report, if it exists in the payload.
            if ($request->filled('report')) {
                $travelClaim->travelReport()->create($request->report);
            }

            // 6. Process and MOVE attachments
            if ($request->filled('attachments')) {
                foreach ($request->attachments as $tempPath) {
                    if (Storage::disk('public')->exists($tempPath)) {
                        $filename = basename($tempPath);
                        $permanentPath = 'travel_claims/' . $travelClaim->id . '/' . $filename;
                        Storage::disk('public')->move($tempPath, $permanentPath);
                        
                        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                        $disk = Storage::disk('public');
                        $fileSize = $disk->size($permanentPath);
                        $fileMime = $disk->mimeType($permanentPath);

                        $travelClaim->attachments()->create([
                            'filename' => $filename,
                            'filepath' => $permanentPath,
                            'mime_type' => $fileMime,
                            'size' => $fileSize,
                        ]);
                    }
                }
            }
            
            DB::commit();

            return response()->json(['message' => 'Travel claim submitted successfully!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Travel Claim Submission Failed: ' . $e->getMessage() . ' on line ' . $e->getLine());

            // Cleanup temp files on failure
            if ($request->filled('attachments')) {
                foreach ($request->attachments as $tempPath) {
                    if (Storage::disk('public')->exists($tempPath)) {
                        Storage::disk('public')->delete($tempPath);
                    }
                }
            }
            
            return response()->json(['message' => 'An unexpected error occurred. Please try again.'], 500);
        }
    }
}