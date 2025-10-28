<?php

namespace App\Http\Controllers;

use App\Models\TesScholar;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\TesAcademicRecord;
use App\Imports\TesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\RedirectResponse; // Add this
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\HEI;
use App\Models\Course;
use Carbon\Carbon;
use App\Jobs\ProcessTesImport;
use App\Exports\TesMasterlistExport;
use App\Exports\TesStatisticsExport;
class TesController extends Controller
{
   public function generateStatisticsExcel()
    {
        // ▼▼▼ THIS IS THE FIX ▼▼▼
        // Use the Excel facade to download the export object as a file.
        return Excel::download(new TesStatisticsExport(), 'TES-Statistics-Report.xlsx');
        // ▲▲▲ END OF FIX ▲▲▲
    }
public function generateMasterlistPdf(Request $request)
    {
        // Reuse the same query logic from your index's masterlist
        $mlQuery = TesAcademicRecord::with(['scholar', 'hei', 'course']);
        $mlQuery->when($request->input('search_ml'), function ($q, $search) {
            return $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'LIKE', "%{$search}%");
            });
        });
        
        // Get ALL results, not paginated
        $records = $mlQuery->latest()->get();

        $pdf = Pdf::loadView('exports.tes-masterlist-pdf', ['records' => $records]);
        return $pdf->setPaper('legal', 'landscape')->download('TES-Masterlist.pdf');
    }

    /**
     * ✅ NEW: Generate a styled Excel file of the filtered masterlist.
     */
    public function generateMasterlistExcel(Request $request)
    {
        // We pass the request to the export class so it can handle the search filter
        return Excel::download(new TesMasterlistExport($request), 'TES-Masterlist.xlsx');
    }
    public function generateStatisticsPdf(Request $request)
    {
        $validated = $request->validate([
            'regionChartImage' => 'required|string', // Expects a Base64 string for the region chart
            'sexChartImage' => 'required|string',    // Expects a Base64 string for the sex chart
        ]);

        // Fetch the same data again to display in the PDF tables
        $stats = $this->fetchStatisticsData()->getData(true);

        // Load the view and pass all the necessary data to it
        $pdf = Pdf::loadView('exports.tes-statistics-report', [
            'stats' => $stats,
            'regionChartImage' => $validated['regionChartImage'],
            'sexChartImage' => $validated['sexChartImage'],
        ]);

        return $pdf->setPaper('a4', 'portrait')->download('TES-Statistics-Report.pdf');
    }
public function index(Request $request): Response
{
    // --- Query for the Main Database Grid (Detailed Data) ---

    // Query now starts from TesAcademicRecord, the correct entry point for your normalized data.
    $dbQuery = TesAcademicRecord::with(['scholar', 'hei', 'course']);

    // Apply search if 'search_db' parameter exists
    $dbQuery->when($request->input('search_db'), function ($q, $search) {
        // This search now looks across multiple related tables for better results.
        return $q->where(function($subQ) use ($search) {
            $subQ->where('award_no', 'LIKE', "%{$search}%") // Search on the record itself
                 ->orWhereHas('scholar', function ($scholarQuery) use ($search) {
                     $scholarQuery->where('family_name', 'LIKE', "%{$search}%")
                                  ->orWhere('given_name', 'LIKE', "%{$search}%");
                 })
                 ->orWhereHas('hei', function ($heiQuery) use ($search) {
                     $heiQuery->where('hei_name', 'LIKE', "%{$search}%");
                 });
        });
    });

    // Paginate with a unique page name to avoid conflicts
    $tesDatabase = $dbQuery->latest()->paginate(50, ['*'], 'db_page')->withQueryString();

    // --- Query for the Masterlist Grid (Simplified Data) ---

    // This query also starts from TesAcademicRecord
    $mlQuery = TesAcademicRecord::with(['scholar', 'hei', 'course']);
    
    // Apply search if 'search_ml' parameter exists
    $mlQuery->when($request->input('search_ml'), function ($q, $search) {
        return $q->whereHas('scholar', function ($scholarQuery) use ($search) {
            $scholarQuery->where('family_name', 'LIKE', "%{$search}%");
        });
    });
    
    // Paginate with its own unique page name
    $tesMasterlist = $mlQuery->latest()->paginate(25, ['*'], 'ml_page')->withQueryString();

    // The prop names remain the same to match your frontend Index.tsx
    return Inertia::render('Admin/Tes/Index', [
        'tesDatabase' => $tesDatabase,
        'tesMasterlist' => $tesMasterlist,
        'filters' => $request->only(['search_db', 'search_ml']),
    ]);
}
public function upload(Request $request): string
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        // Store the file in 'storage/app/imports' and return the unique path
        $path = $request->file('file')->store('imports');
        
        return $path;
    }

    /**
     * ✅ UPDATED: Handle the Excel file import using a file path from FilePond.
     */
  public function import(Request $request): RedirectResponse

 {  
    $request->validate(['file' => 'required|string']);
    $filePath = $request->input('file');

    // Ensure the temporary file from FilePond actually exists
    if (!Storage::exists($filePath)) {
        return redirect()->back()->with('error', 'File upload not found. Please try again.');
    }

    // ✅ Dispatch the job to the queue. This is instantaneous.
    ProcessTesImport::dispatch($filePath);

    // Immediately return a success message to the user
    return redirect()->back()->with('success', 'File received! The import is now being processed in the background.');
}
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // Skip empty rows that might come from the grid's spare rows
                if (empty($row['family_name']) && empty($row['given_name'])) {
                    continue;
                }

                // 1. Normalize related data: Find or create the HEI and Course
                $hei = HEI::firstOrCreate(['hei_name' => $row['hei_name'] ?? 'N/A']);
                $course = Course::firstOrCreate(['course_name' => $row['course_name'] ?? 'N/A']);

                // 2. Update or Create the Scholar's permanent information
                $scholar = TesScholar::updateOrCreate(
                    [
                        // Use a combination of fields that uniquely identifies a person
                        'family_name' => $row['family_name'],
                        'given_name' => $row['given_name'],
                        'birthdate' => $this->sanitizeDate($row['birthdate'] ?? null),
                    ],
                    [
                        'middle_name' => $row['middle_name'],
                        'extension_name' => $row['extension_name'] ?? null, // Gracefully handles missing keys
                        'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
                        'street' => $row['street'],
                        'municipality' => $row['municipality'],
                        'province' => $row['province'],
                        'pwd_classification' => $row['pwd_classification'] ?? null,
                    ]
                );

            
                TesAcademicRecord::updateOrCreate(
                    ['id' => $row['id'] ?? null],
                    [
                        'tes_scholar_id' => $scholar->id,
                        'hei_id' => $hei->id,
                        'course_id' => $course->id,
                        'seq' => $row['seq'],
                        'app_no' => $row['app_no'],
                        'award_no' => $row['award_no'],
                        'year_level' => $row['year_level'],
                        'total_units_enrolled' => $row['total_units_enrolled'],
                        'grant_amount' => $row['grant_amount'],
                        'batch_no' => $row['batch_no'],
                        'validation_status' => $row['validation_status'],
                        'payment_status' => $row['payment_status'],
                        'remarks' => $row['remarks'],
                        'endorsed_by' => $row['endorsed_by'],
                        'semester' => $row['semester'],
                        'academic_year' => $row['academic_year'],
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'TES data saved successfully!');
    }
    public function fetchMasterlistData(): JsonResponse
    {
        $scholars = TesScholar::with(['address', 'education', 'academicYears'])->get();
        $formattedData = $this->formatForMasterlist($scholars);
        return response()->json($formattedData);
    }
private function sanitizeDate($value): ?string
    {
        // Immediately return null if the value is empty or clearly not a date
        if (empty($value) || !is_string($value) || strcasecmp(trim($value), 'N/A') === 0) {
            return null;
        }

        try {
            // Use Carbon to intelligently parse various formats (like M/D/Y, D-M-Y, etc.)
            // and convert them to the standard 'Y-m-d' format the database requires.
            return Carbon::parse(trim($value))->format('Y-m-d');
        } catch (\Exception $e) {
            // If Carbon can't parse the string, it's not a valid date.
            // Log the problematic value for debugging and safely return null.
            Log::warning("Could not parse date value: '{$value}'. It will be saved as NULL.");
            return null;
        }
    }
    // --- REPORT GENERATOR LOGIC ---

    /**
     * Fetch aggregated statistics for the report generator charts.
     */
    private function formatForMasterlist($scholars)
    {
        return $scholars->map(function ($scholar, $key) {
            $latestYear = $scholar->academicYears->sortByDesc('academic_year')->first();
            return [
                'id' => $scholar->id,
                'no' => $key + 1,
                'last_name' => $scholar->family_name,
                'first_name' => $scholar->given_name,
                'hei' => $scholar->education->hei_name ?? 'N/A',
                'course' => $scholar->education->course_name ?? 'N/A',
                'region' => $scholar->address->region ?? 'N/A',
                'year_level' => $latestYear->year_level ?? 'N/A',
            ];
        });
    }
public function fetchStatisticsData()
{
    // 1. Scholars per Region (from the scholar's permanent address)
    $scholarsPerRegion = TesScholar::select('province', DB::raw('count(*) as total'))
        ->whereNotNull('province')
        ->groupBy('province')
        ->orderBy('total', 'desc')
        ->get();

    // 2. Scholars by Sex
    $scholarsBySex = TesScholar::select('sex', DB::raw('count(*) as total'))
        ->whereNotNull('sex')
        ->whereIn('sex', ['M', 'F']) // Only count valid entries
        ->groupBy('sex')
        ->get();

    // 3. Scholars by Year Level (from the most recent records)
    $scholarsByYearLevel = TesAcademicRecord::select('year_level', DB::raw('count(*) as total'))
        ->whereNotNull('year_level')
        ->groupBy('year_level')
        ->orderBy('year_level', 'asc')
        ->get();

    return response()->json([
        'scholarsPerRegion' => $scholarsPerRegion,
        'scholarsBySex' => $scholarsBySex,
        'scholarsByYearLevel' => $scholarsByYearLevel,
    ]);
}
    public function getTesData(): JsonResponse
    {
        $scholars = TesScholar::with(['address', 'education', 'academicYears'])->get();

        $formattedData = $scholars->map(function ($scholar) {
            $latestYear = $scholar->academicYears->sortByDesc('academic_year')->first();
            return [
                'id' => $scholar->id,
                'family_name' => $scholar->family_name,
                'given_name' => $scholar->given_name,
                'middle_name' => $scholar->middle_name,
                'sex' => $scholar->sex,
                'region' => $scholar->address->region ?? null,
                'hei' => $scholar->education->hei_name ?? null,
                'course' => $scholar->education->course_name ?? null,
                'year_level' => $latestYear->year_level ?? null,
                'remarks' => $latestYear->remarks ?? null,
            ];
        });

        return response()->json($formattedData);
    }

    public function updateTesData(Request $request): JsonResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                if (empty($row['family_name']) && empty($row['given_name'])) {
                    continue;
                }

                $scholar = TesScholar::updateOrCreate(
                    [
                        'family_name' => $row['family_name'],
                        'given_name' => $row['given_name'],
                        'middle_name' => $row['middle_name'] ?? null
                    ],
                    ['sex' => $row['sex'] ?? null]
                );

                $scholar->address()->updateOrCreate([], ['region' => $row['region'] ?? null]);
                $scholar->education()->updateOrCreate([], [
                    'hei_name' => $row['hei'] ?? null,
                    'course_name' => $row['course'] ?? null,
                ]);
                $scholar->academicYears()->updateOrCreate(
                    ['academic_year' => '2023-2024'], // Example, you can make this dynamic later
                    [
                        'year_level' => $row['year_level'] ?? null,
                        'remarks' => $row['remarks'] ?? null,
                    ]
                );
            }
        });

        return response()->json(['message' => 'TES data updated successfully!']);
    }
}