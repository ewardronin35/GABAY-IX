<?php

namespace App\Http\Controllers;

use App\Models\Scholar;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScholarController extends Controller
{
    // ... other methods like index, create, etc.

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Scholar $scholar): JsonResponse
    {
        // 1. Validate the incoming data from the inline edit
        $validated = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'hei' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            // Add validation for any other editable fields
        ]);

        // 2. Update the main scholar record
        $scholar->family_name = $validated['last_name'];
        $scholar->given_name = $validated['first_name'];
        $scholar->save();

        // 3. Update the related education record
        if ($scholar->education) {
            $scholar->education->hei_name = $validated['hei'];
            $scholar->education->program = $validated['course'];
            $scholar->education->save();
        }

        // 4. Return the freshly updated and formatted data as a JSON response
        // This ensures the frontend shows the latest information.
        return response()->json([
            'id' => $scholar->id, // Pass the original ID back
            'no' => $request->input('no'), // Pass the row number back
            'region' => $scholar->region,
            'award_no' => $scholar->award_number,
            'last_name' => $scholar->family_name,
            'first_name' => $scholar->given_name,
            'middle_name' => $scholar->middle_name,
            'extension' => $scholar->extension_name,
            'sex' => $scholar->sex,
            'hei' => $scholar->education->hei_name ?? '',
            'course' => $scholar->education->program ?? '',
        ]);
    }
    
    // ... other methods
}