<?php

namespace App\Http\Controllers;

use App\Models\StufapAcademicRecord;
use App\Models\StufapScholar;
use App\Models\HEI;
use App\Models\Program;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Jobs\ProcessStufapImport; // We will create this job next
use App\Exports\StufapMasterlistExport; // We will create this
class StufapController extends Controller
{
    /**
     * Display the main StuFAPs page with paginated records.
     */
    public function index(Request $request): Response
    {
        $query = StufapAcademicRecord::with(['scholar', 'hei', 'course']);

        $query->when($request->input('search'), function ($q, $search) {
            $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                             ->orWhere('given_name', 'like', "%{$search}%");
            })->orWhere('award_number', 'like', "%{$search}%");
        });

        $records = $query->latest()->paginate(50)->withQueryString();

        return Inertia::render('Admin/Stufap/Index', [
            'stufapRecords' => $records,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * ✅ NEW: Handle bulk updates from the Handsontable grid.
     */
   public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        // Use a transaction to ensure all records are saved or none are.
        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // Skip empty rows from the grid
                if (empty($row['family_name']) && empty($row['given_name'])) {
                    continue;
                }

                // 1. Normalize related data: Find or create the HEI, Course, and Program
                $hei = HEI::firstOrCreate(['hei_name' => $row['hei_name'] ?? 'N/A']);
                $course = Course::firstOrCreate(['course_name' => $row['course_name'] ?? 'N/A']);
                $program = Program::firstOrCreate(['program_name' => $row['program_name'] ?? 'N/A']);

                // 2. Update or Create the Scholar's permanent information
                $scholar = StufapScholar::updateOrCreate(
                    [
                        'family_name' => $row['family_name'],
                        'given_name' => $row['given_name'],
                        'middle_name' => $row['middle_name'] ?? null,
                    ],
                    [
                        'extension_name' => $row['extension_name'] ?? null,
                        'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
                        'barangay' => $row['barangay'] ?? null,
                        'city' => $row['city'] ?? null,
                        'province' => $row['province'] ?? null,
                        'congressional_district' => $row['congressional_district'] ?? null,
                        'region' => $row['region'] ?? null,
                    ]
                );

                // 3. Update or Create the specific Academic Record
                StufapAcademicRecord::updateOrCreate(
                    ['id' => $row['id'] ?? null], // Updates if 'id' exists, creates if 'id' is null
                    [
                        'stufap_scholar_id' => $scholar->id,
                        'program_id' => $program->id,
                        'hei_id' => $hei->id,
                        'course_id' => $course->id,
                        'seq' => $row['seq'] ?? null,
                        'award_year' => $row['award_year'] ?? null,
                        'award_number' => $row['award_number'] ?? null,
                        'priority_cluster' => $row['priority_cluster'] ?? null,
                        '1st_payment_sem' => $row['1st_payment_sem'] ?? null,
                        '2nd_payment_sem' => $row['2nd_payment_sem'] ?? null,
                        'curriculum_year' => $row['curriculum_year'] ?? null,
                        'remarks' => $row['remarks'] ?? null,
                        'status_type' => $row['status_type'] ?? null,
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'StuFAPs data saved successfully!');
    }

    /**
     * ✅ NEW: Temporarily store a file uploaded via FilePond.
     */
    public function upload(Request $request): string
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        return $request->file('file')->store('imports');
    }

    /**
     * ✅ NEW: Handle the import request by dispatching a background job.
     */


    public function generateStatisticsPdf(Request $request)
    {
        $validated = $request->validate([
            'chartImage' => 'required|string', // Expects a Base64 string
        ]);

        $stats = $this->StatisticsData()->getData(true);

        $pdf = Pdf::loadView('exports.stufap-statistics-report', [
            'stats' => $stats,
            'chartImage' => $validated['chartImage'],
        ]);

        return $pdf->setPaper('a4', 'portrait')->download('StuFAPs-Statistics-Report.pdf');
    }
    
    /**
     * ✅ NEW: Generate a PDF of the entire filtered masterlist.
     */
    public function generateMasterlistPdf(Request $request)
    {
        $query = StufapAcademicRecord::with(['scholar', 'hei', 'course']);
        $query->when($request->input('search'), function ($q, $search) { /* ... your search logic ... */ });
        $records = $query->latest()->get();

        $pdf = Pdf::loadView('exports.stufap-masterlist-pdf', ['records' => $records]);
        return $pdf->setPaper('legal', 'landscape')->download('StuFAPs-Masterlist.pdf');
    }

    /**
     * ✅ NEW: Generate a styled Excel file of the filtered masterlist.
     */
    public function generateMasterlistExcel(Request $request)
    {
        return Excel::download(new StufapMasterlistExport($request), 'StuFAPs-Masterlist.xlsx');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate(['file' => 'required|string']);
        $filePath = $request->input('file');

        if (!Storage::exists($filePath)) {
            return redirect()->back()->with('error', 'File upload not found. Please try again.');
        }

        ProcessStufapImport::dispatch($filePath);

        return redirect()->back()->with('success', 'File received! The import is now being processed in the background.');
    }

    /**
     * ✅ NEW: Fetch aggregated data for the report generator.
     */
    public function StatisticsData()
    {
        $statsByRegion = StufapScholar::select('region', DB::raw('count(*) as total'))
            ->whereNotNull('region')
            ->groupBy('region')
            ->orderBy('total', 'desc')
            ->get();

        return response()->json(['scholarsPerRegion' => $statsByRegion]);
    }
}