<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\HEI;
use App\Models\Course;
use App\Models\Region;
use App\Models\Province;
use App\Models\BillingRecord;
use App\Models\Barangay;
use App\Models\Scholar;
use Illuminate\Support\Facades\DB;
use App\Models\City;
use App\Models\District;
use App\Imports\MsrsProfileImport; // The custom importer
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Database\Eloquent\Builder;
use App\Exports\MsrsMasterlistExport; // ✅ Import the Export Class
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf; // ✅ Import PDF Facade

use App\Exports\MsrsStatisticsExport; // ✅ Import Statistics Export Class





class MsrsController extends Controller
{
    private $msrsProgramId;
    private $academicYears;

    public function __construct()
    {
        // 1. Identify MSRS Program
        $program = Program::firstOrCreate(['program_name' => 'MSRS']);
        $this->msrsProgramId = $program->id;

        // 2. Pre-fetch Academic Years for Filters
        $this->academicYears = AcademicYear::query()
            ->whereHas('academicRecords', function ($arQuery) {
                $arQuery->whereHas('enrollment', function ($eQuery) {
                    $eQuery->where('program_id', $this->msrsProgramId);
                });
            })
            ->orderBy('name', 'desc')
            ->pluck('name')->toArray();
    }

  public function index(Request $request): Response
    {
        // 1. MAIN QUERY
        $query = AcademicRecord::with([
            'enrollment.scholar.address.region',
            'enrollment.scholar.address.province',
            'enrollment.scholar.address.city',
            'enrollment.scholar.address.district',
            'enrollment.scholar.address.barangay', 
            'enrollment.program',
            'hei',
            'course',
            'academicYear',
            'semester',
            'billingRecord'
        ])
        ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->msrsProgramId));

        // 2. FILTERS
        $query->when($request->input('search'), function ($q, $search) {
            $q->whereHas('enrollment.scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhere('award_number', 'like', "%{$search}%");
            });
        });

        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $query->where('semester_id', $v);
        if ($v = $request->input('hei_id')) $query->where('hei_id', $v);
        if ($v = $request->input('course_id')) $query->where('course_id', $v);
        
        if ($v = $request->input('region_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        if ($v = $request->input('province_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        if ($v = $request->input('city_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        if ($v = $request->input('district_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));

        // ✅ FIX: Load 500 records for the Excel-like Grid
        $limit = $request->input('limit', 500); 
        $enrollments = $query->latest('updated_at')->paginate($limit)->withQueryString();

        // 3. AUXILIARY DATA
        $searchHei = $request->input('search_hei');
        $heiQuery = HEI::query()
            ->whereHas('enrollments', fn($q) => $q->where('program_id', $this->msrsProgramId))
            ->withCount(['enrollments' => fn($q) => $q->where('program_id', $this->msrsProgramId)]);
            
        if ($searchHei) $heiQuery->where('hei_name', 'like', "%{$searchHei}%");
        $paginatedHeis = $heiQuery->orderBy('hei_name')->paginate(9, ['*'], 'hei_page')->withQueryString();

        $stats = $this->calculateStats();

        return Inertia::render('Msrs/Index', [
            'enrollments' => $enrollments,
            'paginatedHeis' => $paginatedHeis,
            'filters' => $request->all(),
            'academicYears' => $this->academicYears,
            'semesters' => Semester::select('id', 'name')->get(),
            'heiList' => HEI::whereHas('enrollments', fn($q) => $q->where('program_id', $this->msrsProgramId))->get(),
            'stats' => $stats,
            'courses' => Course::orderBy('course_name')->get(),
            'regions' => Region::select('id', 'name')->get(),
            'provinces' => Province::select('id', 'name')->get(),
            'cities' => City::select('id', 'name')->get(),
            'districts' => District::select('id', 'name')->get(),
        ]);
    }
    private function buildMasterlistQuery(Request $request)
    {
        $query = AcademicRecord::with([
            'enrollment.scholar.address.region',
            'enrollment.scholar.address.province',
            'enrollment.scholar.address.city',
            'enrollment.scholar.address.district',
            'enrollment.scholar.address.barangay', 
            'enrollment.program',
            'hei',
            'course',
            'academicYear',
            'semester',
            'billingRecord'
        ])
        ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->msrsProgramId));

        // Filters
        $query->when($request->input('search'), function ($q, $search) {
            $q->whereHas('enrollment.scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhere('award_number', 'like', "%{$search}%");
            });
        });

        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $query->where('semester_id', $v);
        if ($v = $request->input('hei_id')) $query->where('hei_id', $v);
        if ($v = $request->input('course_id')) $query->where('course_id', $v);
        
        // Location Filters
        if ($v = $request->input('region_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        if ($v = $request->input('province_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        if ($v = $request->input('city_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        if ($v = $request->input('district_id')) $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));

        return $query;
    }
private function calculateStats() 
    {
        // 1. Financial Trend
        $financialTrend = DB::table('academic_records')
            ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->where('scholar_enrollments.program_id', $this->msrsProgramId)
            ->select('academic_years.name as year', DB::raw('SUM(academic_records.grant_amount) as total'))
            ->groupBy('academic_years.name')
            ->orderBy('academic_years.name')
            ->get();

        // 2. Gender Distribution
        $genderStats = Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $this->msrsProgramId))
            ->select('sex', DB::raw('count(*) as total'))
            ->groupBy('sex')
            ->get()
            ->map(fn($s) => ['name' => $s->sex ?: 'Unspecified', 'value' => $s->total]);

        // 3. Top Provinces
        $provinceStats = Province::whereHas('addresses.scholar.enrollments', fn($q) => $q->where('program_id', $this->msrsProgramId))
            ->withCount(['addresses as total_scholars' => fn($q) => 
                $q->whereHas('scholar.enrollments', fn($sq) => $sq->where('program_id', $this->msrsProgramId))
            ])
            ->orderByDesc('total_scholars')
            ->limit(10)
            ->get()
            ->map(fn($p) => ['name' => $p->name, 'value' => $p->total_scholars]);

        // 4. HEI Stats
        $heiStats = HEI::withCount(['enrollments' => fn($q) => $q->where('program_id', $this->msrsProgramId)])
            ->having('enrollments_count', '>', 0)
            ->orderByDesc('enrollments_count')
            ->get()
            ->map(fn($h) => ['name' => $h->hei_name, 'value' => $h->enrollments_count]);

        return [
            'total_scholars' => ScholarEnrollment::where('program_id', $this->msrsProgramId)->count(),
            'active_scholars' => ScholarEnrollment::where('program_id', $this->msrsProgramId)
                ->whereIn('status', ['Enrolled', 'Validated', 'Active'])->count(),
            'total_disbursed' => AcademicRecord::whereHas('enrollment', function($q) {
                $q->where('program_id', $this->msrsProgramId);
            })->sum('grant_amount'),
            'scholars_by_hei' => $heiStats,
            'scholars_by_status' => ScholarEnrollment::where('program_id', $this->msrsProgramId)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get()
                ->map(fn($s) => ['name' => $s->status ?: 'Unknown', 'value' => $s->total]),
            'financial_trend' => $financialTrend,
            'gender_distribution' => $genderStats,
            'scholars_by_province' => $provinceStats
        ];
    }


   

    public function generateStatisticsPdf()
    {
        $stats = $this->calculateStats();
        
        $pdf = Pdf::loadView('exports.msrs.statistics-pdf', [
            'stats' => $stats,
            'generated_at' => now()->format('F d, Y h:i A'),
            'user' => Auth::user()->name ?? 'System'
        ]);

        return $pdf->download("MSRS_Statistics_Report_" . now()->format('Y-m-d') . ".pdf");
    }

    // ✅ 2. Generate Statistics Excel
    public function generateStatisticsExcel()
    {
        $stats = $this->calculateStats();
        $date = now()->format('Y-m-d');
        return Excel::download(new MsrsStatisticsExport($stats), "MSRS_Statistics_Report_{$date}.xlsx");
    }

    // ✅ UPDATED EXPORT TO EXCEL
    public function exportExcel(Request $request)
    {
        // Get the query builder
        $query = $this->buildMasterlistQuery($request);
        
        // Execute query to get results for the view
        $records = $query->get(); 
        
        $date = now()->format('Y-m-d');
        
        // Pass the RECORDS (Collection) not the QUERY
        return Excel::download(new MsrsMasterlistExport($records), "MSRS_Masterlist_{$date}.xlsx");
    }

    // ✅ EXPORT TO PDF
    public function exportPdf(Request $request)
    {
        $records = $this->buildMasterlistQuery($request)->get();
        
        $pdf = Pdf::loadView('exports.msrs.masterlist-pdf', [
            'records' => $records,
            'generated_at' => now()->format('F d, Y h:i A'),
            'user' => Auth::user()->name ?? 'System'
        ])->setPaper('a4', 'landscape');

        return $pdf->download("MSRS_Masterlist_" . now()->format('Y-m-d') . ".pdf");
    }
public function showHei(Request $request, HEI $hei): Response
    {
        // 1. Load HEI details
        $hei->load(['province', 'region']); // Assuming relationships exist

        // 2. Query MSRS Records for THIS HEI
        $query = AcademicRecord::with([
            'enrollment.scholar.address.province',
            'enrollment.scholar.address.city',
            'enrollment.program',
            'course',
            'academicYear',
            'semester',
            'billingRecord'
        ])
        ->where('hei_id', $hei->id) // <--- KEY FILTER
        ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->msrsProgramId));

        // 3. Apply Filters (Search, Year, Sem)
        $query->when($request->input('search'), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhere('award_number', 'like', "%{$search}%");
            });
        });

        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $query->where('semester_id', $v);

        // 4. Paginate
        $enrollments = $query->latest('updated_at')->paginate(15)->withQueryString();

        // 5. Get Filter Options specific to this HEI
        $semesters = Semester::select('id', 'name')->get();
        // Get courses only available in this HEI for MSRS
        $courses = Course::whereHas('academicRecords', function ($q) use ($hei) {
            $q->where('hei_id', $hei->id)
              ->whereHas('enrollment', fn($sq) => $sq->where('program_id', $this->msrsProgramId));
        })->distinct()->get();

        return Inertia::render('Msrs/Partials/ShowHei', [
            'hei' => $hei,
            'enrollments' => $enrollments,
            'filters' => $request->all(),
            'academicYears' => $this->academicYears,
            'semesters' => $semesters,
            'courses' => $courses,
        ]);
    }
   

/**
     * Bulk Update records from the Handsontable Grid
     */
    public function showScholar(Scholar $scholar)
{
    // 1. Load basic relationships
    $scholar->load(['address.province', 'address.city']);

    // 2. Get the main MSRS Enrollment
    $enrollment = ScholarEnrollment::where('scholar_id', $scholar->id)
        ->where('program_id', $this->msrsProgramId)
        ->first();

    // 3. Get History (Academic Records)
    // Ordered by latest academic year first
    $academicRecords = AcademicRecord::with(['academicYear', 'semester', 'course', 'hei'])
        ->whereHas('enrollment', function($q) use ($scholar) {
            $q->where('scholar_id', $scholar->id);
        })
        ->orderByDesc('academic_year_id')
        ->orderByDesc('semester_id')
        ->get();

    return Inertia::render('Msrs/Partials/ScholarHistory', [
        'scholar' => $scholar,
        'enrollment' => $enrollment,
        'academicRecords' => $academicRecords
    ]);
}
    public function bulkUpdate(Request $request)
    {
        // 1. INPUT SANITIZATION
        $cleanedData = [];
        if (!$request->has('enrollments') || !is_array($request->enrollments)) {
            return redirect()->back()->withErrors(['enrollments' => 'No data provided for update.']);
        }

        foreach ($request->enrollments as $row) {
            $cleanedRow = $row;

            // Normalize Sex
            if (isset($cleanedRow['sex'])) {
                $sex = strtolower(trim($cleanedRow['sex']));
                if ($sex === 'male' || $sex === 'm') $cleanedRow['sex'] = 'M';
                elseif ($sex === 'female' || $sex === 'f') $cleanedRow['sex'] = 'F';
            }

            // Handle Arrays/Nulls
            foreach ($cleanedRow as $key => $value) {
                if (is_array($value)) {
                    $value = null; 
                } elseif (is_string($value)) {
                    $value = trim($value);
                    if ($value === '') $value = null;
                }
                $cleanedRow[$key] = $value;
            }

            $cleanedData[] = $cleanedRow;
        }

        // 2. VALIDATION
        $validator = Validator::make(['enrollments' => $cleanedData], [
            'enrollments' => 'required|array',
            'enrollments.*.scholar_id' => 'nullable|integer|exists:scholars,id',
            'enrollments.*.family_name' => 'required_without:enrollments.*.scholar_id|nullable|string|max:255',
            'enrollments.*.given_name' => 'required_without:enrollments.*.scholar_id|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        try {
            DB::transaction(function () use ($cleanedData) {
                foreach ($cleanedData as $row) {
                    
                    // Defaults to prevent undefined index errors
                    $defaults = [
                        'family_name' => null, 'given_name' => null, 'middle_name' => null, 'extension_name' => null,
                        'sex' => null, 'award_no' => null, 'seq' => null,
                        'province' => null, 'city_municipality' => null, 'district' => null, 'barangay' => null,
                        'hei_name' => null, 'hei_type' => null, 'course_name' => null, 
                        'year_level' => null, 'academic_year' => null, 'semester' => null,
                        'grant_amount' => 0, 'validation_status' => 'Pending'
                    ];
                    $safeRow = array_merge($defaults, $row);

                   // 1. Resolve Province
                    $provinceId = null;
                    if (!empty($safeRow['province'])) {
                        $prov = Province::firstOrCreate(['name' => $safeRow['province']]);
                        $provinceId = $prov->id;
                    }

                    // 2. Resolve City (CRITICAL FIX HERE)
                    $cityId = null;
                    if (!empty($safeRow['city_municipality'])) {
                        // Attempt to find existing city
                        $cQuery = City::where('name', $safeRow['city_municipality']);
                        if ($provinceId) {
                            $cQuery->where('province_id', $provinceId);
                        }
                        $city = $cQuery->first();
                        
                        // Only CREATE if missing AND we have a valid Province ID
                        if (!$city && $provinceId) {
                            $city = City::create([
                                'name' => $safeRow['city_municipality'], 
                                'province_id' => $provinceId
                            ]);
                        }
                        
                        // If we found or created a city, get its ID.
                        // If we didn't have a provinceId, we SKIP creating the city to avoid SQL Error 1364.
                        if ($city) {
                            $cityId = $city->id;
                        }
                    }

                    $districtId = null;
                    if (!empty($safeRow['district']) && $provinceId) {
                        $dist = District::firstOrCreate(
                            ['name' => $safeRow['district'], 'province_id' => $provinceId], 
                            ['name' => $safeRow['district']]
                        );
                        $districtId = $dist->id;
                    }

                    $barangayId = null;
                    if (!empty($safeRow['barangay']) && $cityId) {
                        // Assuming Barangay model uses 'barangay' column for name and 'cityID' for foreign key
                        $brgy = Barangay::firstOrCreate(
                            ['barangay' => $safeRow['barangay'], 'cityID' => $cityId], 
                            ['barangay' => $safeRow['barangay']]
                        );
                        $barangayId = $brgy->id ?? $brgy->barangayID;
                    }

                    // --- B. SCHOLAR UPDATE/CREATE ---
                    $scholar = null;
                    if (!empty($safeRow['scholar_id'])) {
                        $scholar = Scholar::find($safeRow['scholar_id']);
                        if ($scholar) {
                            $scholar->update([
                                'family_name' => $safeRow['family_name'],
                                'given_name' => $safeRow['given_name'],
                                'middle_name' => $safeRow['middle_name'],
                                'extension_name' => $safeRow['extension_name'],
                                'sex' => $safeRow['sex'],
                            ]);
                        }
                    } else {
                        // New Scholar
                        if ($safeRow['family_name'] && $safeRow['given_name']) {
                            $scholar = Scholar::create([
                                'family_name' => $safeRow['family_name'],
                                'given_name' => $safeRow['given_name'],
                                'middle_name' => $safeRow['middle_name'],
                                'extension_name' => $safeRow['extension_name'],
                                'sex' => $safeRow['sex'],
                            ]);
                        } else {
                            continue; // Skip invalid rows
                        }
                    }

                    // Update Address
                    if ($scholar) {
                        $scholar->address()->updateOrCreate(
                            ['scholar_id' => $scholar->id],
                            [
                                'province_id' => $provinceId,
                                'city_id' => $cityId,
                                'district_id' => $districtId,
                                'barangay_id' => $barangayId,
                                'province' => $safeRow['province'],
                                'town_city' => $safeRow['city_municipality'],
                                'congressional_district' => $safeRow['district'],
                                'barangay' => $safeRow['barangay'],
                            ]
                        );
                    }

                    // --- C. ENROLLMENT ---
                    $enrollment = ScholarEnrollment::firstOrCreate(
                        ['scholar_id' => $scholar->id, 'program_id' => $this->msrsProgramId],
                        ['status' => 'Enrolled', 'award_number' => $safeRow['award_no']]
                    );
                    
                    if ($safeRow['award_no'] && $enrollment->award_number !== $safeRow['award_no']) {
                        $enrollment->update(['award_number' => $safeRow['award_no']]);
                    }

                    // --- D. ACADEMIC RECORD LINKING ---
                    $heiId = null;
                    if (!empty($safeRow['hei_name'])) {
                        $hei = HEI::firstOrCreate(
                            ['hei_name' => $safeRow['hei_name']],
                            ['type_of_heis' => $safeRow['hei_type']]
                        );
                        $heiId = $hei->id;
                    }

                    $courseId = null;
                    if (!empty($safeRow['course_name'])) {
                        $course = Course::firstOrCreate(['course_name' => $safeRow['course_name']]);
                        $courseId = $course->id;
                    }

                    $ayId = null;
                    if (!empty($safeRow['academic_year'])) {
                        $ay = AcademicYear::firstOrCreate(['name' => $safeRow['academic_year']]);
                        $ayId = $ay->id;
                    }

                    $semId = null;
                    if (!empty($safeRow['semester'])) {
                        $sem = Semester::firstOrCreate(['name' => $safeRow['semester']]);
                        $semId = $sem->id;
                    }

                    // Update Enrollment HEI if mostly consistent
                    if ($heiId) {
                        $enrollment->update(['hei_id' => $heiId]);
                    }

                    // --- E. UPDATE/CREATE ACADEMIC RECORD ---
                    $academicRecord = null;
                    if (!empty($safeRow['academic_record_id'])) {
                        $academicRecord = AcademicRecord::find($safeRow['academic_record_id']);
                    }

                    $recordData = [
                        'seq' => $safeRow['seq'],
                        'year_level' => $safeRow['year_level'],
                        'payment_status' => $safeRow['validation_status'], // Using validation status as payment status
                        'grant_amount' => $safeRow['grant_amount'],
                        'hei_id' => $heiId,
                        'course_id' => $courseId,
                        'semester_id' => $semId,
                        'academic_year_id' => $ayId,
                    ];

                    if ($academicRecord) {
                        $academicRecord->update($recordData);
                    } else {
                        // Create new record
                        $academicRecord = AcademicRecord::create(array_merge($recordData, [
                            'scholar_enrollment_id' => $enrollment->id,
                        ]));
                    }

                    // --- F. BILLING RECORD ---
                    // Sync billing amount with grant amount for MSRS
                    $academicRecord->billingRecord()->updateOrCreate(
                        ['academic_record_id' => $academicRecord->id],
                        [
                            'billing_amount' => $safeRow['grant_amount'], 
                            'status' => $safeRow['validation_status'],
                            'validated_by_user_id' => Auth::id(),
                        ]
                    );
                }
            });

            return redirect()->back()->with('success', 'MSRS records updated successfully!');

        } catch (\Exception $e) {
            Log::error('MSRS Bulk Update Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update records: ' . $e->getMessage());
        }
    }

    /**
     * Bulk Destroy records
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:academic_records,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $ids = $request->input('ids');
                AcademicRecord::destroy($ids);
                BillingRecord::whereIn('academic_record_id', $ids)->delete();
            });
            return response()->json(['message' => 'Records deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete records.', 'error' => $e->getMessage()], 500);
        }
    }


 public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            // --- DEBUG MODE: RUN IMMEDIATELY ---
            // We use Excel::import directly with the uploaded file object.
            // This will freeze your browser for a few seconds while it processes, 
            // but if it fails, you will see the EXACT error message.
            
            Excel::import(new MsrsProfileImport(Auth::id()), $request->file('file'));

            return redirect()->back()->with('success', 'Import completed successfully!');
            
        } catch (\Exception $e) {
            // Log the full error for debugging
            Log::error("MSRS Import Error: " . $e->getMessage());
            // Show the error on screen
            return redirect()->back()->with('error', 'Import Failed: ' . $e->getMessage());
        }
    }

    /**
     * Upload handler for FilePond (Optional)
     */
    public function upload(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        return $request->file('file')->store('imports');
    }
}