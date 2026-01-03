<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicYear;
use App\Models\HEI;
use App\Models\Scholar;
use App\Models\Course;
use App\Models\Address;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Imports\CoschoBeneficiaryImport; 
use App\Exports\CoschoMasterlistExport; // Ensure these exist
use App\Exports\CoschoStatisticsExport; // Ensure these exist

class CoschoController extends Controller
{
    private $programId;

    public function __construct()
    {
        // Ensure COSCHO Program Exists
        $program = Program::firstOrCreate(['program_name' => 'COSCHO']);
        $this->programId = $program->id;
    }
public function generateNoa($id)
    {
        $enrollment = ScholarEnrollment::with(['scholar.address', 'hei'])
            ->findOrFail($id);

        $scholar = $enrollment->scholar;
        $addressObj = $scholar->address;
        
        // Format address string from object
        $address = collect([
            $addressObj->barangay ?? '', 
            $addressObj->town_city ?? '', 
            $addressObj->province ?? ''
        ])->filter()->join(', ');

        $pdf = Pdf::loadView('coscho.pdf_noa', [
            'enrollment' => $enrollment,
            'scholar' => $scholar,
            'address' => $address
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("NOA_{$scholar->family_name}.pdf");
    }
 public function index(Request $request)
    {
        // 1. DATABASE GRID DATA (Existing logic)
        $query = AcademicRecord::query()
            ->select('academic_records.*')
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->leftJoin('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->where('scholar_enrollments.program_id', $this->programId)
            ->with([
                'enrollment.scholar.address',
                'enrollment.hei',
                'hei',
                'course',
                'academicYear',
                'semester'
            ]);

        // Search & Filters (Existing Logic)
        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholar_enrollments.award_number', 'like', "%{$search}%");
            });
        }
        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('hei_id')) $query->where('academic_records.hei_id', $v);

        $records = $query->paginate(50)->withQueryString();

        // ✅ ADD THIS SECTION: HEI Directory Logic
        $heis = HEI::query()
            ->withCount(['enrollments' => function($q) {
                $q->where('program_id', $this->programId);
            }])
            ->whereHas('enrollments', function($q) {
                $q->where('program_id', $this->programId);
            })
            ->when($request->input('hei_search'), function($q, $search) {
                $q->where('hei_name', 'like', "%{$search}%");
            })
            ->orderBy('hei_name')
            ->paginate(12)
            ->withQueryString();

        // 2. STATS (Existing Logic)
        $stats = $this->getStatsData();

        return Inertia::render('Coscho/Index', [
            'records' => $records,
            'heis' => $heis, // ✅ Pass this variable to fix the error
            'filters' => $request->all(),
            'stats' => $stats,
            'heiList' => HEI::select('id', 'hei_name')->orderBy('hei_name')->get(),
            'academicYears' => AcademicYear::distinct()->orderBy('name', 'desc')->pluck('name')->toArray(),
        ]);
    }

    // --- HELPER: Get Stats ---
  private function getStatsData() {
        $pid = $this->programId;
        
        return [
            // KPI Cards
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'active' => ScholarEnrollment::where('program_id', $pid)->where('status', 'ACTIVE')->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            
            // Chart 1: Top HEIs
            'by_hei' => HEI::withCount(['enrollments' => fn($q) => $q->where('program_id', $pid)])
                        ->having('enrollments_count', '>', 0)
                        ->orderByDesc('enrollments_count')
                        ->limit(10)
                        ->get(),

            // Chart 2: Financial History
            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')
                ->orderBy('academic_years.name') // Order by year
                ->get(),

            // Chart 3: Gender Distribution
            'by_sex' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))
                ->select('sex', DB::raw('count(*) as count'))
                ->whereNotNull('sex')
                ->groupBy('sex')
                ->get(),

            // Chart 4: Geographic Distribution (Top 5 Provinces)
            'by_province' => \App\Models\Address::join('scholars', 'addresses.scholar_id', '=', 'scholars.id')
                ->join('scholar_enrollments', 'scholars.id', '=', 'scholar_enrollments.scholar_id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('addresses.province', DB::raw('count(*) as count'))
                ->whereNotNull('addresses.province')
                ->groupBy('addresses.province')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
        ];
    }

    // --- IMPORT ---
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,csv']);
        Excel::import(new CoschoBeneficiaryImport($request->user()->id), $request->file('file'));        
        return back()->with('success', 'COSCHO Masterlist Import Queued!');
    }

    // --- EXPORT STATISTICS (Excel) ---
    public function exportStatisticsExcel()
    {
        return Excel::download(new CoschoStatisticsExport($this->programId), 'COSCHO_Stats.xlsx');
    }

    // --- EXPORT STATISTICS (PDF) ---
    public function exportStatisticsPdf()
    {
        $data = $this->getStatsData();
        $pdf = Pdf::loadView('coscho.pdf_statistics', [
            'stats' => $data, 
            'title' => 'COSCHO Program Statistics', 
            'date' => now()->format('F d, Y')
        ]);
        return $pdf->stream('COSCHO_Stats.pdf');
    }

    // --- EXPORT MASTERLIST (Excel) ---
    public function generateMasterlistExcel(Request $request)
    {
        return Excel::download(new CoschoMasterlistExport($this->programId, $request->all()), 'COSCHO_Masterlist.xlsx');
    }

    // --- EXPORT MASTERLIST (PDF) ---
    public function generateMasterlistPdf(Request $request)
    {
        $export = new CoschoMasterlistExport($this->programId, $request->all());
        $records = $export->query()->limit(500)->get(); 

        $pdf = Pdf::loadView('coscho.pdf_masterlist', [
            'records' => $records, 
            'title' => 'COSCHO Masterlist'
        ])->setPaper('a4', 'landscape');
        
        return $pdf->stream('COSCHO_Masterlist.pdf');
    }

    // --- BULK UPDATE ---
   // --- BULK UPDATE (Comprehensive) ---
    public function bulkUpdate(Request $request)
    {
        $items = $request->input('records');
        if (!$items || !is_array($items)) return back()->withErrors(['error' => 'No data to save.']);

        try {
            DB::transaction(function () use ($items) {
                foreach ($items as $row) {
                    // Skip if no ID (cannot update non-existent record)
                    if (empty($row['id'])) continue;

                    // 1. Find the Main Academic Record
                    $record = AcademicRecord::with(['enrollment.scholar.address'])->find($row['id']);
                    
                    if ($record) {
                        // A. Update Academic Details
                        $acUpdates = [];
                        if (isset($row['year_level'])) $acUpdates['year_level'] = $row['year_level'];
                        if (isset($row['grant_amount'])) $acUpdates['grant_amount'] = $this->cleanMoney($row['grant_amount']);
                        if (isset($row['gwa'])) $acUpdates['gwa'] = $row['gwa'];
                        
                        if (!empty($acUpdates)) $record->update($acUpdates);

                        // B. Update Enrollment (Award No & Status)
                        if ($record->enrollment) {
                            $enUpdates = [];
                            if (isset($row['award_number'])) $enUpdates['award_number'] = $row['award_number'];
                            if (isset($row['status'])) $enUpdates['status'] = $row['status'];
                            
                            if (!empty($enUpdates)) $record->enrollment->update($enUpdates);

                            // C. Update Scholar Personal Info
                            if ($record->enrollment->scholar) {
                                $scholar = $record->enrollment->scholar;
                                $scUpdates = [];
                                
                                // Names
                                if (isset($row['lname'])) $scUpdates['family_name'] = $row['lname'];
                                if (isset($row['fname'])) $scUpdates['given_name'] = $row['fname'];
                                if (isset($row['mname'])) $scUpdates['middle_name'] = $row['mname'];
                                if (isset($row['ext'])) $scUpdates['extension_name'] = $row['ext'];
                                
                                // Demographics
                                if (isset($row['sex'])) $scUpdates['sex'] = $row['sex'];
                                if (isset($row['birthdate'])) $scUpdates['date_of_birth'] = $row['birthdate'];
                                if (isset($row['civil_status'])) $scUpdates['civil_status'] = $row['civil_status'];

                                if (!empty($scUpdates)) $scholar->update($scUpdates);

                                // D. Update Address
                                // Check if address fields are present in the update payload
                                if (isset($row['province']) || isset($row['city']) || isset($row['barangay'])) {
                                    // Get existing address or create new instance
                                    $address = $scholar->address ?? new Address(['scholar_id' => $scholar->id]);
                                    
                                    if (isset($row['province'])) $address->province = $row['province'];
                                    if (isset($row['city'])) $address->town_city = $row['city'];
                                    if (isset($row['barangay'])) $address->specific_address = $row['barangay'];
                                    
                                    $address->save();
                                }
                            }
                        }
                    }
                }
            });

            return back()->with('success', 'Records updated successfully!');

        } catch (\Exception $e) {
            Log::error('COSCHO Bulk Update Error: ' . $e->getMessage());
            return back()->with('error', 'Update failed. Please check the logs.');
        }
    }

    // Helper for cleaning money input (removes commas)
    private function cleanMoney($val) {
        if (!$val) return 0;
        return (float) str_replace([',', ' '], '', $val);
    }
    // --- SHOW HEI & ITS STUDENTS ---
    public function showHei(Request $request, $id)
    {
        $hei = HEI::findOrFail($id);

        // Fetch students enrolled in THIS HEI under COSCHO program
        $scholars = ScholarEnrollment::query()
            ->with(['scholar', 'academicRecords.course', 'academicRecords.academicYear'])
            ->where('hei_id', $id)
            ->where('program_id', $this->programId) // Strict filtering for COSCHO
            ->when($request->input('search'), function ($q, $search) {
                $q->where('award_number', 'like', "%{$search}%")
                  ->orWhereHas('scholar', function($sub) use ($search) {
                      $sub->where('family_name', 'like', "%{$search}%")
                          ->orWhere('given_name', 'like', "%{$search}%");
                  });
            })
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Coscho/Partials/CoschoShowHei', [
            'hei' => $hei,
            'scholars' => $scholars,
            'filters' => $request->only(['search']),
        ]);
    }

    // --- SHOW INDIVIDUAL SCHOLAR HISTORY ---
    public function showScholar($id)
    {
        // Fetch specific enrollment record with full history
        $enrollment = ScholarEnrollment::with([
                'scholar.address',
                'hei',
                'academicRecords.academicYear',
                'academicRecords.semester',
                'academicRecords.course',
            ])
            ->where('program_id', $this->programId)
            ->findOrFail($id);

        return Inertia::render('Coscho/Partials/CoschoShowScholar', [
            'enrollment' => $enrollment,
            'scholar' => $enrollment->scholar,
            // Sort history by Academic Year -> Semester
            'history' => $enrollment->academicRecords
                ->sortBy([['academic_year.name', 'asc'], ['semester.id', 'asc']])
                ->values()
        ]);
    }
}