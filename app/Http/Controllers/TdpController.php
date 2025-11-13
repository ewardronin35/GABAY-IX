<?php

namespace App\Http\Controllers;

// NEW: Import all the new models
use App\Models\AcademicRecord;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Program;

// Keep these
use App\Models\HEI;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Jobs\ProcessTdpImport; // This job uses the TdpImport we already fixed
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\TdpMasterlistExport;
use Illuminate\Http\JsonResponse;

class TdpController extends Controller
{
    private $tdpProgramId;

    // NEW: Add a constructor to get the Program ID
    public function __construct()
    {
        $tdpProgram = Program::where('program_name', 'TDP')->first();
        if (!$tdpProgram) {
            // This will fail loudly if the 'programs' table isn't seeded
            throw new \Exception("Program 'TDP' not found in the 'programs' table. Please run 'php artisan db:seed'.");
        }
        $this->tdpProgramId = $tdpProgram->id;
    }

    /**
     * Display the main TDP page with paginated data.
     */
 /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $programId = Program::where('program_name', 'TDP')->value('id');

        // --- Base Query ---
        // This query is correct and gets all relationships
        $baseQuery = ScholarEnrollment::with([
            'scholar.address',
            'scholar.education.course',
            'hei',
            'academicRecords'
        ])
        ->where('scholar_enrollments.program_id', $programId)
        ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
        ->select('scholar_enrollments.*');

        // --- ▼▼▼ FIX 1: NEW QUERY FOR "DATABASE" TAB ▼▼▼ ---
        // This query powers the Handsontable grid
        $databaseQuery = (clone $baseQuery); // Clone the base query

        if ($request->input('search_db')) {
            $search = $request->input('search_db');
            // Search by scholar name OR award number
            $databaseQuery->where(function ($q) use ($search) {
                $q->whereHas('scholar', function ($sq) use ($search) {
                    $sq->where('given_name', 'like', "%{$search}%")
                       ->orWhere('family_name', 'like', "%{$search}%");
                })->orWhere('award_number', 'like', "%{$search}%");
            });
        }

        // Paginate by 50 (for performance), named page 'db_page'
        $databaseEnrollments = $databaseQuery
            ->orderBy('scholars.family_name')
            ->paginate(50, ['*'], 'db_page') 
            ->withQueryString();

        // --- ▼▼▼ FIX 2: CORRECTED QUERY FOR "MASTERLIST" TAB ▼▼▼ ---
        // This query powers the read-only Masterlist
        $masterlistQuery = (clone $baseQuery); // Clone the base query

        // FIX: Apply filters to $masterlistQuery (was $enrollmentQuery)
        if ($request->input('search_ml')) {
            $search = $request->input('search_ml');
            $masterlistQuery->whereHas('scholar', function ($q) use ($search) {
                $q->where('given_name', 'like', "%{$search}%")
                  ->orWhere('family_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%");
            });
        }
        
        // FIX: Apply filters to $masterlistQuery
        if ($request->input('academic_year')) {
            $masterlistQuery->whereHas('academicRecords', function ($q) use ($request) {
                $q->where('academic_year', $request->input('academic_year'));
            });
        }
        
        // FIX: Apply filters to $masterlistQuery
        if ($request->input('semester')) {
            $masterlistQuery->whereHas('academicRecords', function ($q) use ($request) {
                $q->where('semester', $request->input('semester'));
            });
        }
        
        // This prop is now ONLY for the masterlist
        $paginatedEnrollments = $masterlistQuery
            ->orderBy('scholars.family_name')
            ->paginate(50, ['*'], 'ml_page')
            ->withQueryString();

        // --- Query 3: For the "Database" Tab (Paginated HEIs) ---
        // This query is correct
        $heiQuery = ScholarEnrollment::where('program_id', $programId)
            ->join('heis', 'scholar_enrollments.hei_id', '=', 'heis.id')
            ->select('heis.id', 'heis.hei_name', DB::raw('count(scholar_enrollments.scholar_id) as scholar_count'))
            ->groupBy('heis.id', 'heis.hei_name');
        
        if ($request->input('search_db')) {
             $heiQuery->where('heis.hei_name', 'like', '%'.$request->input('search_db').'%');
        }
        
        $paginatedHeis = $heiQuery->orderBy('heis.hei_name')
            ->paginate(20, ['*'], 'hei_page') // Paginate HEIs
            ->withQueryString();

        // --- Query 4: For the "Report" Tab (Server-side Stats) ---
        // This query is correct
        $statsQuery = ScholarEnrollment::where('scholar_enrollments.program_id', $programId);
        $statistics = [
            'totalScholars' => (clone $statsQuery)->distinct('scholar_id')->count(),
            'uniqueHeis' => (clone $statsQuery)->distinct('hei_id')->count(),
            'uniqueProvinces' => (clone $statsQuery)
                ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
                ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
                ->distinct('addresses.province')
                ->count('addresses.province'),
            'uniqueCourses' => (clone $statsQuery)
                ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
                ->join('education', 'scholars.id', '=', 'education.scholar_id')
                ->distinct('education.course_id')
                ->count('education.course_id'),
        ];
        
        // --- ▼▼▼ FIX 3: CORRECTED RETURN STATEMENT ▼▼▼ ---
        return Inertia::render('Admin/Tdp/Index', [
            // For Masterlist Tab (uses 'enrollments')
            'enrollments' => $paginatedEnrollments, 
            
            // NEW: For Database Tab (Handsontable)
            'databaseEnrollments' => $databaseEnrollments, 
            
            // For HEI Tab
            'paginatedHeis' => $paginatedHeis,
            
            // For Report Tab
            'statistics' => $statistics,
            
            // For Filters
            'courses' => Course::all(), 
            'academicYears' => AcademicRecord::distinct()->orderBy('academic_year', 'desc')->pluck('academic_year'),
            'semesters' => AcademicRecord::distinct()->pluck('semester'),
            
            // Send all filters back to keep UI in sync
'filters' => $request->only(['search_db', 'search_ml', 'academic_year', 'semester', 'tab']),
        ]);
    }


public function bulkUpdate(Request $request)
    {
        $programId = $this->tdpProgramId; 

        // 1. CLEAN THE DATA *BEFORE* VALIDATING
        $cleanedData = [];
        foreach ($request->enrollments as $row) {
            
            // Step 1: Clean known "dirty" fields *first*
            if (isset($row['sex'])) {
                if (strtolower($row['sex']) === 'male') $row['sex'] = 'M';
                if (strtolower($row['sex']) === 'female') $row['sex'] = 'F';
            }

            if (isset($row['tdp_grant'])) {
                // This is your "address" or string field. We'll just trim it.
                // If it was a number, we'd add: str_replace(['₱', ',', ' '], '', $row['tdp_grant']);
            }
            
            // Step 2: Now, convert *all* empty strings to null.
            foreach ($row as $key => $value) {
                if (is_string($value)) {
                    $value = trim($value);
                    if ($value === '') {
                        $value = null; // Convert "" to null
                    }
                    $row[$key] = $value;
                }
            }
            
            // Step 3: Handle null/empty IDs
            if (empty($row['id'])) {
                $row['id'] = null;
            }

            $cleanedData[] = $row;
        }

        // 2. VALIDATE THE *CLEANED* DATA
        $validator = \Illuminate\Support\Facades\Validator::make(['enrollments' => $cleanedData], [
            'enrollments' => 'required|array',
            'enrollments.*.id' => 'nullable|integer|exists:scholars,id', 
            
            // Scholar fields
            'enrollments.*.family_name' => 'nullable|string|max:255',
            'enrollments.*.given_name' => 'nullable|string|max:255',
            'enrollments.*.middle_name' => 'nullable|string|max:255',
            'enrollments.*.extension_name' => 'nullable|string|max:20',
            'enrollments.*.sex' => 'nullable|string|in:M,F',
            'enrollments.*.contact_no' => 'nullable|string|max:20',
            'enrollments.*.email_address' => 'nullable|email|max:255',
            
            // Enrollment fields
            'enrollments.*.award_no' => 'nullable|string|max:255',

            // --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
            // Academic Record fields (All keys are now present)
            'enrollments.*.seq' => 'nullable|string|max:255',
            'enrollments.*.app_no' => 'nullable|string|max:255',
            'enrollments.*.year_level' => 'nullable|string|max:255', // Match DB varchar
            'enrollments.*.batch' => 'nullable|string|max:255',
            'enrollments.*.validation_status' => 'nullable|string|max:255',
            'enrollments.*.date_paid' => 'nullable|date',
            'enrollments.*.tdp_grant' => 'nullable|string|max:255', // It is a string (varchar)
            'enrollments.*.endorsed_by' => 'nullable|string|max:255',
            // --- ▲▲▲ END OF FIX ▲▲▲ ---
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        // 3. PROCESS:
        DB::transaction(function () use ($cleanedData, $programId) {
            
            // --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
            // Create a "defaults" array. This ensures all keys we
            // need for the update will exist, even if the frontend
            // failed to send them (e.g., from an empty cell).
            $academicKeysDefaults = [
                'seq' => null,
                'app_no' => null,
                'year_level' => null,
                'batch' => null,
                'validation_status' => null,
                'date_paid' => null,
                'tdp_grant' => null,
                'endorsed_by' => null,
                'family_name' => null,
                'given_name' => null,
                'middle_name' => null,
                'extension_name' => null,
                'sex' => null,
                'contact_no' => null,
                'email_address' => null,
                'award_number' => null,
            ];
            // --- ▲▲▲ END OF FIX ▲▲▲ ---

            foreach ($cleanedData as $row) {
                
                // This is correct. This grid only *updates*.
                // The "Import" tab *creates*.
                if (is_null($row['id'])) {
                    continue; 
                }
                
                // --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
                // Merge the defaults with the row. If $row is missing 'seq',
                // this will add 'seq' => null. This makes it crash-proof.
                $safeRow = array_merge($academicKeysDefaults, $row);
                // --- ▲▲▲ END OF FIX ▲▲▲ ---

                $scholar = Scholar::find($safeRow['id']);
                if ($scholar) {
                    $scholar->update([
                        'family_name' => $safeRow['family_name'],
                        'given_name' => $safeRow['given_name'],
                        'middle_name' => $safeRow['middle_name'],
                        'extension_name' => $safeRow['extension_name'],
                        'sex' => $safeRow['sex'],
                        'contact_no' => $safeRow['contact_no'],
                        'email_address' => $safeRow['email_address'],
                    ]);
                }

                $enrollment = ScholarEnrollment::where('scholar_id', $safeRow['id'])
                                ->where('program_id', $programId)
                                ->first();
                
                if ($enrollment) {
                    $enrollment->update([
                        'award_number' => $safeRow['award_no'],
                    ]);

                    $academicRecord = $enrollment->academicRecords()->first();
                    
                    if ($academicRecord) {
                        // Now we use $safeRow, which is guaranteed to have all keys.
                        $academicRecord->update([
                            'seq' => $safeRow['seq'],
                            'app_no' => $safeRow['app_no'],
                            'year_level' => $safeRow['year_level'],
                            'batch_no' => $safeRow['batch'], 
                            'payment_status' => $safeRow['validation_status'],
                            'disbursement_date' => $safeRow['date_paid'],
                            'grant_amount' => $safeRow['tdp_grant'], // Maps tdp_grant to grant_amount
                            'endorsed_by' => $safeRow['endorsed_by'],
                        ]);
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Masterlist updated successfully!');
    }
    public function showScholar(Scholar $scholar)
    {
        // Load all relationships needed for the ShowScholar page
        $scholar->load([
            'address', 
            'education.hei', 
            'education.course', 
            'enrollments.program', 
            'enrollments.academicRecords'
        ]);
        
        return Inertia::render('Admin/Tdp/Partials/ShowScholar', [
            'scholar' => $scholar
        ]);
    }

    /**
     * --- ▼▼▼ FIX: ADDED MISSING METHOD ▼▼▼ ---
     * Display the specified HEI and its scholars.
     */
    public function showHei(HEI $hei)
    {
        $programId = Program::where('program_name', 'TDP')->value('id');

        // Load HEI info and its enrollments FOR THIS PROGRAM, paginated
        $enrollments = $hei->enrollments()
            ->where('program_id', $programId)
            ->with(['scholar', 'academicRecords'])
            ->paginate(50);

        return Inertia::render('Admin/Tdp/Partials/ShowHei', [
            'hei' => $hei,
            'enrollments' => $enrollments
        ]);
    }
    /**
     * Generate a PDF masterlist.
     */
    public function generateMasterlistPdf(Request $request)
    {
        // --- REFACTORED QUERY (Masterlist PDF) ---
        $mlQuery = AcademicRecord::with(['enrollment.scholar', 'hei', 'course'])
            // NEW: Filter for TDP Program
            ->whereHas('enrollment', function ($q) {
                $q->where('program_id', $this->tdpProgramId);
            });

        // REFACTORED SEARCH
        $mlQuery->when($request->input('search_ml'), function ($q, $search) {
            return $q->whereHas('enrollment', function ($enrollQuery) use ($search) {
                $enrollQuery->where('award_number', 'like', "%{$search}%");
            })->orWhereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                             ->orWhere('given_name', 'like', "%{$search}%");
            });
        });

        $tdpMasterlist = $mlQuery->get();
        // TODO: Refactor 'exports.tdp-masterlist-pdf.blade.php' to use the new data structure
        // (e.g., $record->enrollment->scholar->family_name)
        $pdf = Pdf::loadView('exports.tdp-masterlist-pdf', ['records' => $tdpMasterlist]);
        return $pdf->download('tdp-masterlist.pdf');
    }

    /**
     * Generate an Excel masterlist.
     */
    public function generateMasterlistExcel(Request $request)
    {
        // This function will fail until we refactor the TdpMasterlistExport class
        // TODO: Refactor App\Exports\TdpMasterlistExport.php
        return Excel::download(new TdpMasterlistExport($request->input('search_ml')), 'tdp-masterlist.xlsx');
    }

    /**
     * Update data from the Handsontable grid.
     * WARNING: This function is broken and must be rewritten.
     */
    public function updateTdpData(Request $request): RedirectResponse
    {
        // TODO: This function MUST be completely rewritten to work with the new normalized structure.
        // The old logic is commented out to prevent errors.
        
        /*
        $validated = $request->validate(['data' => 'required|array']);
        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // ... OLD BROKEN LOGIC ...
            }
        });
        */

        // TEMPORARY RESPONSE:
        Log::error('updateTdpData is not yet refactored.');
        return redirect()->back()->with('error', 'This save function is not yet implemented for the new database structure.');
    }

    /**
     * Temporarily store a file uploaded via FilePond.
     * This function is correct.
     */
    public function upload(Request $request): string
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        return $request->file('file')->store('imports');
    }

    /**
     * Handle the import request by dispatching a background job.
     */
  public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        try {
            //
            // ▼▼▼ THIS IS THE FIX ▼▼▼
            //
            // 1. Store the file on the 'private' disk
            $filePath = $request->file('file')->store('imports', 'private');

            // 2. Check for the file on the 'private' disk
            if (!Storage::disk('private')->exists($filePath)) {
                 Log::error('TDP File Import Error: File not found after storing at: ' . $filePath);
                 return response()->json(['message' => 'File not found on server after upload.'], 404);
            }
            
            // 3. Dispatch the job with the file path
            ProcessTdpImport::dispatch($filePath);
            
            return response()->json(['message' => 'File received! Processing will begin in the background.']);

        } catch (\Exception $e) {
            Log::error('TDP File Upload Error: ' . $e->getMessage());
            return response()->json(['message' => 'Could not store the file for processing.'], 500);
        }
    }
}
