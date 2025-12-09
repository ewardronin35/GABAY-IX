<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Program;
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
use App\Jobs\ProcessMasterlistImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TesMasterlistExport;
use Barryvdh\DomPDF\Facade\Pdf;

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

    /**
     * Centralized Query Builder (Adapted from TDP)
     * ✅ Loads ALL relationships so the Grid isn't empty.
     */
    public function getTesQuery(Request $request, string $searchKey = 'search'): Builder
    {
       $query = AcademicRecord::with([
            // Address
            'enrollment.scholar.address.city',     
            'enrollment.scholar.address.district', 
            'enrollment.scholar.address.barangay', 
            'enrollment.scholar.address.province',
            'enrollment.scholar.address', 
            
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
        // 1. BASE QUERY (For Stats & Charts)
        $statsQuery = AcademicRecord::query()
            ->whereHas('enrollment.program', function ($q) {
                $q->where('program_name', 'like', '%TES%');
            });

        // Apply Filters to Stats
        if ($request->input('academic_year')) $statsQuery->whereHas('academicYear', fn($ay) => $ay->where('name', $request->input('academic_year')));
        if ($request->input('semester')) $statsQuery->where('semester_id', $request->input('semester'));
        if ($request->input('batch_no')) $statsQuery->where('batch_no', $request->input('batch_no'));
        if ($request->input('hei_id')) $statsQuery->where('hei_id', $request->input('hei_id'));
        if ($request->input('course_id')) $statsQuery->where('course_id', $request->input('course_id'));

        // 2. DROPDOWNS
        $semesters = Semester::all()->map(fn($sem) => ['id' => $sem->id, 'name' => $sem->name])->toArray();
        $batches = AcademicRecord::whereHas('enrollment.program', fn($q) => $q->where('program_name', 'like', '%TES%'))
            ->whereNotNull('batch_no')->distinct()->orderBy('batch_no', 'asc')->pluck('batch_no')->toArray();
        $heiList = HEI::select('id', 'hei_name')->orderBy('hei_name')->get();
        $courses = Course::select('id', 'course_name')->orderBy('course_name')->get()->toArray();

        // 3. STATISTICS
        $totalScholars = (clone $statsQuery)->count();
        $uniqueHeis = (clone $statsQuery)->distinct('hei_id')->count('hei_id');
        $uniqueCourses = (clone $statsQuery)->distinct('course_id')->count('course_id');
        $uniqueProvinces = (clone $statsQuery)
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->join('addresses', 'scholars.id', '=', 'addresses.scholar_id')
            ->distinct('addresses.province')
            ->count('addresses.province');

        // 4. CHARTS
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

        // 5. FETCH GRID DATA
        $databaseEnrollments = $this->getTesQuery($request, 'search_db')->paginate(10, ['*'], 'db_page')->withQueryString();
        $masterlistEnrollments = $this->getTesQuery($request, 'search_ml')->paginate(10, ['*'], 'ml_page')->withQueryString();
        
        $heiQuery = HEI::query()
            ->whereHas('academicRecords', function ($q) use ($request) { 
                $q->whereHas('enrollment.program', fn($eq) => $eq->where('program_name', 'like', '%TES%'));
                $q->when($request->input('academic_year'), fn($sq, $ay) => $sq->whereHas('academicYear', fn($a) => $a->where('name', $ay)));
            });
        $paginatedHeis = $heiQuery->paginate(10, ['*'], 'hei_page')->withQueryString();

        // 6. FETCH VALIDATION DATA
        // Using the same logic as TDP to prepare data if you decide to show it on Index
        $validationScholars = ScholarEnrollment::with([
            'scholar', 
            'program', 
            'academicRecords' => function($q) {
                $q->latest()->take(1)->with('billingRecord');
            }
        ])
        ->whereHas('program', fn($q) => $q->where('program_name', 'like', '%TES%')) 
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

        return Inertia::render('Admin/Tes/Index', [
            'database_tes' => $databaseEnrollments, 
            'ml_tes' => $masterlistEnrollments,
            'paginatedHeis' => $paginatedHeis,
            'validationScholars' => $validationScholars, 

            'filters_db' => ['search_db' => $request->input('search_db')],
            'filters_ml' => ['search_ml' => $request->input('search_ml')],
            'filters' => $request->all(),

            'academicYears' => $this->academicYears,
            'semesters' => $semesters,
            'batches' => $batches,
            'hei_list' => $heiList,
            'course_list' => $courses,
            'heiList' => $heiList, // Send as both names just in case
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
            ]
        ]);
    }

    /**
     * Handle FilePond Upload (Temporary Storage)
     * MUST return a plain text string (the file path)
     */
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
    // 1. CLEAN THE DATA
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

        // Clean string values
        foreach ($cleanedRow as $key => $value) {
            if (is_string($value)) {
                $value = trim($value);
                if ($value === '') $value = null;
            }
            $cleanedRow[$key] = $value;
        }

        // Force truncate contact number
        if (!empty($cleanedRow['contact_no'])) {
            $cleanedRow['contact_no'] = substr($cleanedRow['contact_no'], 0, 20);
        }

        $cleanedData[] = $cleanedRow;
    }

    // 2. VALIDATE (Simplified for speed)
    $validator = Validator::make(['enrollments' => $cleanedData], [
        'enrollments' => 'required|array',
        'enrollments.*.scholar_id' => 'nullable|integer|exists:scholars,id',
        'enrollments.*.family_name' => 'required_without:enrollments.*.scholar_id|nullable|string|max:255',
        'enrollments.*.given_name' => 'required_without:enrollments.*.scholar_id|nullable|string|max:255',
    ]);

    if ($validator->fails()) {
        Log::warning('Bulk update validation failed', $validator->errors()->toArray());
        return redirect()->back()->withErrors($validator->errors());
    }

    // 3. PROCESS UPSERT
    try {
        DB::transaction(function () use ($cleanedData) {
            foreach ($cleanedData as $row) {
                
                // Defaults
                $defaults = [
                    'family_name' => null, 'given_name' => null, 'middle_name' => null, 'extension_name' => null,
                    'sex' => null, 'contact_no' => null, 'email_address' => null,
                    'province' => null, 'city_municipality' => null, 'district' => null, 'zip_code' => null,
                    'specific_address' => null, 'barangay' => null, 'award_no' => null, 'seq' => null,
                    'app_no' => null, 'year_level' => null, 'batch' => null, 'validation_status' => null,
                    'date_paid' => null, 'tdp_grant' => null, 'endorsed_by' => null,
                    'billing_amount' => null, 'billing_status' => null, 'date_fund_request' => null,
                    'date_sub_aro' => null, 'date_nta' => null, 'date_disbursed_to_hei' => null,
                    // Keys for ID Lookup
                    'hei_name' => null, 'hei_uii' => null, 'course_name' => null, 
                    'semester' => null, 'academic_year' => null, 'region' => null
                ];
                $safeRow = array_merge($defaults, $row);
                
                $parseDate = fn($d) => $d ? Carbon::parse($d)->format('Y-m-d') : null;

                // --- A. LOOKUP LOCATION IDs (Fix for "Region/Province/City/Brgy doesn't display") ---
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
                    // Try finding district by name
                    $dist = District::where('name', 'LIKE', "%{$safeRow['district']}%")->first();
                    if ($dist) $districtId = $dist->id;
                }

                $barangayId = null;
                if (!empty($safeRow['barangay'])) {
                    // Best effort: Find barangay. If city is known, use it to narrow down.
                    $bQuery = Barangay::where('barangay', 'LIKE', "%{$safeRow['barangay']}%");
                    if ($cityId) $bQuery->where('cityID', $cityId);
                    $brgy = $bQuery->first();
                    
                    // If we found one (or created one if you prefer), set ID
                    if ($brgy) $barangayId = $brgy->id;
                }

                // --- B. Handle Scholar & Address ---
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
                    // Save IDs AND Text
                    $scholar->address()->updateOrCreate(
                        ['scholar_id' => $scholar->id],
                        [
                            'region_id' => $regionId,
                            'province_id' => $provinceId,
                            'city_id' => $cityId,
                            'district_id' => $districtId,
                            'barangay_id' => $barangayId,
                            
                            // Fallback text values
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

                // --- C. Handle Enrollment (Fix for "Academic Year Applied" & "App No") ---
                
                // 1. Lookup Academic Year ID
                $ayAppliedId = null;
                if (!empty($safeRow['academic_year'])) {
                    $ay = AcademicYear::where('name', $safeRow['academic_year'])->first();
                    if ($ay) $ayAppliedId = $ay->id;
                }

                // 2. Create/Update Enrollment
                $enrollment = ScholarEnrollment::firstOrCreate(
                    ['scholar_id' => $scholar->id, 'program_id' => 4], // 4 = TDP
                    [
                        'status' => 'active', 
                        'award_number' => $safeRow['award_no'], 
                        'application_number' => $safeRow['app_no'], // Fix: Save App No
                        'academic_year_applied_id' => $ayAppliedId // Fix: Save AY Applied ID
                    ]
                );
                
                if (!$enrollment->wasRecentlyCreated) {
                    $enrollment->update([
                        'award_number' => $safeRow['award_no'],
                        'application_number' => $safeRow['app_no'], // Fix: Update App No
                        'academic_year_applied_id' => $ayAppliedId // Fix: Update AY ID
                    ]);
                }

                // --- D. Lookup & Save Academic Record (HEI/Course/Sem/etc) ---
                
                // HEI Lookup
                $heiId = null;
                if (!empty($safeRow['hei_uii'])) {
                    $hei = \App\Models\HEI::where('hei_code', $safeRow['hei_uii'])->first();
                    if ($hei) $heiId = $hei->id;
                }
                if (!$heiId && !empty($safeRow['hei_name'])) {
                    $hei = \App\Models\HEI::where('hei_name', $safeRow['hei_name'])->first();
                    if ($hei) $heiId = $hei->id;
                }

                // Course Lookup
                $courseId = null;
                if (!empty($safeRow['course_name'])) {
                    $course = \App\Models\Course::where('course_name', $safeRow['course_name'])->first();
                    if ($course) $courseId = $course->id;
                }

                // Semester Lookup
                $semesterId = null;
                if (!empty($safeRow['semester'])) {
                    $sem = \App\Models\Semester::where('name', $safeRow['semester'])->first();
                    if ($sem) $semesterId = $sem->id;
                }

                // Academic Year Lookup (Record Level)
                $academicYearId = $ayAppliedId; // Usually same as applied, or lookup again if row differs

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
                ];

                if ($academicRecord) {
                    $academicRecord->update($recordData);
                } else {
                    $academicRecord = AcademicRecord::create(array_merge($recordData, [
                        'scholar_enrollment_id' => $enrollment->id,
                    ]));
                }

                // --- E. Handle Billing Record ---
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

        return Inertia::render('Admin/Tes/Partials/ShowScholar', [
            'scholar' => $scholar
        ]);
    }

    public function showHei(Request $request, HEI $hei): Response
    {
        return Inertia::render('Admin/Tes/Partials/ShowHei', ['hei' => $hei]);
    }

    // Export Functions
    public function exportPdf(Request $request)
    {
        $query = $this->getTesQuery($request, 'search_db');
        $records = $query->get();
        if ($records->isEmpty()) return back()->with('error', 'No records found.');

        $pdf = Pdf::loadView('exports.tes-masterlist-pdf', [
            'records' => $records,
            'generated_at' => now()->format('F d, Y h:i A'),
            'filters' => $request->all()
        ])->setPaper('a4', 'landscape');

        return $pdf->download('TES_Report_' . now()->format('Y-m-d_His') . '.pdf');
    }

   public function exportExcel(Request $request)
    {
        // Build the query and pass the Eloquent\Builder that TesMasterlistExport expects
        $query = $this->getTesQuery($request, 'search_db');
        return Excel::download(new TesMasterlistExport($query), 'TES_Report_' . now()->format('Y-m-d_His') . '.xlsx');
    }
}