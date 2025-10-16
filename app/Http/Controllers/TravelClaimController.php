<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTravelClaimRequest;
use App\Models\TravelClaim;
use Illuminate\Http\File;
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
    public function create(): Response
    {
        // This renders your main React component
        return Inertia::render('Admin/TravelClaims/CreateTravelClaims');
    }

    /**
     * Store a newly created travel claim in storage.
     */
    public function store(StoreTravelClaimRequest $request)
    {
        try {
            DB::beginTransaction();

            // 1. Create the main Travel Claim record.
            $travelClaim = TravelClaim::create(['status' => 'pending']);

            // 2. Create the Itinerary and its items.
            $itinerary = $travelClaim->itinerary()->create($request->itinerary);
            if (!empty($request->itinerary['items'])) {
                $itinerary->items()->createMany($request->itinerary['items']);
            }

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

            // 6. Process and attach files from FilePond.
            if ($request->filled('attachments')) {
                foreach ($request->attachments as $tempPath) {
                    if (Storage::disk('public')->exists($tempPath)) {
                        $file = new File(storage_path('app/public/' . $tempPath));
                        $permanentPath = Storage::disk('public')->putFile('travel_claims/' . $travelClaim->id, $file);

                        $travelClaim->attachments()->create([
                            'filename' => basename($permanentPath),
                            'filepath' => $permanentPath,
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                        ]);
                    }
                }
            }
            
            DB::commit();

            return response()->json(['message' => 'Travel claim submitted successfully!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Travel Claim Submission Failed: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json(['message' => 'An unexpected error occurred. Please try again.'], 500);
        }
    }
}