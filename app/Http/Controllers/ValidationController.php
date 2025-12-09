<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ScholarEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ValidationController extends Controller
{
    /**
     * Display the validation page with tabs (Pending vs Validated).
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'pending');
        $search = $request->input('search');

        // 1. Query Scholar Enrollments (TDP & TES)
        $query = ScholarEnrollment::with(['scholar', 'program', 'hei'])
            // Search Logic
            ->when($search, function ($q, $search) {
                $q->whereHas('scholar', function ($sub) use ($search) {
                    $sub->where('family_name', 'like', "%{$search}%")
                        ->orWhere('given_name', 'like', "%{$search}%")
                        ->orWhere('seq', 'like', "%{$search}%");
                })
                ->orWhere('award_number', 'like', "%{$search}%");
            });

        // 2. Filter by Status Tab
        if ($status === 'validated') {
            $query->where('payment_status', 'Validated');
        } else {
            // "Pending" means anything NOT validated (Null, On-going, Pending)
            $query->where(function($q) {
                $q->whereNull('payment_status')
                  ->orWhere('payment_status', '!=', 'Validated');
            });
        }

        // 3. Paginate
        $scholars = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tdp/Validation', [
            'scholars' => $scholars,
            'filters' => [
                'status' => $status,
                'search' => $search
            ]
        ]);
    }

    /**
     * API: Get the specific checklist for a student (TES vs TDP).
     */
    public function getChecklist(ScholarEnrollment $enrollment)
    {
        // Ensure we have access to the program's requirements and the user's uploads
        $enrollment->load(['program.requirements', 'attachments']);

        $checklist = $enrollment->program->requirements->map(function ($req) use ($enrollment) {
            // Check if user uploaded this specific requirement
            $file = $enrollment->attachments->firstWhere('requirement_id', $req->id);

            return [
                'id' => $req->id,
                'name' => $req->name,
                'code' => $req->code,
                'is_required' => (bool) $req->pivot->is_required,
                'status' => $file ? 'Submitted' : 'Missing',
                'file_url' => $file ? asset('storage/' . $file->filepath) : null,
                'file_name' => $file ? $file->original_name : null,
            ];
        });

        // Check if all REQUIRED items are submitted
        $requiredIds = $checklist->where('is_required', true)->pluck('id');
        $submittedIds = $checklist->where('status', 'Submitted')->pluck('id');
        
        // Is complete if NO required ID is missing from submitted IDs
        $isComplete = $requiredIds->diff($submittedIds)->isEmpty();

        return response()->json([
            'scholar_name' => $enrollment->scholar->family_name . ', ' . $enrollment->scholar->given_name,
            'checklist' => $checklist,
            'is_complete' => $isComplete
        ]);
    }

    /**
     * Action: Mark the student as Validated.
     */
    public function validateScholar(ScholarEnrollment $enrollment)
    {
        $enrollment->update([
            'payment_status' => 'Validated',
            // 'validated_by' => auth()->id(), // Uncomment if you track who validated
        ]);

        return back()->with('success', 'Scholar successfully validated!');
    }
}