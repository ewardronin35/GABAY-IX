<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; // Import Storage
use Illuminate\Support\Facades\Validator;

class ItineraryController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'official_station' => 'required|string|max:255',
            'date_of_travel' => 'required|string',
            'purpose' => 'required|string',
            'items' => 'required|array',
            'items.*.date' => 'required|date',
            'items.*.place' => 'required|string',
            'items.*.transport_means' => 'required|string',
            'attachments' => 'nullable|array', // Expect an array of temp file paths
            'attachments.*' => 'string', 
            // Add other validation rules as needed
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $itinerary = Itinerary::create([
                'name' => $request->name,
                'position' => $request->position,
                'official_station' => $request->official_station,
                'fund_cluster' => $request->fund_cluster,
                'itinerary_no' => $request->itinerary_no,
                'date_of_travel' => $request->date_of_travel,
                'purpose' => $request->purpose,
                'total_fare' => $request->total_fare,
                'total_per_diem' => $request->total_per_diem,
                'total_others' => $request->total_others,
                'grand_total' => $request->grand_total,
            ]);

            foreach ($request->items as $itemData) {
                $itinerary->items()->create([
                    'date' => $itemData['date'],
                    'place' => $itemData['place'],
                    'departure_time' => $itemData['departure_time'],
                    'arrival_time' => $itemData['arrival_time'],
                    'transport_means' => $itemData['transport_means'],
                    'fare' => $itemData['fare'],
                    'per_diem' => $itemData['per_diem'],
                    'others' => $itemData['others'],
                ]);
            }
if ($request->has('attachments')) {
                foreach ($request->attachments as $tempPath) {
                    if (Storage::disk('public')->exists($tempPath)) {
                        $file = new \Illuminate\Http\File(storage_path('app/public/' . $tempPath));
                        
                        // Move file from 'tmp' to a permanent folder
                        $permanentPath = Storage::disk('public')->putFile('itineraries/' . $itinerary->id, $file);

                        // Create the attachment record in the database
                        $itinerary->attachments()->create([
                            'filename' => $file->getBasename(),
                            'filepath' => $permanentPath,
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                        ]);
                    }
                }
            }
            DB::commit();

            return response()->json(['message' => 'Itinerary created successfully', 'itinerary' => $itinerary], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create itinerary', 'error' => $e->getMessage()], 500);
        }
    }
}