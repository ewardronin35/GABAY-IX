<?php

namespace App\Http\Controllers\UnifastRc; // ✅ Correct namespace

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use App\Models\TdpAcademicRecord;
use App\Models\TesAcademicRecord; // Make sure this model exists
use App\Models\Hei;

class ValidationController extends Controller
{
    /**
     * Display the validation queue page.
     * We will group all pending records by HEI.
     */
    public function index(Request $request): Response
    {
        // Define what status counts as "pending"
        // You can change "PENDING" or add more, e.g., ['PENDING', 'FOR REVIEW']
        $pendingStatuses = ['PENDING']; 

        // Get all HEIs that have pending TDP records
        $tdpHeis = Hei::whereHas('tdpAcademicRecords', function ($query) use ($pendingStatuses) {
            $query->whereIn('validation_status', $pendingStatuses);
        })
        ->with(['tdpAcademicRecords' => function ($query) use ($pendingStatuses) {
            $query->whereIn('validation_status', $pendingStatuses)
                  ->with(['scholar', 'course']); // Load relationships
        }])
        ->orderBy('hei_name')
        ->get();

        // Get all HEIs that have pending TES records
        $tesHeis = Hei::whereHas('tesAcademicRecords', function ($query) use ($pendingStatuses) {
            $query->whereIn('validation_status', $pendingStatuses);
        })
        ->with(['tesAcademicRecords' => function ($query) use ($pendingStatuses) {
            $query->whereIn('validation_status', $pendingStatuses)
                  ->with(['scholar', 'course']); // Load relationships
        }])
        ->orderBy('hei_name')
        ->get();

        return Inertia::render('UnifastRc/Validation/Index', [ // ✅ New Page Path
            'tdpHeis' => $tdpHeis,
            'tesHeis' => $tesHeis,
            'validationOptions' => [ // Pass the options to the frontend
                ['value' => 'PENDING', 'label' => 'Pending'],
                ['value' => 'VALIDATED', 'label' => 'Validated'],
                ['value' => 'REJECTED', 'label' => 'Rejected'],
                // Add any other statuses you use
            ]
        ]);
    }

    /**
     * Handle the bulk validation submission from the UniFast RC user.
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tdp_changes' => 'nullable|array',
            'tes_changes' => 'nullable|array',
            'tdp_changes.*.id' => 'required|integer',
            'tdp_changes.*.validation_status' => 'required|string',
            'tes_changes.*.id' => 'required|integer',
            'tes_changes.*.validation_status' => 'required|string',
        ]);

        DB::transaction(function () use ($validated) {
            // Process TDP Changes
            if (!empty($validated['tdp_changes'])) {
                foreach ($validated['tdp_changes'] as $change) {
                    TdpAcademicRecord::where('id', $change['id'])
                        ->update(['validation_status' => $change['validation_status']]);
                }
            }

            // Process TES Changes
            if (!empty($validated['tes_changes'])) {
                foreach ($validated['tes_changes'] as $change) {
                    // Assuming TesAcademicRecord model exists
                    TesAcademicRecord::where('id', $change['id'])
                        ->update(['validation_status' => $change['validation_status']]);
                }
            }
        });

        return redirect()->back()->with('success', 'Validation statuses updated successfully!');
    }
}