<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Program;
use App\Models\Attachment;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\BillingRecord;   
use Illuminate\Support\Facades\Validator;
use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Models\Region;
use App\Models\Barangay;
use App\Models\HEI;
use Carbon\Carbon;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Jobs\ProcessMasterlistImport;
use Illuminate\Http\RedirectResponse;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TesMasterlistExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage; // ✅ Required for GDrive
class TesController extends Controller
{
    private $tesProgramId;
    private $academicYears;

    public function __construct()
    {
        // 1. Target TES Program
        $program = Program::where('program_name', 'like', '%TES%')->first();
        $this->tesProgramId = $program ? $program->id : 3; // Default fallback

        // 2. Pre-fetch Academic Years for Filters
        $this->academicYears = AcademicYear::query()
            ->whereHas('academicRecords', function ($arQuery) {
                $arQuery->whereHas('enrollment', function ($eQuery) {
                    $eQuery->where('program_id', $this->tesProgramId);
                });
            })
            ->orderBy('name', 'desc')
            ->pluck('name')->toArray();
    }


    public function getTesQuery(Request $request, string $searchKey = 'search'): Builder
    {
       $query = AcademicRecord::with([
            // Address
            'enrollment.scholar.address.city',     
            'enrollment.scholar.address.district', 
            'enrollment.scholar.address.barangay', 
            'enrollment.scholar.address.province',
            'enrollment.scholar.address', 
            'enrollment.scholar.address.region', // Load relationships for export/display if needed
            // Core
            'enrollment.program',       
            'hei.province',             
            'hei.district',           
            'hei.city',  
            'course',                   
            'major',
            'academicYear',
            'semester',
            
            // Billing & Validation
            'billingRecord.validatedBy' 
        ]);

        // Filter by TES
        $query->whereHas('enrollment', function ($q) {
            $q->where('program_id', $this->tesProgramId);
        });

        // Search Logic
        $query->when($request->input($searchKey), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(family_name, ' ', given_name) LIKE ?", ["%{$search}%"]);
            });
        });
        if ($v = $request->input('region_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        }
        if ($v = $request->input('province_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        }
        if ($v = $request->input('district_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));
        }
        if ($v = $request->input('city_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        }
        // Apply Filters
        $query->when($request->input('academic_year'), fn($q, $ay) => $q->whereHas('academicYear', fn($a) => $a->where('name', $ay)));
        $query->when($request->input('semester'), fn($q, $sem) => $q->where('semester_id', $sem));
        $query->when($request->input('batch_no'), fn($q, $batch) => $q->where('batch_no', $batch));
        $query->when($request->input('hei_id'), fn($q, $id) => $q->where('hei_id', $id));
        $query->when($request->input('course_id'), fn($q, $id) => $q->where('course_id', $id));
        
        return $query;
    }
public function index(Request $request): Response
    {
        // --- 1. FILTERS & PREP ---
        $searchHei = $request->input('search_hei');
        $batchFilter = $request->input('batch_no');
        
        // --- 2. HEI GRID DATA (Fixed Count & Filters) ---
        $heisQuery = HEI::query();

        // A. Search Filter
        if ($searchHei) {
            $heisQuery->where('hei_name', 'like', "%{$searchHei}%");
        }

        // B. Base Filter: HEI must have TES students
        $heisQuery->whereHas('enrollments', function($q) use ($batchFilter) {
            $q->where('program_id', $this->tesProgramId);
            
            // Apply Batch Filter if selected
            if ($batchFilter && $batchFilter !== 'all') {
                $q->whereHas('academicRecords', fn($sq) => $sq->where('batch_no', $batchFilter));
            }
        });

        // C. Get Count (Scoped to TES Program + Optional Batch)
        // This fixes the "0 Scholars" issue
        $heisQuery->withCount(['enrollments' => function ($q) use ($batchFilter) {
            $q->where('program_id', $this->tesProgramId);
            
            if ($batchFilter && $batchFilter !== 'all') {
                $q->whereHas('academicRecords', fn($sq) => $sq->where('batch_no', $batchFilter));
            }
        }]);

        // D. Paginate
        $paginatedHeis = $heisQuery->orderBy('hei_name')
            ->paginate(12, ['*'], 'hei_page')
            ->withQueryString();


        // --- 3. BASE QUERY FOR STATS ---
        $statsQuery = AcademicRecord::query()
            ->whereHas('enrollment', function ($q) {
                $q->where('program_id', $this->tesProgramId);
            });

        // Apply filters to stats query
        if ($request->input('academic_year')) $statsQuery->whereHas('academicYear', fn($ay) => $ay->where('name', $request->input('academic_year')));
        if ($request->input('semester')) $statsQuery->where('semester_id', $request->input('semester'));
        if ($request->input('batch_no') && $request->input('batch_no') !== 'all') $statsQuery->where('batch_no', $request->input('batch_no'));
        if ($request->input('hei_id') && $request->input('hei_id') !== 'all') $statsQuery->where('hei_id', $request->input('hei_id'));
        if ($request->input('course_id') && $request->input('course_id') !== 'all') $statsQuery->where('course_id', $request->input('course_id'));


        // --- 4. DROPDOWNS ---
        $semesters = Semester::select('id', 'name')->get();
        $heiList = HEI::select('id', 'hei_name')->orderBy('hei_name')->get();
        $courses = Course::select('id', 'course_name')->orderBy('course_name')->get();

        // Get Batches specifically for TES
        $batches = AcademicRecord::whereHas('enrollment', function($q) {
                $q->where('program_id', $this->tesProgramId);
            })
            ->whereNotNull('batch_no')
            ->distinct()
            ->orderBy('batch_no', 'asc')
            ->pluck('batch_no')
            ->map(fn($b) => (string)$b)
            ->toArray();

            $regionDistribution = (clone $statsQuery)
        ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
        ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
        ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
        ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
        ->selectRaw("COALESCE(regions.name, 'Unknown') as name, count(*) as value")
        ->groupBy('regions.name')
        ->orderByDesc('value')
        ->get();

    // Province Distribution (Top 10)
    $provinceDistribution = (clone $statsQuery)
        ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
        ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
        ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
        ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')
        ->selectRaw("COALESCE(provinces.name, 'Unknown') as name, count(*) as value")
        ->groupBy('provinces.name')
        ->orderByDesc('value')
        ->limit(10) // Limit to top 10 to keep chart clean
        ->get();

    // ==========================================
    // 2. COMPLIANCE REPORT (Validated + File Uploaded)
    // ==========================================
    
    // logic: Check Billing Status AND Attachment Existence
    $complianceDistribution = (clone $statsQuery)
        ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
        ->leftJoin('billing_records', 'academic_records.id', '=', 'billing_records.academic_record_id')
        ->selectRaw("
            CASE 
                WHEN billing_records.status = 'Validated' 
                     AND EXISTS(SELECT 1 FROM attachments WHERE reference_table = 'scholars' AND reference_id = scholar_enrollments.scholar_id) 
                     THEN 'Validated & Uploaded'
                     
                WHEN billing_records.status = 'Validated' 
                     THEN 'Validated (Missing File)'
                     
                WHEN EXISTS(SELECT 1 FROM attachments WHERE reference_table = 'scholars' AND reference_id = scholar_enrollments.scholar_id) 
                     THEN 'Pending (Uploaded)'
                     
                ELSE 'Incomplete'
            END as name,
            count(*) as value
        ")
        ->groupBy('name')
        ->get();
        // --- 5. STATISTICS ---
        $totalScholars = (clone $statsQuery)->count();
        $uniqueHeis = (clone $statsQuery)->distinct('hei_id')->count('hei_id');
        $uniqueCourses = (clone $statsQuery)->distinct('course_id')->count('course_id');
        $uniqueProvinces = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->distinct('addresses.province')
            ->count('addresses.province');

        $regions = Region::select('id', 'name')->orderBy('name')->get();
        $provinces = Province::select('id', 'name', 'region_id')->orderBy('name')->get();
        $districts = District::select('id', 'name', 'province_id')->orderBy('name')->get();
        $cities = City::select('id', 'name', 'province_id')->orderBy('name')->get();
        // --- 6. CHARTS ---
        $sexDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->selectRaw("CASE WHEN scholars.sex = 'M' THEN 'Male' WHEN scholars.sex = 'F' THEN 'Female' ELSE 'Unknown' END as name, count(*) as value")
            ->groupBy('scholars.sex')->get()->values(); 

        $yearLevelDistribution = (clone $statsQuery)
            ->selectRaw('year_level as name, count(*) as value')
            ->whereNotNull('year_level')->groupBy('year_level')->orderBy('year_level')->get()->values();

        $statusDistribution = (clone $statsQuery)
            ->selectRaw("COALESCE(payment_status, 'Unpaid') as name, count(*) as value")
            ->groupBy('payment_status')->orderByDesc('value')->get()->values();

        $topHeis = (clone $statsQuery)
            ->join('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->selectRaw('heis.hei_name as name, count(*) as value')
            ->groupBy('heis.hei_name')->orderByDesc('value')->limit(5)->get()->values();


        // --- 7. GRID DATA ---
        $databaseEnrollments = $this->getTesQuery($request, 'search_db')->paginate(10, ['*'], 'db_page')->withQueryString();
        $masterlistEnrollments = $this->getTesQuery($request, 'search_ml')->paginate(10, ['*'], 'ml_page')->withQueryString();


        // --- 8. VALIDATION DATA ---
        $validationScholars = ScholarEnrollment::with([
            'scholar', 
            'program', 
            'scholar.address.region',
            'scholar.address.province',
            'scholar.address.city',
            'scholar.address.district',
            'academicRecords' => function($q) {
                $q->latest()->take(1)->with('billingRecord');
            }
        ])
        ->where('program_id', $this->tesProgramId)
        ->when($request->input('search_validation'), function ($q, $search) {
            $q->whereHas('scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%");
            });
        })
        ->whereDoesntHave('academicRecords.billingRecord', function($q) {
            $q->where('status', 'Validated');
        })
        ->paginate(10, ['*'], 'validation_page')
        ->withQueryString();

        // Transform validation data structure
        $validationScholars->getCollection()->transform(function ($enrollment) {
            $latest = $enrollment->academicRecords->first();
            return [
                'id' => $enrollment->id,
                'award_number' => $enrollment->award_number,
                'scholar' => $enrollment->scholar,
                'program' => $enrollment->program,
                'payment_status' => $latest?->billingRecord?->status ?? 'Pending',
            ];
        });

        return Inertia::render('Tes/Index', [
            'paginatedHeis' => $paginatedHeis,
            'database_tes' => $databaseEnrollments, 
            'ml_tes' => $masterlistEnrollments,
            'validationScholars' => $validationScholars, 

            'filters' => $request->all(),
            'filters_db' => ['search_db' => $request->input('search_db')],
            'filters_ml' => ['search_ml' => $request->input('search_ml')],
            'regions' => $regions,
            'provinces' => $provinces,
            'districts' => $districts,
            'cities' => $cities,
            'academicYears' => $this->academicYears,
            'semesters' => $semesters,
            'batches' => $batches,
            'heiList' => $heiList,

            'courses' => $courses,

            'statistics' => [
                'totalScholars' => $totalScholars,
                'uniqueHeis' => $uniqueHeis,
                'uniqueProvinces' => $uniqueProvinces,
                'uniqueCourses' => $uniqueCourses, 
            ],
            'graphs' => [
                'sexDistribution' => $sexDistribution,
                'yearLevelDistribution' => $yearLevelDistribution,
                'statusDistribution' => $statusDistribution,
                'topHeis' => $topHeis,
                'regionDistribution' => $regionDistribution,
            'provinceDistribution' => $provinceDistribution,
            'complianceDistribution' => $complianceDistribution,
            ]
        ]);
    }

public function uploadHeiFile(Request $request, HEI $hei)
    {
        $request->validate([
            'file' => 'required|file|max:10240', 
            'label' => 'required|string|max:255',
        ]);

        $file = $request->file('file');
        $fileName = Str::slug($request->label) . '_' . time() . '.' . $file->getClientOriginalExtension();
        
        $folder = 'TES_HEI/' . $hei->id;
        $path = $file->storeAs($folder, $fileName, 'google');

        // Note: 'url' method availability depends on the driver. If error persists, check config.
        $url = Storage::disk('google')->url($path); 

        Attachment::create([
            'user_id' => auth()->id(),
            'reference_id' => $hei->id,
            'reference_table' => 'heis',
            'filepath' => $path,
            'filename' => $request->label,
            'mime_type' => $file->getMimeType(),
            'disk' => 'google',
        ]);

        return back()->with('success', 'Document uploaded to Google Drive successfully.');
    }
    public function upload(Request $request)
    {
        // 1. Validate
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        // 2. Store file in 'imports' folder
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('imports');
            
            // 3. RETURN ONLY THE PATH AS STRING
            // Do not return JSON or Redirect here for FilePond
            return $path; 
        }

        return response('No file uploaded', 400);
    }
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|string']);
        ProcessMasterlistImport::dispatch($request->input('file'), $this->tesProgramId, Auth::id());
        return redirect()->back()->with('success', 'TES Import started in background.');
    }

public function bulkUpdate(Request $request): RedirectResponse
    {
        $cleanedData = [];
        
        if (!$request->has('enrollments') || !is_array($request->enrollments)) {
            return redirect()->back()->withErrors(['enrollments' => 'No data provided.']);
        }

        foreach ($request->enrollments as $row) {
            $cleanedRow = $row;
            // 1. Sanitize: Force Arrays to Null/String
            foreach ($cleanedRow as $key => $val) {
                if (is_array($val)) {
                    $cleanedRow[$key] = null; 
                } elseif (is_string($val)) {
                    $cleanedRow[$key] = trim($val);
                    if ($cleanedRow[$key] === '') $cleanedRow[$key] = null;
                }
            }
            // 2. Normalize Sex
            if (isset($cleanedRow['sex'])) {
                $sex = strtolower($cleanedRow['sex']);
                if ($sex === 'male' || $sex === 'm') $cleanedRow['sex'] = 'M';
                elseif ($sex === 'female' || $sex === 'f') $cleanedRow['sex'] = 'F';
            }
            // 3. Truncate Contact
            if (!empty($cleanedRow['contact_no'])) {
                $cleanedRow['contact_no'] = substr($cleanedRow['contact_no'], 0, 20);
            }
            $cleanedData[] = $cleanedRow;
        }

        try {
            DB::transaction(function () use ($cleanedData) {
                foreach ($cleanedData as $row) {
                    $defaults = [
                        'family_name' => null, 'given_name' => null, 'middle_name' => null, 'extension_name' => null,
                        'sex' => null, 'contact_no' => null, 'email_address' => null,
                        'province' => null, 'city_municipality' => null, 'district' => null, 'zip_code' => null,
                        'specific_address' => null, 'barangay' => null, 
                        'award_no' => null, 'seq' => null, 'app_no' => null, 
                        'year_level' => null, 'batch' => null, 'validation_status' => null,
                        'date_paid' => null, 'tdp_grant' => null, 'endorsed_by' => null,
                        'billing_amount' => null, 'billing_status' => null, 
                        'date_fund_request' => null, 'date_sub_aro' => null, 'date_nta' => null, 'date_disbursed_to_hei' => null,
                        'hei_name' => null, 'hei_uii' => null, 'course_name' => null, 
                        'semester' => null, 'academic_year' => null, 'region' => null,
                        'student_id' => null, 
                        'eligibility' => null // From Grid
                    ];
                    $safeRow = array_merge($defaults, $row);
                    $parseDate = fn($d) => $d ? Carbon::parse($d)->format('Y-m-d') : null;

                    // --- A. Locations ---
                    $regionId = null;
                    if (!empty($safeRow['region'])) {
                        $reg = Region::where('name', 'LIKE', "%{$safeRow['region']}%")->first();
                        if ($reg) $regionId = $reg->id;
                    }
                    $provinceId = null;
                    if (!empty($safeRow['province'])) {
                        $prov = Province::where('name', 'LIKE', "%{$safeRow['province']}%")->first();
                        if ($prov) $provinceId = $prov->id;
                    }
                    $cityId = null;
                    if (!empty($safeRow['city_municipality'])) {
                        $city = City::where('name', 'LIKE', "%{$safeRow['city_municipality']}%")->first();
                        if ($city) $cityId = $city->id;
                    }
                    $districtId = null;
                    if (!empty($safeRow['district'])) {
                        $dist = District::where('name', 'LIKE', "%{$safeRow['district']}%")->first();
                        if ($dist) $districtId = $dist->id;
                    }
                    $barangayId = null;
                    if (!empty($safeRow['barangay'])) {
                        $bQuery = Barangay::where('barangay', 'LIKE', "%{$safeRow['barangay']}%");
                        if ($cityId) $bQuery->where('cityID', $cityId);
                        $brgy = $bQuery->first();
                        if ($brgy) $barangayId = $brgy->id;
                    }

                    // --- B. Scholar ---
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
                                'contact_no' => $safeRow['contact_no'],
                                'email_address' => $safeRow['email_address'],
                            ]);
                        }
                    } else {
                        if ($safeRow['family_name'] && $safeRow['given_name']) {
                            $scholar = Scholar::create([
                                'family_name' => $safeRow['family_name'],
                                'given_name' => $safeRow['given_name'],
                                'middle_name' => $safeRow['middle_name'],
                                'extension_name' => $safeRow['extension_name'],
                                'sex' => $safeRow['sex'],
                                'contact_no' => $safeRow['contact_no'],
                                'email_address' => $safeRow['email_address'],
                            ]);
                        } else {
                            continue;
                        }
                    }

                    if ($scholar) {
                        $scholar->address()->updateOrCreate(
                            ['scholar_id' => $scholar->id],
                            [
                                'region_id' => $regionId, 'province_id' => $provinceId, 'city_id' => $cityId, 'district_id' => $districtId, 'barangay_id' => $barangayId,
                                'region' => $safeRow['region'], 'province' => $safeRow['province'], 'town_city' => $safeRow['city_municipality'],
                                'congressional_district' => $safeRow['district'], 'barangay' => $safeRow['barangay'], 'zip_code' => $safeRow['zip_code'], 'specific_address' => $safeRow['specific_address'],
                            ]
                        );
                    }

                    // --- C. Enrollment ---
                    $ayAppliedId = null;
                    if (!empty($safeRow['academic_year'])) {
                        $ay = AcademicYear::where('name', $safeRow['academic_year'])->first();
                        if ($ay) $ayAppliedId = $ay->id;
                    }

                    $enrollment = null;
                    if (!empty($safeRow['app_no'])) {
                        $enrollment = ScholarEnrollment::where('application_number', $safeRow['app_no'])->first();
                    }
                    if (!$enrollment) {
                        $enrollment = ScholarEnrollment::where('scholar_id', $scholar->id)
                            ->where('program_id', $this->tesProgramId)
                            ->first();
                    }

                    if ($enrollment) {
                        $enrollment->update([
                            'scholar_id' => $scholar->id,
                            'award_number' => $safeRow['award_no'],
                            'application_number' => $safeRow['app_no'],
                            'academic_year_applied_id' => $ayAppliedId
                        ]);
                    } else {
                        $enrollment = ScholarEnrollment::create([
                            'scholar_id' => $scholar->id,
                            'program_id' => $this->tesProgramId,
                            'status' => 'active',
                            'award_number' => $safeRow['award_no'],
                            'application_number' => $safeRow['app_no'],
                            'academic_year_applied_id' => $ayAppliedId
                        ]);
                    }

                    // --- D. Academic Record ---
                    $heiId = null;
                    if (!empty($safeRow['hei_uii'])) {
                        $hei = \App\Models\HEI::where('hei_code', $safeRow['hei_uii'])->first();
                        if ($hei) $heiId = $hei->id;
                    }
                    if (!$heiId && !empty($safeRow['hei_name'])) {
                        $hei = \App\Models\HEI::where('hei_name', $safeRow['hei_name'])->first();
                        if ($hei) $heiId = $hei->id;
                    }

                    $courseId = null;
                    if (!empty($safeRow['course_name'])) {
                        $course = \App\Models\Course::where('course_name', $safeRow['course_name'])->first();
                        if ($course) $courseId = $course->id;
                    }

                    $semesterId = null;
                    if (!empty($safeRow['semester'])) {
                        $sem = \App\Models\Semester::where('name', $safeRow['semester'])->first();
                        if ($sem) $semesterId = $sem->id;
                    }

                    $academicRecord = null;
                    if (!empty($safeRow['academic_record_id'])) {
                        $academicRecord = AcademicRecord::find($safeRow['academic_record_id']);
                    }

                    // ✅ FIX: Default Eligibility to 0.5 if missing
                    $eligibilityValue = $safeRow['eligibility'];
                    if ($eligibilityValue === null || trim($eligibilityValue) === '') {
                        $eligibilityValue = '0.5'; 
                    }

                    // ✅ FIX: Ensure Status is Safe (If SQL fix is applied, Processed is fine. If not, this is standard)
                    $paymentStatus = $safeRow['validation_status'] ?? 'Pending';

                    $recordData = [
                        'seq' => $safeRow['seq'],
                        'year_level' => $safeRow['year_level'],
                        'batch_no' => $safeRow['batch'],
                        'payment_status' => $paymentStatus,
                        'disbursement_date' => $parseDate($safeRow['date_paid']), 
                        'grant_amount' => $safeRow['tdp_grant'],
                        'hei_id' => $heiId,
                        'course_id' => $courseId,
                        'semester_id' => $semesterId,
                        'academic_year_id' => $ayAppliedId,
                        'student_id' => $safeRow['student_id'],
                        // Map to DB Column
                        'eligibility_equivalent' => $eligibilityValue, 
                    ];

                    if ($academicRecord) {
                        $academicRecord->update($recordData);
                    } else {
                        $academicRecord = AcademicRecord::create(array_merge($recordData, [
                            'scholar_enrollment_id' => $enrollment->id,
                        ]));
                    }

                    // --- E. Billing ---
                    $academicRecord->billingRecord()->updateOrCreate(
                        ['academic_record_id' => $academicRecord->id],
                        [
                            'billing_amount' => $safeRow['billing_amount'],
                            'status' => $safeRow['billing_status'],
                            'date_fund_request' => $parseDate($safeRow['date_fund_request']),
                            'date_sub_aro' => $parseDate($safeRow['date_sub_aro']),
                            'date_nta' => $parseDate($safeRow['date_nta']),
                            'date_disbursed_hei' => $parseDate($safeRow['date_disbursed_to_hei']),
                            'date_disbursed_grantee' => $parseDate($safeRow['date_paid']),
                        ]
                    );
                }
            });
            return redirect()->back()->with('success', 'Masterlist updated successfully!');
        } catch (\Exception $e) {
            Log::error('Bulk Update Transaction Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update records: ' . $e->getMessage());
        }
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:academic_records,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::transaction(function () use ($request) {
                $ids = $request->input('ids');
                
                // Delete the Academic Record (this usually removes the row from the grid)
                // If you want to delete the SCHOLAR entirely, you need to fetch scholar IDs first.
                // Assuming for this grid we just delete the record entry:
                AcademicRecord::destroy($ids);
                
                // Also delete related billing records
                BillingRecord::whereIn('academic_record_id', $ids)->delete();

                Log::info('Bulk Destroy: Deleted Academic Records', ['ids' => $ids]);
            });

            return response()->json(['message' => 'Records deleted successfully.']);

        } catch (\Exception $e) {
            Log::error('Bulk Destroy Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete records.', 'error' => $e->getMessage()], 500);
        }
    }

    public function showScholar(Scholar $scholar): Response
    {
        $scholar->load([
            'address',
            'enrollments' => fn($q) => $q->where('program_id', $this->tesProgramId),
            'enrollments.hei',
            'enrollments.program',
            'enrollments.academicRecords.course',
            'enrollments.academicRecords.major',
            'enrollments.academicRecords.academicYear',
            'enrollments.academicRecords.semester',
            'enrollments.academicRecords.billingRecord.validatedBy',
        ]);

        return Inertia::render('Tes/Partials/ShowScholar', [
            'scholar' => $scholar
        ]);
    }

public function showHei(Request $request, HEI $hei): Response
    {
        // 1. Get Filters from Request
        $search = $request->input('search');
        $academicYear = $request->input('academic_year');
        $batch = $request->input('batch_no');
        $courseId = $request->input('course_id');

        // 2. Query Enrollments for this specific HEI and TES Program
        $query = ScholarEnrollment::with(['scholar', 'program', 'academicRecords.course'])
            ->where('hei_id', $hei->id)
            ->where('program_id', $this->tesProgramId);

        // 3. Apply Search Filter (Scholar Name or Award No)
        if ($search) {
            $query->whereHas('scholar', function ($q) use ($search) {
                $q->where(DB::raw("CONCAT(family_name, ', ', given_name)"), 'like', "%{$search}%")
                  ->orWhere('award_number', 'like', "%{$search}%");
            });
        }

        // 4. Apply Dropdown Filters
        if ($academicYear && $academicYear !== 'all') {
            $query->whereHas('academicRecords', function ($q) use ($academicYear) {
                $q->whereHas('academicYear', fn($sq) => $sq->where('name', $academicYear));
            });
        }

        if ($batch && $batch !== 'all') {
             $query->whereHas('academicRecords', fn($q) => $q->where('batch_no', $batch));
        }

        if ($courseId && $courseId !== 'all') {
             $query->whereHas('academicRecords', fn($q) => $q->where('course_id', $courseId));
        }

        // 5. Paginate Results
        $enrollments = $query->paginate(10)->withQueryString();

        // 6. Get Filter Options (Specific to this HEI)
        $courses = Course::whereHas('academicRecords', function ($q) use ($hei) {
            $q->where('hei_id', $hei->id);
        })->select('id', 'course_name')->distinct()->orderBy('course_name')->get();
        $documents = Attachment::where('reference_id', $hei->id)
            ->where('reference_table', 'heis')
            ->latest()
            ->get();
        // ✅ FIX: Ensure distinct, ordered, strings for Batches in this HEI
        $batches = AcademicRecord::where('hei_id', $hei->id)
            ->whereNotNull('batch_no')
            ->distinct()
            ->orderBy('batch_no', 'asc')
            ->pluck('batch_no')
            ->map(fn($b) => (string)$b)
            ->toArray();

            $regions = Region::select('id', 'name')->orderBy('name')->get();
    $provinces = Province::select('id', 'name', 'region_id')->orderBy('name')->get();
    $districts = District::select('id', 'name', 'province_id')->orderBy('name')->get();
    $cities = City::select('id', 'name', 'province_id')->orderBy('name')->get();

        return Inertia::render('Tes/Partials/ShowHei', [
            'hei' => $hei,
            'enrollments' => $enrollments,
            'filters' => $request->only(['search', 'academic_year', 'batch_no', 'course_id']),
            'academicYears' => $this->academicYears,
            'batches' => $batches,
            'documents' => $documents,
            'courses' => $courses,
            'regions' => $regions,
        'provinces' => $provinces,
        'districts' => $districts,
        'cities' => $cities,
        ]);
    }
    private function getTopHeis(Request $request) {
        return $this->getFilteredStatsQuery($request)
            ->join('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->selectRaw('heis.hei_name as name, count(*) as value')
            ->groupBy('heis.hei_name')->orderByDesc('value')->limit(10)->get();
    }

    private function getYearLevelStats(Request $request) {
        return $this->getFilteredStatsQuery($request)
            ->selectRaw("COALESCE(year_level, 'Unknown') as name, count(*) as value")
            ->whereNotNull('year_level')->groupBy('year_level')->orderBy('year_level')->get();
    }

    private function getStatusStats(Request $request) {
        return $this->getFilteredStatsQuery($request)
            ->selectRaw("COALESCE(payment_status, 'Unpaid') as name, count(*) as value")
            ->groupBy('payment_status')->orderByDesc('value')->get();
    }


    private function getFilteredStatsQuery(Request $request): Builder
    {
        $query = AcademicRecord::query()
            ->whereHas('enrollment', function ($q) {
                $q->where('program_id', $this->tesProgramId);
            });

        // Apply shared filters
        if ($request->input('academic_year')) $query->whereHas('academicYear', fn($ay) => $ay->where('name', $request->input('academic_year')));
        if ($request->input('semester')) $query->where('semester_id', $request->input('semester'));
        if ($request->input('batch_no') && $request->input('batch_no') !== 'all') $query->where('batch_no', $request->input('batch_no'));
        if ($request->input('hei_id') && $request->input('hei_id') !== 'all') $query->where('hei_id', $request->input('hei_id'));
        if ($request->input('course_id') && $request->input('course_id') !== 'all') $query->where('course_id', $request->input('course_id'));
if ($v = $request->input('region_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        }
        if ($v = $request->input('province_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        }
        if ($v = $request->input('district_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));
        }
        if ($v = $request->input('city_id')) {
            if($v !== 'all') $query->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        }
        return $query;
    }

    // --- HELPER: Province/Region Stats ---
    private function getProvinceStats(Request $request)
    {
        return $this->getFilteredStatsQuery($request)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')
            ->selectRaw("COALESCE(provinces.name, 'Unknown') as name, count(*) as value")
            ->groupBy('provinces.name')
            ->orderByDesc('value')
            ->limit(10)
            ->get();
    }
    private function fetchChartImageAsBase64($url) 
    {
        try {
            // Suppress errors and fetch with a reasonable timeout
            $context = stream_context_create(['http' => ['timeout' => 5]]); 
            $image = @file_get_contents($url, false, $context);
            if ($image) {
                return 'data:image/png;base64,' . base64_encode($image);
            }
        } catch (\Exception $e) {
            return null; // Return null if fetching fails, preventing crash
        }
        return null;
    }
public function exportStatisticsExcel(Request $request)
    {
        // 1. Fetch Basic Stats
        $provinceStats = $this->getProvinceStats($request);
        $sexStats = $this->getSexStats($request);
        $complianceStats = $this->getComplianceStats($request);
        $summary = $this->getSummaryStats($request);

        // 2. Fetch Extended Stats (Top HEIs, Years, Status)
        $topHeis = $this->getTopHeis($request);
        $yearStats = $this->getYearLevelStats($request);
        $statusStats = $this->getStatusStats($request);

        // 3. Pass ALL variables to the Anonymous Class constructor
        return Excel::download(new class($provinceStats, $sexStats, $complianceStats, $summary, $topHeis, $yearStats, $statusStats) implements FromView, ShouldAutoSize, WithStyles {
            private $prov, $sex, $comp, $summary, $heis, $years, $status;
            
            // Constructor now accepts 7 arguments
            public function __construct($p, $s, $c, $sum, $h, $y, $st) { 
                $this->prov = $p; 
                $this->sex = $s; 
                $this->comp = $c; 
                $this->summary = $sum;
                $this->heis = $h; 
                $this->years = $y; 
                $this->status = $st;
            }
            
            public function view(): \Illuminate\Contracts\View\View {
                return view('exports.tes-statistics-excel', [
                    'provinceStats' => $this->prov,
                    'sexStats' => $this->sex,
                    'complianceStats' => $this->comp,
                    'summary' => $this->summary,
                    'topHeis' => $this->heis,      // New Data
                    'yearStats' => $this->years,   // New Data
                    'statusStats' => $this->status // New Data
                ]);
            }

            public function styles(Worksheet $sheet) {
                $sheet->getStyle('A1:A6')->getFont()->setBold(true);
                $sheet->getStyle('A8:B12')->getFont()->setBold(true);
            }
        }, 'TES_Statistics_' . now()->format('Y-m-d') . '.xlsx');
    }
    private function getRegionStats(Request $request)
    {
        return $this->getFilteredStatsQuery($request)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
            ->selectRaw("COALESCE(regions.name, 'Unknown') as name, count(*) as value")
            ->groupBy('regions.name')
            ->orderByDesc('value')
            ->get();
    }

    // --- HELPER: Sex Stats ---
    private function getSexStats(Request $request)
    {
        return $this->getFilteredStatsQuery($request)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->selectRaw("CASE WHEN scholars.sex = 'M' THEN 'Male' WHEN scholars.sex = 'F' THEN 'Female' ELSE 'Unknown' END as name, count(*) as value")
            ->groupBy('scholars.sex')
            ->get()
            ->values();
    }

    // --- HELPER: Compliance Stats ---
private function getComplianceStats(Request $request) {
        return $this->getFilteredStatsQuery($request)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->leftJoin('billing_records', 'academic_records.id', '=', 'billing_records.academic_record_id')
            ->selectRaw("
                CASE 
                    WHEN billing_records.status = 'Validated' 
                         AND EXISTS(SELECT 1 FROM attachments WHERE reference_table = 'scholars' AND reference_id = scholar_enrollments.scholar_id) 
                         THEN 'Validated and Uploaded'  
                    WHEN billing_records.status = 'Validated' 
                         THEN 'Validated (Missing File)'
                    WHEN EXISTS(SELECT 1 FROM attachments WHERE reference_table = 'scholars' AND reference_id = scholar_enrollments.scholar_id) 
                         THEN 'Pending (Uploaded)'
                    ELSE 'Incomplete'
                END as name,
                count(*) as value
            ") // ✅ NOTE: Replaced '&' with 'and' to prevent XML parse errors
            ->groupBy('name')->get();
    }
    // Export Functions
public function exportPdf(Request $request)
    {
        // 1. ✅ INCREASE EXECUTION TIME & MEMORY FOR LARGE DATASETS
        set_time_limit(600); // 10 Minutes
        ini_set('memory_limit', '-1');
        ini_set('pcre.backtrack_limit', '5000000'); // Fixes regex errors on large HTML

        $query = $this->getTesQuery($request, 'search_db');
        $records = $query->get();

        if ($records->isEmpty()) return back()->with('error', 'No records found to export.');

        // 2. Load View
        $pdf = Pdf::loadView('exports.tes-masterlist-pdf', [
            'records' => $records,
            'generated_at' => now()->format('F d, Y h:i A'),
            'filters' => $request->all()
        ])->setPaper('a4', 'landscape');

        // 3. Download
        return $pdf->download('TES_Masterlist_' . now()->format('Y-m-d_His') . '.pdf');
    }

public function exportExcel(Request $request)
    {
        // 1. Force Unlimited Time & Memory for this specific request
        set_time_limit(0); 
        ini_set('memory_limit', '-1'); 

        $query = $this->getTesQuery($request, 'search_db');
        
        return Excel::download(new TesMasterlistExport($query), 'TES_Report_' . now()->format('Y-m-d_His') . '.xlsx');
    }

    private function generateQuickChartUrl($type, $labels, $data, $title)
    {
        $config = [
            'type' => $type,
            'data' => [
                'labels' => $labels,
                'datasets' => [[
                    'label' => $title,
                    'data' => $data,
                    'backgroundColor' => $type == 'pie' 
                        ? ['#3b82f6', '#ef4444', '#eab308', '#22c55e', '#8b5cf6', '#f97316'] 
                        : '#3b82f6'
                ]]
            ],
            'options' => [
                'plugins' => [
                    'legend' => ['position' => 'bottom'],
                    'datalabels' => [
                        'display' => true,
                        'color' => '#000',
                        'font' => ['weight' => 'bold']
                    ]
                ],
                'title' => [
                    'display' => true,
                    'text' => $title
                ]
            ]
        ];
        // Generate a URL for the chart image
        return "https://quickchart.io/chart?c=" . urlencode(json_encode($config));
    }

    private function saveChartImageToTemp($url, $prefix) 
    {
        try {
            // 1. Create a safe temporary directory
            $tempDir = storage_path('app/public/temp_charts');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // 2. Fetch the image
            $context = stream_context_create(['http' => ['timeout' => 5]]); 
            $imageContent = @file_get_contents($url, false, $context);

            if ($imageContent) {
                // 3. Save to a file with a unique name
                $filename = $prefix . '_' . uniqid() . '.png';
                $fullPath = $tempDir . '/' . $filename;
                file_put_contents($fullPath, $imageContent);
                
                // 4. Return the ABSOLUTE path for the View to use
                return $fullPath; 
            }
        } catch (\Exception $e) {
            Log::error("Chart fetch failed: " . $e->getMessage());
            return null;
        }
        return null;
    }
    private function getSummaryStats(Request $request) {
        $statsQuery = $this->getFilteredStatsQuery($request);
        return [
            'total_scholars' => (clone $statsQuery)->count(),
            'total_funds' => (clone $statsQuery)->sum('grant_amount'),
            'total_heis' => (clone $statsQuery)->distinct('hei_id')->count('hei_id'),
            'active_scholars' => (clone $statsQuery)->where('payment_status', 'Paid')->count()
        ];
    }
public function exportStatisticsPdf(Request $request)
    {
        set_time_limit(300); // 5 Minutes
        
        $provinceStats = $this->getProvinceStats($request);
        $sexStats = $this->getSexStats($request);
        $complianceStats = $this->getComplianceStats($request);
        $summary = $this->getSummaryStats($request);
        
        // Fetch Extended Stats for PDF
        $topHeis = $this->getTopHeis($request);
        $yearStats = $this->getYearLevelStats($request);
        $statusStats = $this->getStatusStats($request);

        // Enhanced Interpretation Logic
        $interpretation = "Based on the generated data, there are " . number_format($summary['total_scholars']) . " total scholars. ";
        $interpretation .= "Total funding is PHP " . number_format($summary['total_funds'], 2) . ". ";
        if ($provinceStats->isNotEmpty()) {
            $interpretation .= "The highest concentration of scholars is in " . $provinceStats->first()->name . ". ";
        }
        if ($topHeis->isNotEmpty()) {
            $interpretation .= "The institution with the most beneficiaries is " . $topHeis->first()->name . " (" . $topHeis->first()->value . "). ";
        }
        if ($statusStats->isNotEmpty()) {
            $interpretation .= "Most scholars currently have a payment status of '" . $statusStats->first()->name . "'.";
        }

        // Pass ALL data to the view
        $stats = [
            'scholarsPerRegion' => $provinceStats,
            'scholarsBySex' => $sexStats,
            'compliance' => $complianceStats, 
            'topHeis' => $topHeis,         // New
            'yearStats' => $yearStats,     // New
            'statusStats' => $statusStats, // New
            'summary' => $summary,
            'interpretation' => $interpretation,
            'filters' => $request->all(), 
        ];

        $pdf = Pdf::loadView('exports.tes-statistics-report', [
            'stats' => $stats,
            'generated_at' => now()->format('F d, Y'),
        ]);

        return $pdf->download('TES_Statistics_Report.pdf');
    }
}