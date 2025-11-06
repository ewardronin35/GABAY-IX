<?php

namespace App\Http\Controllers;

// Import all necessary models and classes
use App\Models\TdpAcademicRecord;
use App\Models\TdpScholar;
use App\Models\HEI;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Jobs\ProcessTdpImport; // The background job for importing
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\TdpMasterlistExport;
use Illuminate\Http\JsonResponse; // ✅ ADD THIS

class TdpController extends Controller
{
    /**
     * Display the main TDP page with paginated data for the Database and Masterlist grids.
     */
   public function index(Request $request): Response
    {
        // Query for the main Database Grid (more detailed search)
        $dbQuery = TdpAcademicRecord::with(['scholar', 'hei', 'course']);
        $dbQuery->when($request->input('search_db'), function ($q, $search) {
            $q->where('award_no', 'like', "%{$search}%")
              ->orWhereHas('scholar', function ($scholarQuery) use ($search) {
                  $scholarQuery->where('family_name', 'like', "%{$search}%")
                               ->orWhere('given_name', 'like', "%{$search}%");
              });
        });
        $tdpDatabase = $dbQuery->latest()->paginate(50, ['*'], 'db_page')->withQueryString();

        // Query for the Masterlist Grid (simpler search)
        $mlQuery = TdpAcademicRecord::with(['scholar', 'hei', 'course']);
        $mlQuery->when($request->input('search_ml'), function ($q, $search) {
            $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%");
            });
        });
       $heiQuery = Hei::whereHas('tdpAcademicRecords') // Only show HEIs that have TDP scholars
            ->withCount('tdpAcademicRecords as scholar_count')
            ->orderBy('hei_name');

        $heiQuery->when($request->input('search_hei'), function ($q, $search) {
            $q->where('hei_name', 'like', "%{$search}%");
        });

        $heis = $heiQuery->paginate(25, ['*'], 'hei_page')->withQueryString();

        $tdpMasterlist = $mlQuery->latest()->paginate(25, ['*'], 'ml_page')->withQueryString();

        // ✅ ADD THESE QUERIES for the report filters
        $allHeis = Hei::orderBy('hei_name')->get(['id', 'hei_name']);
        $allBatches = TdpAcademicRecord::select('batch')
                        ->whereNotNull('batch')
                        ->distinct()
                        ->orderBy('batch', 'desc')
                        ->pluck('batch');
        // ✅ ADD THIS NEW QUERY
        $allAcademicYears = TdpAcademicRecord::select('academic_year')
                        ->whereNotNull('academic_year')
                        ->distinct()
                        ->orderBy('academic_year', 'desc')
                        ->pluck('academic_year');

        return Inertia::render('Admin/Tdp/Index', [
            'tdpRecords' => $tdpDatabase, 
            'tdpMasterlist' => $tdpMasterlist,
            'heis' => $heis,
            'filters' => $request->only(['search_db', 'search_ml', 'search_hei']),
            'allHeis' => $allHeis,           // ✅ ADD THIS PROP
            'allBatches' => $allBatches,     // ✅ ADD THIS PROP
            'allAcademicYears' => $allAcademicYears, // ✅ ADD THIS PROP
        ]);
    }
    public function showHei(Request $request, HEI $hei): Response
    {
        $recordsQuery = TdpAcademicRecord::where('tdp_academic_records.hei_id', $hei->id)
                            ->with(['scholar', 'course'])
                            ->join('courses', 'tdp_academic_records.course_id', '=', 'courses.id')
                            ->select('tdp_academic_records.*') 
                            ->orderBy('batch', 'desc')
                            ->orderBy('courses.course_name', 'asc');

        $recordsQuery->when($request->input('batch'), function ($q, $batch) {
            $q->where('batch', $batch);
        });

        $records = $recordsQuery->get();

        $groupedData = $records->groupBy(['batch', function ($item) {
            return $item->course->course_name ?? 'Unspecified Course';
        }]);
        
        $batches = TdpAcademicRecord::where('hei_id', $hei->id)
                        ->select('batch')
                        ->distinct()
                        ->orderBy('batch', 'desc')
                        ->pluck('batch');

        return Inertia::render('Admin/Tdp/Partials/ShowHei', [
            'hei' => $hei,
            'groupedData' => $groupedData,
            'batches' => $batches,
            'filters' => $request->only(['batch']),
        ]);
    }

    // ▼▼▼ PASTE THIS ENTIRE 'showScholar' METHOD ▼▼▼
  public function showScholar(TdpScholar $scholar): Response
    {
        // ▼▼▼ DELETE THIS LINE ▼▼▼
        // dd('TESTING: The showScholar method in TdpController IS RUNNING.');
        
        // This code will now run:
        $scholar->load(['academicRecords' => function ($query) {
            $query->with(['hei', 'course'])
                  ->orderBy('academic_year', 'desc')
                  ->orderBy('semester', 'desc');
        }]);
        return Inertia::render('Admin/Tdp/Partials/ShowScholar', [
            'scholar' => $scholar
        ]);
    }
   public function fetchStatisticsData(Request $request)
    {
        $academicQuery = TdpAcademicRecord::query();

        // ✅ Apply filters to the queries
        $academicQuery->when($request->input('hei_id'), function ($q, $heiId) {
            $q->where('hei_id', $heiId);
        });

        $academicQuery->when($request->input('batch'), function ($q, $batch) {
            $q->where('batch', $batch);
        });
        
        // ✅ ADDED academic_year filter
        $academicQuery->when($request->input('academic_year'), function ($q, $ay) {
            $q->where('academic_year', $ay);
        });

        // 1. Get Scholars by Province
        $scholarsByProvince = DB::table('tdp_scholars')
            ->join('tdp_academic_records', 'tdp_scholars.id', '=', 'tdp_academic_records.tdp_scholar_id')
            ->select('tdp_scholars.province', DB::raw('count(distinct tdp_scholars.id) as total'))
            ->whereNotNull('tdp_scholars.province')
            ->when($request->input('hei_id'), function ($q, $heiId) {
                $q->where('tdp_academic_records.hei_id', $heiId);
            })
            ->when($request->input('batch'), function ($q, $batch) {
                $q->where('tdp_academic_records.batch', $batch);
            })
            // ✅ ADDED academic_year filter
            ->when($request->input('academic_year'), function ($q, $ay) {
                $q->where('tdp_academic_records.academic_year', $ay);
            })
            ->groupBy('tdp_scholars.province')
            ->orderBy('total', 'desc')
            ->get();

        // 2. Get Total Scholars (based on filters)
        $totalScholars = $academicQuery->clone()->distinct('tdp_scholar_id')->count();

        // 3. Get Scholars by Status
        $scholarsByStatus = $academicQuery->clone()
            ->select('validation_status', DB::raw('count(distinct tdp_scholar_id) as total'))
            ->whereNotNull('validation_status')
            ->groupBy('validation_status')
            ->orderBy('total', 'desc')
            ->get()
            ->pluck('total', 'validation_status');

        // 4. Get Scholars by HEI
        $scholarsByHei = $academicQuery->clone()
            ->join('heis', 'tdp_academic_records.hei_id', '=', 'heis.id')
            ->select('heis.hei_name', DB::raw('count(distinct tdp_academic_records.tdp_scholar_id) as total'))
            ->groupBy('heis.hei_name')
            ->orderBy('total', 'desc')
            ->take(10)
            ->get()
            ->pluck('total', 'hei_name');

        return response()->json([
            'scholarsByProvince' => $scholarsByProvince,
            'total_scholars' => $totalScholars,
            'by_status' => $scholarsByStatus,
            'by_hei' => $scholarsByHei,
        ]);
    }
    /**
     * Generate a PDF of the statistics report with an embedded chart.
     */
 public function generateStatisticsPdf(Request $request)
{
    // ✅ Fetch stats using the filters from the request
    $stats = $this->fetchStatisticsData($request)->getData(true);

    // ✅ Send ONLY the stats data to the view. No more chart images.
    $pdf = Pdf::loadView('exports.tdp-statistics-report', [
        'stats' => $stats,
    ]);

    return $pdf->setPaper('a4', 'portrait')->download('TDP-Statistics-Report.pdf');
}

    /**
     * Generate a designed Excel file of the filtered masterlist.
     */
    public function generateMasterlistExcel(Request $request)
    {
        return Excel::download(new TdpMasterlistExport($request), 'TDP-Masterlist.xlsx');
    }

    /**
     * Generate a PDF of the entire filtered masterlist.
     */
  public function generateMasterlistPdf(Request $request)
    {
        $query = TdpAcademicRecord::with(['scholar', 'hei', 'course']);

        $query->when($request->input('search_ml'), function ($q, $search) {
            $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%");
            });
        });

        // ✅ ADDED Filters
        $query->when($request->input('hei_id'), function ($q, $heiId) {
            $q->where('hei_id', $heiId);
        });

        $query->when($request->input('batch'), function ($q, $batch) {
            $q->where('batch', $batch);
        });
        
        // ✅ ADDED academic_year filter
        $query->when($request->input('academic_year'), function ($q, $ay) {
            $q->where('academic_year', $ay);
        });

        $records = $query->latest()->limit(1000)->get();

        $pdf = Pdf::loadView('exports.tdp-masterlist-pdf', ['records' => $records]);
        return $pdf->setPaper('legal', 'landscape')->download('TDP-Masterlist.pdf');
    }
   public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                if (empty($row['family_name']) && empty($row['given_name'])) {
                    continue;
                }

                $hei = HEI::firstOrCreate(
                    ['hei_name' => $row['hei_name'] ?? 'N/A'],
                    [
                        'hei_type' => $row['hei_type'] ?? null,
                        'city' => $row['hei_city'] ?? null,
                        'province' => $row['hei_province'] ?? null,
                        'district' => $row['hei_district'] ?? null,
                    ]
                );
                $course = Course::firstOrCreate(['course_name' => $row['course_name'] ?? 'N/A']);

                $scholar = TdpScholar::updateOrCreate(
                    [
                        'family_name' => $row['family_name'],
                        'given_name' => $row['given_name'],
                        'middle_name' => $row['middle_name'] ?? null,
                    ],
                    [
                        'extension_name' => $row['extension_name'] ?? null,
                        'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
                        'street' => $row['street'] ?? null,
                        'town_city' => $row['town_city'] ?? null,
                        'district' => $row['district'] ?? null,
                        'province' => $row['province'] ?? null,
                        'contact_no' => $row['contact_no'] ?? null,
                        'email_address' => $row['email_address'] ?? null,
                    ]
                );

                TdpAcademicRecord::updateOrCreate(
                    ['id' => $row['id'] ?? null],
                    [
                        'tdp_scholar_id' => $scholar->id,
                        'hei_id' => $hei->id,
                        'course_id' => $course->id,
                        'seq' => $row['seq'] ?? null,
                        'app_no' => $row['app_no'] ?? null,
                        'award_no' => $row['award_no'] ?? null,
                        'year_level' => $row['year_level'] ?? null,
                        'batch' => $row['batch'] ?? null,
                        'validation_status' => $row['validation_status'] ?? null,
                        'semester' => $row['semester'] ?? null,
                        'academic_year' => $row['academic_year'] ?? null,
                        'date_paid' => $row['date_paid'] ?? null,
                        'ada_no' => $row['ada_no'] ?? null,
                        'tdp_grant' => $row['tdp_grant'] ?? null,
                        'endorsed_by' => $row['endorsed_by'] ?? null,
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'TDP data saved successfully!');
    }

    /**
     * Temporarily store a file uploaded via FilePond.
     */
    public function upload(Request $request): string
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        return $request->file('file')->store('imports');
    }

    /**
     * Handle the import request by dispatching a background job.
     */
 public function import(Request $request): JsonResponse // ✅ Returns JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,xlsm'
        ]);

        try {
            // 1. Store the file in 'storage/app/imports'
            $filePath = $request->file('file')->store('imports');
            
            // 2. Dispatch the job with the file path
            ProcessTdpImport::dispatch($filePath);
            
            // 3. Return an immediate success message
            return response()->json(['message' => 'File received! Processing will begin in the background.']);

        } catch (\Exception $e) {
            Log::error('TDP File Upload Error: ' . $e->getMessage());
            return response()->json(['message' => 'Could not store the file for processing.'], 500);
        }
    }
}