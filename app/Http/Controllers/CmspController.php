<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicYear;
use App\Models\HEI;
use App\Models\Semester;
use App\Models\Scholar;
use App\Imports\CmspImport;
use App\Exports\CmspExport; // Will create this
use App\Exports\CmspStatisticsExport; // Will create this
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class CmspController extends Controller
{
    private $programId;

    public function __construct()
    {
        $program = Program::firstOrCreate(['program_name' => 'CMSP']);
        $this->programId = $program->id;
    }

public function index(Request $request)
    {
        // 1. MASTERLIST & DATABASE GRID DATA
        $query = AcademicRecord::query()
            ->select('academic_records.*')
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->leftJoin('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->leftJoin('courses', 'academic_records.course_id', '=', 'courses.id')
            ->where('scholar_enrollments.program_id', $this->programId)
            // Eager Load EVERYTHING needed for the Grid
            ->with([
                'enrollment.scholar.address.province', 
                'enrollment.scholar.address.city',
                'enrollment.scholar.relatives',
                'hei', 
                'enrollment.hei', // ✅ Fixes "Intended School" display issues
                'course', 
                'academicYear',
                'semester'
            ]);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholars.lrn', 'like', "%{$search}%")
                  ->orWhere('heis.hei_name', 'like', "%{$search}%");
            });
        }

        // Apply Filters
        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('semester')) $query->whereHas('semester', fn($q) => $q->where('id', $v));
        if ($v = $request->input('hei_id')) $query->where('academic_records.hei_id', $v);

        // --- SORTING ---
        $sortDir = $request->input('sort_dir', 'asc');
        $sortBy = $request->input('sort_by', 'name');

        switch ($sortBy) {
            case 'name': $query->orderBy('scholars.family_name', $sortDir)->orderBy('scholars.given_name', $sortDir); break;
            case 'lrn': $query->orderBy('scholars.lrn', $sortDir); break;
            case 'hei': $query->orderBy('heis.hei_name', $sortDir); break;
            case 'course': $query->orderBy('courses.course_name', $sortDir); break;
            case 'gwa': $query->orderBy('academic_records.gwa', $sortDir); break;
            case 'income': $query->orderBy('scholars.family_income', $sortDir); break;
            default: $query->orderBy('scholars.family_name', 'asc');
        }

        // Standard Pagination
        $enrollments = $query->paginate(50)->withQueryString();

        // 2. HEI DIRECTORY
        $paginatedHeis = HEI::select('heis.*')
            ->selectSub(function ($q) {
                $q->from('academic_records')
                  ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                  ->whereColumn('academic_records.hei_id', 'heis.id')
                  ->where('scholar_enrollments.program_id', $this->programId)
                  ->selectRaw('count(*)');
            }, 'scholars_count')
            ->having('scholars_count', '>', 0)
            ->orderByDesc('scholars_count')
            ->when($request->input('hei_search'), function($q, $search) {
                $q->where('hei_name', 'like', "%{$search}%");
            })
            ->paginate(9, ['*'], 'heis_page')->withQueryString();

        // 3. STATS
        $stats = [
            'total' => ScholarEnrollment::where('program_id', $this->programId)->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $this->programId))->sum('grant_amount'),
            
            // Scholarship Types
            'by_type' => DB::table('scholar_enrollments')
                ->where('program_id', $this->programId)
                ->select('scholarship_type', DB::raw('count(*) as count'))
                ->groupBy('scholarship_type')
                ->get(),

            // Financial History
            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $this->programId)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')->get(),

            // Gender Distribution
            'by_gender' => DB::table('scholar_enrollments')
                ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
                ->where('scholar_enrollments.program_id', $this->programId)
                ->select('scholars.sex', DB::raw('count(*) as count'))
                ->groupBy('scholars.sex')
                ->get(),

            // ✅ FIXED: HEI Type Distribution (Changed hei_type to type_of_heis)
            'by_hei_type' => DB::table('scholar_enrollments')
                ->join('heis', 'scholar_enrollments.hei_id', '=', 'heis.id')
                ->where('scholar_enrollments.program_id', $this->programId)
                ->select('heis.type_of_heis as hei_type', DB::raw('count(*) as count'))
                ->groupBy('heis.type_of_heis')
                ->get(),

            // Top 5 Schools
            'top_heis' => DB::table('scholar_enrollments')
                ->join('heis', 'scholar_enrollments.hei_id', '=', 'heis.id')
                ->where('scholar_enrollments.program_id', $this->programId)
                ->select('heis.hei_name', DB::raw('count(*) as count'))
                ->groupBy('heis.hei_name')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('Cmsp/Index', [
            'enrollments' => $enrollments, 
            'heis' => $paginatedHeis,
            'filters' => $request->all(),
            'stats' => $stats,
            'heiList' => HEI::select('id', 'hei_name')->orderBy('hei_name')->get(),
            'academicYears' => AcademicYear::select('name')->distinct()->orderBy('name', 'desc')->pluck('name')->toArray(),
            'semesters' => Semester::select('id', 'name')->get(),
        ]);
    }
public function showScholar($id)
{
    $scholar = Scholar::with([
        // 1. Address & Relatives (Fixed: Added 'relatives')
        'address.province',
        'address.city',
        'relatives', 

        // 2. CMSP Enrollment & History
        'enrollments' => function($q) {
            $q->where('program_id', $this->programId)
              ->with([
                  'hei',                     // <--- Added: For Intended School Name
                  'application_documents',   // <--- Added: For Document Checklist
                  'academicRecords' => function($q2) {
                      $q2->with(['hei', 'course', 'academicYear', 'semester'])
                         ->orderBy('academic_year_id', 'desc') 
                         ->orderBy('semester_id', 'desc');
                  }
              ]);
        }
    ])->findOrFail($id);

    return Inertia::render('Cmsp/Partials/ShowScholar', [
        'scholar' => $scholar
    ]);
}
public function showHei(Request $request, $id)
    {
        $hei = HEI::findOrFail($id);

        $query = AcademicRecord::query()
            ->select('academic_records.*')
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            // Load EVERYTHING for the Detailed View
            ->with(['enrollment.scholar.address.province', 'enrollment.scholar.address.city', 'course', 'academicYear', 'semester'])
            ->where('academic_records.hei_id', $hei->id) // ✅ FIX: Explicit table name
            ->where('scholar_enrollments.program_id', $this->programId);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Cmsp/Partials/ShowHei', [
            'hei' => $hei,
            'scholars' => $query->paginate(10)->withQueryString(),
            'filters' => $request->all(),
        ]);
    }


// --- MASSIVE BULK UPDATE FUNCTION ---
    public function bulkUpdate(Request $request)
    {
        $items = $request->input('records');
        if (!$items || !is_array($items)) return back()->withErrors(['error' => 'No data received.']);

        try {
            DB::transaction(function () use ($items) {
                foreach ($items as $row) {
                    // Skip if no ID
                    if (empty($row['id'])) continue;

                    // 1. Fetch the Core Record
                    $record = AcademicRecord::with([
                        'enrollment.scholar.address',
                        'enrollment.scholar.relatives'
                    ])->find($row['id']);
                    
                    if (!$record) continue;

                    $scholar = $record->enrollment->scholar ?? null;
                    $enrollment = $record->enrollment ?? null;

                    // 2. Update Academic Record (Grades, Course, Year Level)
                    $acUpdates = [];
                    if (isset($row['grade'])) $acUpdates['gwa'] = $row['grade'];
                    if (isset($row['c_year'])) $acUpdates['year_level'] = $row['c_year'];
                    // Note: 'course' name update is tricky if strictly using IDs. 
                    // Ideally, we update a Course Name field if it exists or ignore strictly mapped IDs.
                    if (!empty($acUpdates)) $record->update($acUpdates);

                    // 3. Update Enrollment (Financials, Points, App Info)
                    if ($enrollment) {
                        $enUpdates = [];
                        if (isset($row['g_points'])) $enUpdates['grade_points'] = $row['g_points'];
                        if (isset($row['i_points'])) $enUpdates['income_points'] = $row['i_points'];
                        if (isset($row['t_points'])) $enUpdates['total_points'] = $row['t_points'];
                        if (isset($row['scholarship'])) $enUpdates['scholarship_type'] = $row['scholarship'];
                        if (isset($row['q_scholarships'])) $enUpdates['qualified_scholarships'] = $row['q_scholarships'];
                        if (!empty($enUpdates)) $enrollment->update($enUpdates);
                    }

                    // 4. Update Scholar (Personal Info, Income)
                    if ($scholar) {
                        $scUpdates = [];
                        if (isset($row['lname'])) $scUpdates['family_name'] = $row['lname'];
                        if (isset($row['fname'])) $scUpdates['given_name'] = $row['fname'];
                        if (isset($row['mname'])) $scUpdates['middle_name'] = $row['mname'];
                        if (isset($row['income'])) {
                            $scUpdates['family_income'] = (float) str_replace(',', '', $row['income']);
                        }
                        if (isset($row['is_4ps'])) $scUpdates['is_4ps_beneficiary'] = $row['is_4ps'];
                        if (isset($row['is_single_parent'])) $scUpdates['is_solo_parent'] = $row['is_single_parent'];
                        if (isset($row['contact'])) $scUpdates['contact_no'] = $row['contact'];
                        if (!empty($scUpdates)) $scholar->update($scUpdates);

                        // 5. Update Address
                        if ($scholar->address) {
                            $addrUpdates = [];
                            if (isset($row['street'])) $addrUpdates['specific_address'] = $row['street'];
                            if (isset($row['zip_code'])) $addrUpdates['zip_code'] = $row['zip_code'];
                            if (isset($row['dist'])) $addrUpdates['district_no'] = $row['dist'];
                            if (!empty($addrUpdates)) $scholar->address->update($addrUpdates);
                        }

                        // 6. Update Parents (Basic)
                        // Finding Father
                        $father = $scholar->relatives->where('relationship_type', 'FATHER')->first();
                        if ($father) {
                            $fUpdates = [];
                            if (isset($row['f_lname'])) $fUpdates['family_name'] = $row['f_lname'];
                            if (isset($row['f_name'])) $fUpdates['given_name'] = $row['f_name'];
                            if (isset($row['f_mname'])) $fUpdates['middle_name'] = $row['f_mname'];
                            if (isset($row['f_occu'])) $fUpdates['occupation'] = $row['f_occu'];
                            if (!empty($fUpdates)) $father->update($fUpdates);
                        }

                        // Finding Mother
                        $mother = $scholar->relatives->where('relationship_type', 'MOTHER')->first();
                        if ($mother) {
                            $mUpdates = [];
                            if (isset($row['m_lname'])) $mUpdates['family_name'] = $row['m_lname'];
                            if (isset($row['m_name'])) $mUpdates['given_name'] = $row['m_name'];
                            if (isset($row['m_mname'])) $mUpdates['middle_name'] = $row['m_mname'];
                            if (isset($row['m_occu'])) $mUpdates['occupation'] = $row['m_occu'];
                            if (!empty($mUpdates)) $mother->update($mUpdates);
                        }
                    }
                }
            });

            return back()->with('success', 'Database records updated successfully!');
        } catch (\Exception $e) {
            Log::error('Bulk Update Error: ' . $e->getMessage());
            return back()->with('error', 'Failed to update records. Check logs.');
        }
    }
    // --- IMPORT ---
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,csv']);
        Excel::queueImport(new CmspImport($request->user()->id), $request->file('file'));
        return back()->with('success', 'Import Queued. Refresh shortly.');
    }

    // --- EXPORTS (Masterlist) ---
    public function exportExcel(Request $request)
    {
        return Excel::download(new CmspExport($this->programId, $request->all()), 'CMSP_Masterlist.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $export = new CmspExport($this->programId, $request->all());
        $records = $export->query()->limit(1000)->get();
        $pdf = Pdf::loadView('cmsp.pdf_masterlist', ['records' => $records])->setPaper('a4', 'landscape');
        return $pdf->stream('CMSP_Masterlist.pdf');
    }

    // --- EXPORTS (Statistics) ---
    public function exportStatisticsExcel()
    {
        return Excel::download(new CmspStatisticsExport($this->programId), 'CMSP_Stats.xlsx');
    }

    public function exportStatisticsPdf()
    {
        $pid = $this->programId;
        $data = [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            'by_type' => DB::table('scholar_enrollments')->where('program_id', $pid)
                ->select('scholarship_type', DB::raw('count(*) as count'))->groupBy('scholarship_type')->get(),
            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')->get(),
        ];
        $pdf = Pdf::loadView('cmsp.pdf_statistics', ['stats' => $data]);
        return $pdf->stream('CMSP_Stats.pdf');
    }
}