<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicYear;
use App\Models\HEI;
use App\Models\Scholar;
use App\Models\Semester;
use App\Models\Course;
use App\Models\Region;
use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Imports\StuFapsImport; // ✅ Import the new class
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Exports\StuFapsStatisticsExport; // ✅ New Export Class
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;
use App\Exports\StuFapsExport;
use Barryvdh\DomPDF\Facade\Pdf;
class StuFapsController extends Controller
{
    private $programId;

    public function __construct()
    {
        $program = Program::firstOrCreate(['program_name' => 'StuFAPs']);
        $this->programId = $program->id;
    }

    public function index(Request $request): Response
    {
        // 1. QUERY BUILDER
        $query = AcademicRecord::with([
            'enrollment.scholar.address.province',
            'enrollment.scholar.address.city',
            'enrollment.scholar.address.barangay', 
            'hei',
            'course',
            'academicYear',
            'semester',
            'billingRecord'
        ])
        ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->programId));

        // 2. SEARCH & FILTERS
        $query->when($request->input('search'), function ($q, $search) {
            $q->whereHas('enrollment.scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhere('award_number', 'like', "%{$search}%");
            });
        });
$pid = $this->programId;
        
        $stats = [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            
            // 1. By Sex
            'by_sex' => DB::table('scholars')
                ->join('scholar_enrollments', 'scholars.id', '=', 'scholar_enrollments.scholar_id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('scholars.sex', DB::raw('count(*) as count'))
                ->groupBy('scholars.sex')
                ->get(),

            // 2. By Scholarship Code
            'by_code' => DB::table('scholar_enrollments')
                ->where('program_id', $pid)
                ->select('scholarship_type', DB::raw('count(*) as count'))
                ->groupBy('scholarship_type')
                ->orderByDesc('count')
                ->get(),

            // 3. By HEI Type (Public/Private)
            'by_hei_type' => DB::table('heis')
                ->join('scholar_enrollments', 'heis.id', '=', 'scholar_enrollments.hei_id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('heis.type_of_heis', DB::raw('count(*) as count'))
                ->groupBy('heis.type_of_heis')
                ->get(),
                
            // 4. Financials by Year
            'financials_by_year' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(academic_records.grant_amount) as total'))
                ->groupBy('academic_years.name')
                ->orderBy('academic_years.name')
                ->get(),
        ];

    
        // Apply filters
        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('hei_id')) $query->where('hei_id', $v);
        if ($v = $request->input('province_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));

        // 3. FETCH DATA (Large Limit for "Excel-like" Sheets)
       $limit = $request->input('limit', 10); 
        $enrollments = $query->paginate($limit)->withQueryString();

$paginatedHeis = HEI::query()
            // 1. FILTER: Only show HEIs that actually have StuFAPs scholars
            ->whereHas('enrollments', function($q) {
                $q->where('program_id', $this->programId);
            })
            // 2. COUNT: Get the specific count for display
            ->withCount(['enrollments' => fn($q) => $q->where('program_id', $this->programId)])
            // 3. SEARCH: Normal search logic
            ->when($request->input('hei_search'), function($q, $search) {
                $q->where('hei_name', 'like', "%{$search}%");
            })
            ->orderBy('hei_name')
            ->paginate(10, ['*'], 'heis_page')
            ->withQueryString();
            
        return Inertia::render('StuFaps/Index', [
            'heiList' => HEI::whereHas('enrollments', function($q) {
                $q->where('program_id', $this->programId);
            })->select('id', 'hei_name', 'type_of_heis')->orderBy('hei_name')->get(),
            'enrollments' => $enrollments,
            'filters' => $request->all(),
            'heis' => $paginatedHeis, // Was 'paginatedHeis', change to 'heis' to match frontend prop
            'stats' => $stats,
            'academicYears' => AcademicYear::orderBy('name', 'desc')->get(),
            'programs' => Course::limit(100)->get(), // Or specific scholarship codes
            'regions' => Region::select('id', 'name')->get(),
            'provinces' => Province::select('id', 'name')->get(),
            'semesters' => Semester::select('id', 'name')->get(),
            'programs' => Course::limit(100)->get(),
        ]);
    }
public function exportStatisticsExcel()
    {
        return Excel::download(
            new StuFapsStatisticsExport($this->programId), 
            'StuFaps_Statistics_' . date('Y-m-d') . '.xlsx'
        );
    }

    /**
     * ✅ EXPORT STATISTICS PDF
     */
    public function exportStatisticsPdf()
    {
        $pid = $this->programId;
        
        // Re-fetch full stats for PDF (No limits)
        $data = [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            'by_code' => DB::table('scholar_enrollments')->where('program_id', $pid)
                ->select('scholarship_type', DB::raw('count(*) as count'))->groupBy('scholarship_type')->orderByDesc('count')->get(),
            'financials' => DB::table('academic_records')->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(academic_records.grant_amount) as total'))->groupBy('academic_years.name')->orderBy('academic_years.name')->get(),
        ];

        $pdf = Pdf::loadView('stufaps.pdf_statistics', ['stats' => $data]);
        return $pdf->stream('StuFaps_Statistics_' . date('Y-m-d') . '.pdf');
    }
public function exportExcel(Request $request)
    {
        return Excel::download(
            new StuFapsExport($this->programId, $request->all()), 
            'CHED_RO9_StuFaps_Masterlist_' . date('Y-m-d_Hi') . '.xlsx'
        );
    }

    public function exportPdf(Request $request)
    {
        // Increase memory limit for large PDF generation
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', '300');

        $export = new StuFapsExport($this->programId, $request->all());
        $records = $export->query()->limit(1000)->get(); // Cap at 1000 for PDF stability

        $pdf = Pdf::loadView('stufaps.pdf_masterlist', ['records' => $records])
                  ->setPaper('a4', 'landscape');
                  
        return $pdf->stream('CHED_RO9_StuFaps_Masterlist.pdf'); // 'stream' opens in browser, 'download' saves file
    }
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            // Excel::import will detect ShouldQueue and dispatch the job automatically
            Excel::import(new StuFapsImport(Auth::id()), $request->file('file'));

            // ✅ UPDATE MESSAGE: User sees this immediately while data loads in background
            return redirect()->back()->with('success', 'Import started! Data is processing in the background.');
            
        } catch (\Exception $e) {
            Log::error("StuFAPs Import Error: " . $e->getMessage());
            return redirect()->back()->with('error', 'Import Failed: ' . $e->getMessage());
        }
    }
public function showScholar(Scholar $scholar) 
    {
        // 1. Get the StuFAPs Enrollment with HEI and Program info
        $enrollment = ScholarEnrollment::with(['hei', 'program'])
            ->where('scholar_id', $scholar->id)
            ->where('program_id', $this->programId)
            ->firstOrFail();

        // 2. Load Scholar details including deep address relationships
        $scholar->load(['address.province', 'address.city']);

        // 3. Get History (Academic Records) with all necessary relations
        $records = AcademicRecord::with(['academicYear', 'semester', 'course', 'hei'])
            ->where('scholar_enrollment_id', $enrollment->id)
            ->orderBy('academic_year_id', 'desc') // Latest AY first
            ->orderBy('semester_id', 'desc')
            ->get();

        return Inertia::render('StuFaps/Partials/StufapScholarHistory', [
            'scholar' => $scholar,
            'enrollment' => $enrollment,
            'records' => $records
        ]);
    }
public function showHei(Request $request, HEI $hei) 
    {
        // Keep your exact structure as requested
        $query = ScholarEnrollment::with([
                'scholar', 
                // ✅ Using 'academicrecords' as per your request
                'academicrecords' => function($q) {
                    $q->latest('updated_at'); 
                },
                'academicrecords.course', 
                'academicrecords.academicYear', 
                'academicrecords.semester', 
                'academicrecords.hei'
            ])
            ->where('program_id', $this->programId)
            ->where('hei_id', $hei->id);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('award_number', 'like', "%{$search}%")
                  ->orWhereHas('scholar', function($sub) use ($search) {
                      $sub->where('family_name', 'like', "%{$search}%")
                          ->orWhere('given_name', 'like', "%{$search}%");
                  });
            });
        }

        // ✅ FIX: Limited to 15 as requested
        $scholars = $query->paginate(10)->withQueryString();
            
        return Inertia::render('StuFaps/Partials/ShowHei', [
            'hei' => $hei,
            'scholars' => $scholars,
            'filters' => $request->only(['search']),
        ]);
    }
    /**
     * BULK UPDATE (Grid Save)
     */
  public function bulkUpdate(Request $request)
    {
        // 1. Log the payload for confirmation (you can remove this later)
        \Illuminate\Support\Facades\Log::info('Processing Bulk Update:', $request->all());

        // 2. Normalize the input key (Handle 'enrollments' OR 'records')
        $items = $request->input('enrollments') ?? $request->input('records');

        if (!$items || !is_array($items)) {
            return redirect()->back()->withErrors(['error' => 'No records received. Data format mismatch.']);
        }

        try {
            DB::transaction(function () use ($items) {
                foreach ($items as $row) {
                    // 3. Identify the ID (Handle 'academic_record_id' OR 'id')
                    $id = $row['academic_record_id'] ?? $row['id'] ?? null;

                    if (empty($id)) continue; 

                    $record = AcademicRecord::with(['enrollment.scholar'])->find($id);
                    
                    if ($record) {
                        // --- A. Update Academic Record (Financials & Year) ---
                        $academicUpdates = [];
                        
                        if (isset($row['amount'])) {
                            // Clean currency symbols just in case
                            $cleanAmount = str_replace([',', 'P', '₱', ' '], '', $row['amount']);
                            $academicUpdates['grant_amount'] = is_numeric($cleanAmount) ? $cleanAmount : 0;
                        }
                        
                        if (isset($row['year_level'])) {
                            $academicUpdates['year_level'] = $row['year_level'];
                        }
                        
                        if (!empty($academicUpdates)) {
                            $record->update($academicUpdates);
                        }

                        // --- B. Update Enrollment (Award No & Code) ---
                        if ($record->enrollment) {
                            $enrollmentUpdates = [];
                            
                            // Map 'award_no' (from logs) -> DB 'award_number'
                            if (isset($row['award_no'])) $enrollmentUpdates['award_number'] = $row['award_no'];
                            elseif (isset($row['award_number'])) $enrollmentUpdates['award_number'] = $row['award_number'];

                            // Map 'scholarship_code' -> DB 'scholarship_type'
                            if (isset($row['scholarship_code'])) $enrollmentUpdates['scholarship_type'] = $row['scholarship_code'];

                            if (!empty($enrollmentUpdates)) {
                                $record->enrollment->update($enrollmentUpdates);
                            }

                            // --- C. Update Scholar Profile (Names & Sex) ---
                            if ($record->enrollment->scholar) {
                                $scholarUpdates = [];
                                if (isset($row['family_name'])) $scholarUpdates['family_name'] = $row['family_name']; // Matches Log
                                elseif (isset($row['last_name'])) $scholarUpdates['family_name'] = $row['last_name'];

                                if (isset($row['given_name'])) $scholarUpdates['given_name'] = $row['given_name'];   // Matches Log
                                elseif (isset($row['first_name'])) $scholarUpdates['given_name'] = $row['first_name'];

                                if (isset($row['middle_name'])) $scholarUpdates['middle_name'] = $row['middle_name'];
                                if (isset($row['sex'])) $scholarUpdates['sex'] = $row['sex'];

                                if (!empty($scholarUpdates)) {
                                    $record->enrollment->scholar->update($scholarUpdates);
                                }
                            }
                        }
                    }
                }
            });

            return redirect()->back()->with('success', 'Database updated successfully!');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Bulk Update Exception: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Update Failed: ' . $e->getMessage());
        }
    }
}