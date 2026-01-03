<?php

namespace App\Http\Controllers;

// NEW: Import all the new models
use App\Models\AcademicRecord;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Program;
use App\Models\AcademicYear; // NEW
use App\Models\Semester;
use App\Models\BillingRecord;   
// Keep these
use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Models\Region;
use App\Models\Barangay;
use App\Models\HEI;
use App\Models\Course;
use App\Models\Attachment;
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
use App\Jobs\ProcessMasterlistImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;


class TdpController extends Controller
{
    private $tdpProgramId;
    private $academicYears; // For global filter

    

   // app/Http/Controllers/TdpController.php

    public function __construct()
    {
        $tdpProgram = Program::where('program_name', 'TDP')->first();
        if (!$tdpProgram) {
            throw new \Exception("Program 'TDP' not found in the 'programs' table. Please run 'php artisan db:seed'.");
        }
        
        // Hardcode the ID to 4 to match your SQL data
        $this->tdpProgramId = 4; 
        
        // --- THIS IS THE FIX (From your file, this is correct) ---
        // Query the 'academic_years' table
        $this->academicYears = \App\Models\AcademicYear::query()
            ->whereHas('academicRecords', function ($arQuery) {
                $arQuery->whereHas('enrollment', function ($eQuery) {
                    $eQuery->where('program_id', $this->tdpProgramId);
                });
            })
            ->orderBy('name', 'desc')
            ->pluck('name')->toArray();
        // --- END OF FIX ---
    }
 public function getTdpQuery(Request $request, string $searchKey = 'search'): Builder
    {
       $query = AcademicRecord::with([
      'enrollment.scholar.address.region',   
            'enrollment.scholar.address.province', 
            'enrollment.scholar.address.city',     
            'enrollment.scholar.address.district', 
            'enrollment.scholar.address.barangay', 
            'enrollment.scholar.address',
            
            'enrollment.program',       
            'hei.province',             
            'hei.district',           
            'hei.city',  
            'course',                   
            'major',
            'academicYear',
            'semester',
            'billingRecord.validatedBy' 
        ]);

        if (!$request->input('program_id')) {
             $query->whereHas('enrollment', function ($q) {
                $q->where('program_id', $this->tdpProgramId);
            });
        }

        $query->when($request->input($searchKey), function ($q, $search) {
            return $q->whereHas('enrollment.scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(family_name, ' ', given_name) LIKE ?", ["%{$search}%"]);
            });
        });

        $query->when($request->input('academic_year'), fn($q, $ay) => $q->whereHas('academicYear', fn($a) => $a->where('name', $ay)));
        $query->when($request->input('semester'), fn($q, $sem) => $q->where('semester_id', $sem));
        $query->when($request->input('batch_no'), fn($q, $batch) => $q->where('batch_no', $batch));
        $query->when($request->input('hei_id'), fn($q, $id) => $q->where('hei_id', $id));
        $query->when($request->input('course_id'), fn($q, $id) => $q->where('course_id', $id));
        
        return $query;
    }
public function index(Request $request): Response
    {
        // 1. BASE QUERY (For Stats & Charts)
        $statsQuery = AcademicRecord::query()
            ->whereHas('enrollment.program', function ($q) {
                $q->where('program_name', 'like', '%TDP%');
            });

        // --- APPLY GLOBAL FILTERS TO STATS ---
        // Academic & Record Filters
        if ($v = $request->input('academic_year')) $statsQuery->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $statsQuery->where('semester_id', $v);
        if ($v = $request->input('batch_no')) $statsQuery->where('batch_no', $v);
        if ($v = $request->input('hei_id')) $statsQuery->where('hei_id', $v);
        if ($v = $request->input('course_id')) $statsQuery->where('course_id', $v);

        // Location Filters (Crucial for Report Generator)
        if ($v = $request->input('region_id')) {
            $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        }
        if ($v = $request->input('province_id')) {
            $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        }
        if ($v = $request->input('city_id')) {
            $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        }
        if ($v = $request->input('district_id')) {
            $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));
        }

        // 2. CALCULATE STATISTICS & CHARTS
        $totalScholars = (clone $statsQuery)->count();
        
        // Count Uniques
        $uniqueHeis = (clone $statsQuery)->distinct('hei_id')->count('hei_id');
        $uniqueCourses = (clone $statsQuery)->distinct('course_id')->count('course_id');
        $uniqueProvinces = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->distinct('addresses.province') // Use string column if province_id is nullable
            ->count('addresses.province');

        // Chart: Sex
        $sexDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->selectRaw("
                CASE 
                    WHEN scholars.sex IN ('M', 'Male') THEN 'Male' 
                    WHEN scholars.sex IN ('F', 'Female') THEN 'Female' 
                    ELSE 'Unknown' 
                END as name, 
                count(*) as value
            ")
            ->groupBy('name') // Group by the alias
            ->get();

        // Chart: Year Level
        $yearLevelDistribution = (clone $statsQuery)
            ->selectRaw("COALESCE(year_level, 'Unknown') as name, count(*) as value")
            ->groupBy('year_level')
            ->orderBy('year_level')
            ->get();

        // Chart: Status
        $statusDistribution = (clone $statsQuery)
            ->selectRaw("COALESCE(payment_status, 'Pending') as name, count(*) as value")
            ->groupBy('payment_status')
            ->orderByDesc('value')
            ->get();

        // Chart: Top HEIs
        $topHeis = (clone $statsQuery)
            ->join('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->selectRaw('heis.hei_name as name, count(*) as value')
            ->groupBy('heis.hei_name')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        // Chart: Regions
     $regionDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
            // ✅ FIX: Prioritize Region Name, then Address Text, then Unknown
            ->selectRaw("COALESCE(regions.name, addresses.region, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(regions.name, addresses.region, 'Unknown')"))
            ->orderByDesc('value')
            ->get();

        // Chart: Provinces
     $provinceDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')
            // ✅ FIX: Prioritize Province Name, then Address Text
            ->selectRaw("COALESCE(provinces.name, addresses.province, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(provinces.name, addresses.province, 'Unknown')"))
            ->orderByDesc('value')
            ->limit(10)
            ->get();

            $courseDistribution = (clone $statsQuery)
            ->join('courses', 'academic_records.course_id', '=', 'courses.id')
            ->selectRaw("COALESCE(courses.course_name, 'Unknown') as name, count(*) as value")
            ->groupBy('courses.course_name')
            ->orderByDesc('value')
            ->limit(10) // Top 10 Courses
            ->get();

        // Data Interpretation
        $interpretation = "Based on current data, there are " . number_format($totalScholars) . " TDP grantees. ";
        if ($topHeis->isNotEmpty()) {
            $interpretation .= "The top institution is " . $topHeis->first()->name . " with " . $topHeis->first()->value . " grantees. ";
        }
        if ($provinceDistribution->isNotEmpty()) {
            $interpretation .= "Geographically, " . $provinceDistribution->first()->name . " has the highest number of beneficiaries. ";
        }
        if ($statusDistribution->isNotEmpty()) {
            $interpretation .= "Most records are marked as '" . $statusDistribution->first()->name . "'.";
        }

        // 3. DROPDOWNS & FILTER DATA
        $semesters = Semester::select('id', 'name')->get();
        $batches = AcademicRecord::whereHas('enrollment.program', fn($q) => $q->where('program_name', 'like', '%TDP%'))
            ->whereNotNull('batch_no')->distinct()->orderBy('batch_no')->pluck('batch_no')->toArray();
        $heiList = HEI::select('id', 'hei_name')->orderBy('hei_name')->get();
        $courses = Course::select('id', 'course_name')->orderBy('course_name')->get()->toArray();
        
        $regions = Region::select('id', 'name')->orderBy('name')->get();
        $provinces = Province::select('id', 'name', 'region_id')->orderBy('name')->get();
        $districts = District::select('id', 'name', 'province_id')->orderBy('name')->get();
        $cities = City::select('id', 'name', 'province_id')->orderBy('name')->get();

        // 4. FETCH GRID DATA
        $databaseEnrollments = $this->getTdpQuery($request, 'search_db')->paginate(10, ['*'], 'db_page')->withQueryString();
        $masterlistEnrollments = $this->getTdpQuery($request, 'search_ml')->paginate(10, ['*'], 'ml_page')->withQueryString();
        
        // HEI Grid Logic
        $searchHei = $request->input('search_hei');
        $batchFilter = $request->input('batch_no');
        $heiQuery = HEI::query();
        if ($searchHei) $heiQuery->where('hei_name', 'like', "%{$searchHei}%");
        $heiQuery->whereHas('academicRecords', function ($q) use ($request, $batchFilter) { 
            $q->whereHas('enrollment.program', fn($eq) => $eq->where('program_name', 'like', '%TDP%'));
            if ($batchFilter && $batchFilter !== 'all') $q->where('batch_no', $batchFilter);
        });
        $heiQuery->withCount(['enrollments' => function ($q) use ($batchFilter) {
            $q->where('program_id', $this->tdpProgramId);
            if ($batchFilter && $batchFilter !== 'all') {
                $q->whereHas('academicRecords', fn($sq) => $sq->where('batch_no', $batchFilter));
            }
        }]);
        $paginatedHeis = $heiQuery->orderBy('hei_name')->paginate(12, ['*'], 'hei_page')->withQueryString();

        // Validation Data
        $validationScholars = ScholarEnrollment::with([
            'scholar.address', 'program', 
            'academicRecords' => fn($q) => $q->latest()->take(1)->with('billingRecord')
        ])
        ->whereHas('program', fn($q) => $q->where('program_name', 'like', '%TDP%'))
        ->when($request->input('search_validation'), fn($q, $search) => 
            $q->whereHas('scholar', fn($sub) => $sub->where('family_name', 'like', "%{$search}%")->orWhere('given_name', 'like', "%{$search}%"))
        )
        ->whereDoesntHave('academicRecords.billingRecord', fn($q) => $q->where('status', 'Validated'))
        ->paginate(10, ['*'], 'validation_page')->withQueryString();

        // 5. RETURN RESPONSE
        return Inertia::render('Tdp/Index', [
            'paginatedHeis' => $paginatedHeis,
            'databaseEnrollments' => $databaseEnrollments,
            'enrollments' => $masterlistEnrollments,
            'validationScholars' => $validationScholars,
            'filters' => $request->all(),
            
            // Dropdowns
            'academicYears' => AcademicYear::pluck('name')->toArray(), 
            'semesters' => $semesters,
            'batches' => $batches,
            'heiList' => $heiList,
            'courses' => $courses,
            'regions' => $regions,
            'provinces' => $provinces,
            'districts' => $districts,
            'cities' => $cities,
            
            // Report Data
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
                'courseDistribution' => $courseDistribution, // ✅ Added here
                'regionDistribution' => $regionDistribution, // ✅ Added
                'provinceDistribution' => $provinceDistribution, // ✅ Added
            ],
            'interpretation' => $interpretation, // ✅ Added
        ]);
    }
public function bulkUpdate(Request $request): RedirectResponse
    {
        $cleanedData = [];
        
        if (!$request->has('enrollments') || !is_array($request->enrollments)) {
            return redirect()->back()->withErrors(['enrollments' => 'No data provided for update.']);
        }

        foreach ($request->enrollments as $row) {
            $cleanedRow = $row;

            if (isset($cleanedRow['sex'])) {
                $sex = strtolower(trim($cleanedRow['sex']));
                if ($sex === 'male' || $sex === 'm') $cleanedRow['sex'] = 'M';
                elseif ($sex === 'female' || $sex === 'f') $cleanedRow['sex'] = 'F';
            }

            foreach ($cleanedRow as $key => $value) {
                // ✅ FIX: Prevent Array-to-String Conversion
                if (is_array($value)) {
                    $value = null; // Flatten or nullify arrays
                } elseif (is_string($value)) {
                    $value = trim($value);
                    if ($value === '') $value = null;
                }
                $cleanedRow[$key] = $value;
            }

            if (!empty($cleanedRow['contact_no'])) {
                $cleanedRow['contact_no'] = substr($cleanedRow['contact_no'], 0, 20);
            }

            $cleanedData[] = $cleanedRow;
        }

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
                    
                    $defaults = [
                        'family_name' => null, 'given_name' => null, 'middle_name' => null, 'extension_name' => null,
                        'sex' => null, 'contact_no' => null, 'email_address' => null,
                        'province' => null, 'city_municipality' => null, 'district' => null, 'zip_code' => null,
                        'specific_address' => null, 'barangay' => null, 'award_no' => null, 'seq' => null,
                        'app_no' => null, 'year_level' => null, 'batch' => null, 'validation_status' => null,
                        'date_paid' => null, 'tdp_grant' => null, 
                        'billing_amount' => null, 'billing_status' => null, 'date_fund_request' => null,
                        'date_sub_aro' => null, 'date_nta' => null, 'date_disbursed_to_hei' => null,
                        'hei_name' => null, 'hei_uii' => null, 'course_name' => null, 
                        'semester' => null, 'academic_year' => null, 'region' => null,
                        
                        // ✅ ADDED DEFAULTS FOR NEW FIELDS
                        'student_id' => null, 
                        'eligibility_equivalent' => null, 
                    ];
                    $safeRow = array_merge($defaults, $row);
                    
                    $parseDate = fn($d) => $d ? Carbon::parse($d)->format('Y-m-d') : null;

                    // --- IDS LOOKUP ---
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

                    // --- UPDATE SCHOLAR ---
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
                                'region_id' => $regionId,
                                'province_id' => $provinceId,
                                'city_id' => $cityId,
                                'district_id' => $districtId,
                                'barangay_id' => $barangayId,
                                'region' => $safeRow['region'],
                                'province' => $safeRow['province'],
                                'town_city' => $safeRow['city_municipality'],
                                'congressional_district' => $safeRow['district'],
                                'barangay' => $safeRow['barangay'],
                                'zip_code' => $safeRow['zip_code'],
                                'specific_address' => $safeRow['specific_address'],
                            ]
                        );
                    }

                    // --- ENROLLMENT ---
                    $ayAppliedId = null;
                    if (!empty($safeRow['academic_year'])) {
                        $ay = AcademicYear::where('name', $safeRow['academic_year'])->first();
                        if ($ay) $ayAppliedId = $ay->id;
                    }

                    $enrollment = ScholarEnrollment::firstOrCreate(
                        ['scholar_id' => $scholar->id, 'program_id' => $this->tdpProgramId],
                        [
                            'status' => 'active', 
                            'award_number' => $safeRow['award_no'], 
                            'application_number' => $safeRow['app_no'],
                            'academic_year_applied_id' => $ayAppliedId
                        ]
                    );
                    
                    if (!$enrollment->wasRecentlyCreated) {
                        $enrollment->update([
                            'award_number' => $safeRow['award_no'],
                            'application_number' => $safeRow['app_no'],
                            'academic_year_applied_id' => $ayAppliedId
                        ]);
                    }

                    // --- ACADEMIC RECORD ---
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

                    $academicYearId = $ayAppliedId;

                    $academicRecord = null;
                    if (!empty($safeRow['academic_record_id'])) {
                        $academicRecord = AcademicRecord::find($safeRow['academic_record_id']);
                    }

                    $recordData = [
                        'seq' => $safeRow['seq'],
                        'year_level' => $safeRow['year_level'],
                        'batch_no' => $safeRow['batch'],
                        'payment_status' => $safeRow['validation_status'],
                        'disbursement_date' => $parseDate($safeRow['date_paid']), 
                        'grant_amount' => $safeRow['tdp_grant'],
                        'hei_id' => $heiId,
                        'course_id' => $courseId,
                        'semester_id' => $semesterId,
                        'academic_year_id' => $academicYearId,
                        
                        // ✅ SAVING NEW FIELDS
                        'student_id' => $safeRow['student_id'],
                        'eligibility_equivalent' => $safeRow['eligibility_equivalent'],
                    ];

                    if ($academicRecord) {
                        $academicRecord->update($recordData);
                    } else {
                        $academicRecord = AcademicRecord::create(array_merge($recordData, [
                            'scholar_enrollment_id' => $enrollment->id,
                        ]));
                    }

                    // --- BILLING RECORD ---
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
    /**
     * Bulk destroy TDP records.
     * Deletes Academic Records based on IDs passed.
     */
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
            'enrollments' => function ($q) {
                $q->where('program_id', $this->tdpProgramId);
            },
            'enrollments.hei',
            'enrollments.program',
            'enrollments.academicRecords' => function ($aq) {
                $aq->orderBy('semester_id', 'desc');
            },
            'enrollments.academicRecords.course',
            'enrollments.academicRecords.major',
            'enrollments.academicRecords.academicYear',
            'enrollments.academicRecords.semester',
            
            // --- ADD THESE TWO LINES ---
            'enrollments.academicRecords.billingRecord', // Load the billing record
            'enrollments.academicRecords.billingRecord.validatedBy', // Load the user who validated it
            // --- END OF ADDED LINES ---
        ]);

        return Inertia::render('Tdp/Partials/ShowScholar', [
            'scholar' => $scholar
        ]);
    }
    public function showHei(Request $request, HEI $hei): Response
    {
        $hei->load(['province', 'district']);

        $baseAcademicQuery = AcademicRecord::query()
            ->where('hei_id', $hei->id)
            ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->tdpProgramId));
            
        $baseAcademicQuery->when($request->input('academic_year'), function ($q, $academic_year_name) {
            return $q->whereHas('academicYear', fn($ay) => $ay->where('name', $academic_year_name));
        });

        // --- Get Filter Data ---
        $batches = (clone $baseAcademicQuery)
            ->whereNotNull('batch_no')
            ->where('batch_no', '!=', '')
            ->distinct()->orderBy('batch_no', 'asc')
            ->pluck('batch_no')->toArray();
            
        $courseIds = (clone $baseAcademicQuery)
            ->whereNotNull('course_id')
            ->distinct()->pluck('course_id');
        
        $courses = Course::whereIn('id', $courseIds)->select('id', 'course_name')->get();
        $regions = Region::select('id', 'name')->orderBy('name')->get();
        $provinces = Province::select('id', 'name', 'region_id')->orderBy('name')->get();
        $districts = District::select('id', 'name', 'province_id')->orderBy('name')->get();
        $cities = City::select('id', 'name', 'province_id')->orderBy('name')->get();
        $semesterIds = (clone $baseAcademicQuery)->whereNotNull('semester_id')->distinct()->pluck('semester_id');
        $semesters = Semester::whereIn('id', $semesterIds)->get(['id', 'name']);
        $documents = Attachment::where('reference_id', $hei->id)
            ->where('reference_table', 'heis')
            ->latest()
            ->get();

        // --- Get Main Data ---
        $query = ScholarEnrollment::with([
            'scholar.address.region',
            'scholar.address.province',
            'scholar.address.city',
            'scholar.address.district',
            'scholar.address', 
            'program', 
            'academicRecords.course', 
            'academicRecords.major',
            'academicRecords.academicYear', 
            'academicRecords.semester'
        ])
            ->where('program_id', $this->tdpProgramId)
            ->where('hei_id', $hei->id);
            
        // Search Filter
        $query->when($request->input('search'), function ($q, $search) {
            return $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%");
            });
        });
        
        // Dropdown Filters
        $query->when($request->input('academic_year'), function ($q, $academic_year_name) {
            return $q->whereHas('academicRecords', fn($aq) => $aq->whereHas('academicYear', fn($ay) => $ay->where('name', $academic_year_name)));
        });
        $query->when($request->input('batch_no'), function ($q, $batch_no) {
            return $q->whereHas('academicRecords', fn($aq) => $aq->where('batch_no', $batch_no));
        });
        $query->when($request->input('course_id'), function ($q, $course_id) {
            return $q->whereHas('academicRecords', fn($aq) => $aq->where('course_id', $course_id));
        });
        $query->when($request->input('semester_id'), function ($q, $semester_id) {
            return $q->whereHas('academicRecords', fn($aq) => $aq->where('semester_id', $semester_id));
        });

        // Location Filters
        if ($v = $request->input('region_id')) { if($v !== 'all') $query->whereHas('scholar.address', fn($q) => $q->where('region_id', $v)); }
        if ($v = $request->input('province_id')) { if($v !== 'all') $query->whereHas('scholar.address', fn($q) => $q->where('province_id', $v)); }
        if ($v = $request->input('city_id')) { if($v !== 'all') $query->whereHas('scholar.address', fn($q) => $q->where('city_id', $v)); }
        if ($v = $request->input('district_id')) { if($v !== 'all') $query->whereHas('scholar.address', fn($q) => $q->where('district_id', $v)); }

        $enrollments = $query->paginate(10)->withQueryString();

        return Inertia::render('Tdp/Partials/ShowHei', [
            'hei' => $hei,
            'enrollments' => $enrollments,
            'filters' => $request->all('search', 'academic_year', 'batch_no', 'course_id', 'semester_id', 'region_id', 'province_id', 'city_id', 'district_id'),
            'academicYears' => $this->academicYears, 
            'batches' => $batches,
            'courses' => $courses,
            'semesters' => $semesters,
            'documents' => $documents,
            'regions' => $regions,
            'provinces' => $provinces,
            'districts' => $districts,
            'cities' => $cities,
        ]);
    }
    /**
     * Generate a PDF masterlist.
     */
    public function generateStatisticsPdf(Request $request)
    {
        set_time_limit(120); // 2 minutes max (should take seconds)
        ini_set('memory_limit', '256M'); // Low memory usage

        // 1. BASE QUERY (Reuses your existing filters from the dashboard)
        $statsQuery = AcademicRecord::query()
            ->whereHas('enrollment.program', fn($q) => $q->where('program_name', 'like', '%TDP%'));

        // --- APPLY FILTERS ---
        if ($v = $request->input('academic_year')) $statsQuery->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $statsQuery->where('semester_id', $v);
        if ($v = $request->input('batch_no')) $statsQuery->where('batch_no', $v);
        if ($v = $request->input('hei_id')) $statsQuery->where('hei_id', $v);
        if ($v = $request->input('course_id')) $statsQuery->where('course_id', $v);

        // Location Filters
        if ($v = $request->input('region_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        if ($v = $request->input('province_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        if ($v = $request->input('city_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        if ($v = $request->input('district_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));

        // 2. GATHER STATISTICS (Aggregates Only)
        $totalScholars = (clone $statsQuery)->count();
        
        // Sex Distribution
        $sexDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->selectRaw("CASE WHEN scholars.sex IN ('M', 'Male') THEN 'Male' WHEN scholars.sex IN ('F', 'Female') THEN 'Female' ELSE 'Unknown' END as name, count(*) as value")
            ->groupBy('name')->get();

        // HEI Distribution (Top 20)
        $heiDistribution = (clone $statsQuery)
            ->join('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->selectRaw('heis.hei_name as name, count(*) as value')
            ->groupBy('heis.hei_name')->orderByDesc('value')->limit(20)->get();

        // Course Distribution (Top 20)
        $courseDistribution = (clone $statsQuery)
            ->join('courses', 'academic_records.course_id', '=', 'courses.id')
            ->selectRaw("COALESCE(courses.course_name, 'Unknown') as name, count(*) as value")
            ->groupBy('courses.course_name')->orderByDesc('value')->limit(20)->get();

        // Region Distribution (FIXED: Uses 'Unknown' fallback)
        $regionDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
            ->selectRaw("COALESCE(regions.name, addresses.region, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(regions.name, addresses.region, 'Unknown')"))
            ->orderByDesc('value')->get();

        // Province Distribution (FIXED: Uses 'Unknown' fallback)
        $provinceDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')
            ->selectRaw("COALESCE(provinces.name, addresses.province, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(provinces.name, addresses.province, 'Unknown')"))
            ->orderByDesc('value')->limit(20)->get();

        // 3. GENERATE PDF
        $pdf = Pdf::loadView('exports.tdp-statistics-report', [
            'generated_at' => now()->format('F d, Y h:i A'),
            'filters' => $request->all(),
            'totalScholars' => $totalScholars,
            'sexDistribution' => $sexDistribution,
            'heiDistribution' => $heiDistribution,
            'courseDistribution' => $courseDistribution,
            'regionDistribution' => $regionDistribution,
            'provinceDistribution' => $provinceDistribution,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('TDP_Statistics_Report_' . now()->format('Y-m-d') . '.pdf');
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

    
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'masterlist' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('masterlist');
        $filePath = $file->store('imports');

        // Find the TDP Program ID
        $tdpProgram = Program::firstOrCreate(['program_name' => 'TDP']);

        // Dispatch the single, unified job
        ProcessMasterlistImport::dispatch($filePath, $this->tdpProgramId, Auth::id());

        // Return a JSON response instead of a redirect
        return response()->json([
            'success' => 'Masterlist is being imported. You will be notified upon completion.'
        ]);
    }
    
    public function generateStatisticsExcel(Request $request)
    {
        set_time_limit(120); 
        ini_set('memory_limit', '256M');

        // 1. BASE QUERY (Same as Dashboard)
        $statsQuery = AcademicRecord::query()
            ->whereHas('enrollment.program', fn($q) => $q->where('program_name', 'like', '%TDP%'));

        // --- APPLY FILTERS ---
        if ($v = $request->input('academic_year')) $statsQuery->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $statsQuery->where('semester_id', $v);
        if ($v = $request->input('batch_no')) $statsQuery->where('batch_no', $v);
        if ($v = $request->input('hei_id')) $statsQuery->where('hei_id', $v);
        if ($v = $request->input('course_id')) $statsQuery->where('course_id', $v);

        // Location Filters
        if ($v = $request->input('region_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('region_id', $v));
        if ($v = $request->input('province_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('province_id', $v));
        if ($v = $request->input('city_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('city_id', $v));
        if ($v = $request->input('district_id')) $statsQuery->whereHas('enrollment.scholar.address', fn($q) => $q->where('district_id', $v));

        // 2. GATHER STATISTICS (Aggregates)
        $totalScholars = (clone $statsQuery)->count();
        
        $sexDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->selectRaw("CASE WHEN scholars.sex IN ('M', 'Male') THEN 'Male' WHEN scholars.sex IN ('F', 'Female') THEN 'Female' ELSE 'Unknown' END as name, count(*) as value")
            ->groupBy('name')->get();

        $heiDistribution = (clone $statsQuery)
            ->join('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->selectRaw('heis.hei_name as name, count(*) as value')
            ->groupBy('heis.hei_name')->orderByDesc('value')->limit(50)->get();

        $courseDistribution = (clone $statsQuery)
            ->join('courses', 'academic_records.course_id', '=', 'courses.id')
            ->selectRaw("COALESCE(courses.course_name, 'Unknown') as name, count(*) as value")
            ->groupBy('courses.course_name')->orderByDesc('value')->limit(50)->get();

        $regionDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
            ->selectRaw("COALESCE(regions.name, addresses.region, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(regions.name, addresses.region, 'Unknown')"))
            ->orderByDesc('value')->get();

        $provinceDistribution = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')
            ->selectRaw("COALESCE(provinces.name, addresses.province, 'Unknown') as name, count(*) as value")
            ->groupBy(DB::raw("COALESCE(provinces.name, addresses.province, 'Unknown')"))
            ->orderByDesc('value')->limit(50)->get();

        // 3. EXPORT TO EXCEL
        // We pass the data array to the Export class
        return Excel::download(new \App\Exports\TdpStatisticsExport([
            'generated_at' => now()->format('F d, Y h:i A'),
            'filters' => $request->all(),
            'totalScholars' => $totalScholars,
            'sexDistribution' => $sexDistribution,
            'heiDistribution' => $heiDistribution,
            'courseDistribution' => $courseDistribution,
            'regionDistribution' => $regionDistribution,
            'provinceDistribution' => $provinceDistribution,
        ]), 'TDP_Statistics_Report_' . now()->format('Y-m-d') . '.xlsx');
    }


public function exportPdf(Request $request)
    {
        // 1. Prevent Script Timeout
        set_time_limit(300); // 5 minutes max
        ini_set('memory_limit', '512M'); // Cap memory to avoid crashing the whole server

        // 2. Reuse query but optimized
        $query = $this->getTdpQuery($request, 'search_db');

        // 3. SAFETY CHECK: Limit PDF rows
        // PDF is for printing small batches. Excel is for full masterlists.
        $count = $query->count();
        $limit = 1500; // Safe limit for DomPDF

        if ($count > $limit) {
            return back()->with('error', "Too many records ($count). PDF export is limited to $limit rows to prevent server crashes. Please filter your data (e.g., by HEI or Batch) or use the 'Excel' export for the full list.");
        }

        // 4. MEMORY OPTIMIZATION: Remove unnecessary relationships
        // getTdpQuery loads EVERYTHING. We strip the heavy ones not used in the PDF list.
        $query->without([
            'billingRecord.validatedBy', 
            'hei.province', 
            'hei.district', 
            'hei.city', 
            'enrollment.scholar.address.region',
            'enrollment.scholar.address.province',
            'enrollment.scholar.address.city',
            'enrollment.scholar.address.district',
            'enrollment.scholar.address.barangay',
        ]);
        
        // Only load the light text-based address relation if needed
        $query->with(['enrollment.scholar.address']); 

        $records = $query->get();

        if ($records->isEmpty()) {
            return back()->with('error', 'No records found to export.');
        }

        // 5. Generate PDF
        $pdf = Pdf::loadView('exports.tdp-masterlist-pdf', [
            'records' => $records,
            'generated_at' => now()->format('F d, Y h:i A'),
            'filters' => $request->all()
        ])->setPaper('legal', 'landscape');

        return $pdf->download('TDP_Report_' . now()->format('Y-m-d_His') . '.pdf');
    }
    /**
     * Export Filtered Report to Excel
     */
    public function exportExcel(Request $request)
    {
        set_time_limit(0);
        ini_set('memory_limit', '-1');

        // 1. Get Query Builder (don't execute ->get() here, the Export class handles chunks)
        $query = $this->getTdpQuery($request, 'search_db');

        // 2. Pass Query to Export Class
        return Excel::download(new TdpMasterlistExport($query), 'TDP_Report_' . now()->format('Y-m-d_His') . '.xlsx');
    }
}
