<?php

namespace App\Http\Controllers;

// OLD MODELS (DELETED)
// use App\Models\TesScholar;
// use App\Models\TesAcademicRecord;

// NEW MODELS
use App\Models\Program;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;

use App\Models\HEI;
use App\Models\Course;

use App\Jobs\ProcessTesImport;
use App\Imports\TesImport;
use App\Exports\TesMasterlistExport;
use App\Exports\TesStatisticsExport;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class TesController extends Controller
{
    private $tesProgramId;

    /**
     * Find the TES Program ID once when the controller is loaded.
     */
    public function __construct()
    {
        $tesProgram = Program::where('program_name', 'TES')->first();
        if (!$tesProgram) {
            // This will fail loudly if the 'programs' table isn't seeded
            throw new \Exception("Program 'TES' not found in the 'programs' table. Please run 'php artisan db:seed'.");
        }
        $this->tesProgramId = $tesProgram->id;
    }

    public function generateStatisticsExcel()
    {
        // This function is fine, but the 'TesStatisticsExport' class itself will
        // need to be refactored next before this will work.
        return Excel::download(new TesStatisticsExport(), 'TES-Statistics-Report.xlsx');
    }

    public function generateMasterlistPdf(Request $request)
    {
        // --- REFACTORED QUERY ---
        $mlQuery = AcademicRecord::with([
            'enrollment.scholar', // Load the scholar through the enrollment
            'hei', 
            'course'
        ]);

        // Filter to ONLY show records for the TES program
        $mlQuery->whereHas('enrollment', function ($q) {
            $q->where('program_id', $this->tesProgramId);
        });

        // REFACTORED SEARCH: Search through the new relationship
        $mlQuery->when($request->input('search_ml'), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(family_name, ' ', given_name) LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("CONCAT(given_name, ' ', family_name) LIKE ?", ["%{$search}%"]);
            })->orWhereHas('hei', function ($heiQuery) use ($search) {
                $heiQuery->where('hei_name', 'like', "%{$search}%");
            });
        });

        $masterlist = $mlQuery->get();
        // --- END OF REFACTORED QUERY ---

        $pdf = Pdf::loadView('exports.tes-masterlist-pdf', ['masterlist' => $masterlist])->setPaper('legal', 'landscape');
        return $pdf->stream('TES-Masterlist.pdf');
    }

    public function generateMasterlistExcel()
    {
        // This function is CORRECT.
        // It calls 'TesMasterlistExport', which we already refactored.
        return Excel::download(new TesMasterlistExport(), 'TES-Masterlist.xlsx');
    }

    public function index(Request $request): Response
    {
        // --- REFACTORED QUERY for Masterlist (ml_tes) ---
        $mlQuery = AcademicRecord::with([
            'enrollment.scholar', // Load the scholar
            'hei', 
            'course'
        ]);

        // Filter to ONLY show records for the TES program
        $mlQuery->whereHas('enrollment', function ($q) {
            $q->where('program_id', $this->tesProgramId);
        });

        // REFACTORED SEARCH: Search through the new relationship
        $mlQuery->when($request->input('search_ml'), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(family_name, ' ', given_name) LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("CONCAT(given_name, ' ', family_name) LIKE ?", ["%{$search}%"]);
            })->orWhereHas('hei', function ($heiQuery) use ($search) {
                $heiQuery->where('hei_name', 'like', "%{$search}%");
            });
        });
        
        // --- END OF REFACTORED QUERY ---


        /*
         * NOTE: The query for 'database_tes' was identical to 'ml_tes' in your original file.
         * I am keeping that structure, but refactoring it as well.
         * You may want to change this query to point to the main 'scholars' table later.
         */

        // --- REFACTORED QUERY for Database (database_tes) ---
        $dbQuery = AcademicRecord::with([
            'enrollment.scholar', // Load the scholar
            'hei', 
            'course'
        ]);
        
        // Filter to ONLY show records for the TES program
        $dbQuery->whereHas('enrollment', function ($q) {
            $q->where('program_id', $this->tesProgramId);
        });

        // REFACTORED SEARCH
        $dbQuery->when($request->input('search_db'), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%");
            })->orWhereHas('hei', function ($heiQuery) use ($search) {
                $heiQuery->where('hei_name', 'like', "%{$search}%");
            });
        });
        
        // --- END OF REFACTORED QUERY ---


        return Inertia::render('Admin/Tes/Index', [
            'database_tes' => $dbQuery->paginate(10)->withQueryString(),
            'ml_tes' => $mlQuery->paginate(10)->withQueryString(),
            'hei_list' => HEI::all(),
            'course_list' => Course::all(),
            'filters_db' => $request->only(['search_db']),
            'filters_ml' => $request->only(['search_ml']),
        ]);
    }


    /**
     * This function is CORRECT. 
     * It calls the ProcessTesImport job, which in turn calls
     * the TesImport class we already refactored.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);
        $file = $request->file('file');
        $path = $file->store('imports');
        
        // Dispatch the job
        ProcessTesImport::dispatch(storage_path('app/' . $path));
        
        return redirect()->back()->with('success', 'File is being processed in the background.');
    }


    /**
     * WARNING: This function is now broken and must be completely rewritten.
     * The old logic was based on updating the 'TesScholar' model.
     * The new logic must update the 'Scholar' and 'AcademicRecord' models.
     * Your React grid must also be updated to send the correct 'id's.
     */
    public function updateTesData(Request $request): JsonResponse
    {
        // TODO: This function must be refactored.
        // The $validated['data'] array from your React grid will be different.
        // It needs to send the `academic_record_id` and/or `scholar_id` for each row.
        
        // --- NEW LOGIC EXAMPLE ---
        // DB::transaction(function () use ($validated) {
        //     foreach ($validated['data'] as $row) {
        //         // 1. Update the Academic Record
        //         $record = AcademicRecord::find($row['id']); // Assuming 'id' is academic_record_id
        //         if ($record) {
        //             $record->update([
        //                 'year_level' => $row['year_level'] ?? null,
        //                 'remarks' => $row['remarks'] ?? null,
        //                 // ... other fields from AcademicRecord
        //             ]);
        //         }
                
        //         // 2. Update the Scholar (Person)
        //         $scholar = Scholar::find($row['scholar_id']); // Assuming grid sends scholar_id
        //         if ($scholar) {
        //             $scholar->update([
        //                 'family_name' => $row['family_name'],
        //                 'given_name' => $row['given_name'],
        //                 'sex' => $row['sex'] ?? null,
        //                 // ... other fields from Scholar
        //             ]);
        //         }
        //     }
        // });
        
        // --- OLD LOGIC (NOW COMMENTED OUT) ---
        // $validated = $request->validate(['data' => 'required|array']);
        // DB::transaction(function () use ($validated) {
        //     foreach ($validated['data'] as $row) {
        //         if (empty($row['family_name']) && empty($row['given_name'])) {
        //             continue;
        //         }
        //         $scholar = TesScholar::updateOrCreate(
        //             [
        //                 'family_name' => $row['family_name'],
        //                 'given_name' => $row['given_name'],
        //                 'middle_name' => $row['middle_name'] ?? null
        //             ],
        //             ['sex' => $row['sex'] ?? null]
        //         );
        //         $scholar->address()->updateOrCreate([], ['region' => $row['region'] ?? null]);
        //         $scholar->education()->updateOrCreate([], [
        //             'hei_name' => $row['hei'] ?? null,
        //             'course_name' => $row['course'] ?? null,
        //         ]);
        //         $scholar->academicYears()->updateOrCreate(
        //             ['academic_year' => '2023-2024'], // Example, you can make this dynamic later
        //             [
        //                 'year_level' => $row['year_level'] ?? null,
        //                 'remarks' => $row['remarks'] ?? null,
        //             ]
        //         );
        //     }
        // });

        // Return a temporary error until this is refactored
        return response()->json(['message' => 'Update function needs to be refactored for the new database.'], 500);
    }
}