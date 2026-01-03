<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicYear;
use App\Models\HEI;
use App\Models\Semester;
use App\Models\Scholar;
use App\Imports\EstatskolarMultiSheetImport; // Using the Multi-Sheet Importer
use App\Exports\EstatistikolarExport; 
use App\Exports\EstatistikolarStatisticsExport; 
use Illuminate\Http\Request;
use App\Models\Address;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class EstatistikolarController extends Controller
{
    private $programId;

    public function __construct()
    {
        $program = Program::firstOrCreate(['program_name' => 'Estatistikolar']);
        $this->programId = $program->id;
    }

    // --- MAIN DASHBOARD ---
   public function index(Request $request)
    {
        // 1. MASTERLIST & DATABASE GRID DATA
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

        // Search & Filters (Keep your existing logic)
        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholar_enrollments.award_number', 'like', "%{$search}%")
                  ->orWhere('scholars.lrn', 'like', "%{$search}%");
            });
        }
        if ($v = $request->input('academic_year')) $query->whereHas('academicYear', fn($q) => $q->where('name', $v));
        if ($v = $request->input('hei_id')) $query->where('academic_records.hei_id', $v);

        $records = $query->paginate(50)->withQueryString();

        // 2. HEI DIRECTORY (✅ FIXED QUERY)
        // This ensures we only see HEIs that actually have Estatistikolar students
        $paginatedHeis = HEI::query()
            // Filter: Only HEIs with students in this specific program
            ->whereHas('enrollments', function($q) {
                $q->where('program_id', $this->programId);
            })
            // Count: Get the specific number of students for this program
            ->withCount(['enrollments' => fn($q) => $q->where('program_id', $this->programId)])
            // Search: Allow searching for school name
            ->when($request->input('hei_search'), function($q, $search) {
                $q->where('hei_name', 'like', "%{$search}%");
            })
            ->orderBy('hei_name')
            // Pagination: Use unique page name 'heis_page'
            ->paginate(10, ['*'], 'heis_page')
            ->withQueryString();

        // 3. STATS
        $stats = [
            'total' => ScholarEnrollment::where('program_id', $this->programId)->count(),
            'active' => ScholarEnrollment::where('program_id', $this->programId)->where('status', 'ACTIVE')->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $this->programId))->sum('grant_amount'),
            'by_type' => DB::table('scholar_enrollments')->where('program_id', $this->programId)
                ->select('scholarship_type', DB::raw('count(*) as count'))->groupBy('scholarship_type')->get(),
            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $this->programId)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')->get(),
            'special_groups' => [
                ['name' => 'PWD', 'value' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $this->programId))->where('is_pwd', 1)->count()],
                ['name' => 'Solo Parent', 'value' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $this->programId))->where('is_solo_parent', 1)->count()],
                ['name' => 'Indigenous', 'value' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $this->programId))->where('is_ip', 'Yes')->count()],
            ],
        ];

        return Inertia::render('Estatistikolar/Index', [
            'records' => $records,
            'heis' => $paginatedHeis, // ✅ Passes the fixed HEI list
            'filters' => $request->all(),
            'stats' => $stats,
            'heiList' => HEI::select('id', 'hei_name')->orderBy('hei_name')->get(),
            'academicYears' => AcademicYear::distinct()->orderBy('name', 'desc')->pluck('name')->toArray(),
        ]);
    }
public function showScholar($id)
    {
        // We find the Enrollment Record (specific to Estatistikolar)
        $enrollment = ScholarEnrollment::with([
                'scholar.address',
                'hei',
                'academicRecords.academicYear',
                'academicRecords.semester',
                'academicRecords.course',
            ])
            ->findOrFail($id);

        return Inertia::render('Estatistikolar/Partials/ShowScholar', [
            'enrollment' => $enrollment,
            'scholar' => $enrollment->scholar,
            'history' => $enrollment->academicRecords
                ->sortBy(['academicYear.name', 'semester.id']) // Sort by time
                ->values()
        ]);
    }
    // --- SHOW HEI (✅ ADDED TO FIX "VIEW" BUTTON) ---
    public function showHei(Request $request, $id)
    {
        $hei = HEI::findOrFail($id);

        $scholars = ScholarEnrollment::query()
            ->with(['scholar', 'academicRecords.course', 'academicRecords.academicYear'])
            ->where('hei_id', $id)
            ->where('program_id', $this->programId)
            ->when($request->input('search'), function ($q, $search) {
                $q->where('award_number', 'like', "%{$search}%")
                  ->orWhereHas('scholar', function($sub) use ($search) {
                      $sub->where('family_name', 'like', "%{$search}%")
                          ->orWhere('given_name', 'like', "%{$search}%");
                  });
            })
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Estatistikolar/Partials/ShowHei', [
            'hei' => $hei,
            'scholars' => $scholars,
            'filters' => $request->only(['search']),
        ]);
    }
    // --- BULK UPDATE (For Grid) ---
   public function bulkUpdate(Request $request)
    {
        $items = $request->input('records');
        if (!$items || !is_array($items)) return back()->withErrors(['error' => 'No data to save.']);

        try {
            DB::transaction(function () use ($items) {
                foreach ($items as $row) {
                    if (empty($row['id'])) continue;

                    // 1. Find the Main Record
                    $record = AcademicRecord::with(['enrollment.scholar.address'])->find($row['id']);
                    
                    if ($record) {
                        // A. Update Academic Record (Grades/Year)
                        $acUpdates = [];
                        if (isset($row['year_level'])) $acUpdates['year_level'] = $row['year_level'];
                        if (isset($row['gwa'])) $acUpdates['gwa'] = $row['gwa'];
                        if (!empty($acUpdates)) $record->update($acUpdates);

                        // B. Update Enrollment (Award No, Status)
                        if ($record->enrollment) {
                            $enUpdates = [];
                            if (isset($row['award_number'])) $enUpdates['award_number'] = $row['award_number'];
                            if (isset($row['status'])) $enUpdates['status'] = $row['status'];
                            if (isset($row['scholarship_type'])) $enUpdates['scholarship_type'] = $row['scholarship_type'];
                            if (!empty($enUpdates)) $record->enrollment->update($enUpdates);

                            // C. Update Scholar (LRN, Name, Personal)
                            if ($record->enrollment->scholar) {
                                $scholar = $record->enrollment->scholar;
                                $scUpdates = [];
                                
                                // Identifiers
                                if (isset($row['lrn'])) $scUpdates['lrn'] = $row['lrn']; // ✅ Fixes LRN Update
                                
                                // Name
                                if (isset($row['lname'])) $scUpdates['family_name'] = $row['lname'];
                                if (isset($row['fname'])) $scUpdates['given_name'] = $row['fname'];
                                if (isset($row['mname'])) $scUpdates['middle_name'] = $row['mname'];
                                if (isset($row['sex'])) $scUpdates['sex'] = $row['sex'];
                                
                                // Details
                                if (isset($row['birthdate'])) $scUpdates['date_of_birth'] = $row['birthdate'];
                                if (isset($row['civil_status'])) $scUpdates['civil_status'] = $row['civil_status'];

                                // Special Groups (Convert Boolean/String to 1/0 or Yes/No)
                                if (isset($row['is_pwd'])) $scUpdates['is_pwd'] = $row['is_pwd'] ? 1 : 0;
                                if (isset($row['is_solo'])) $scUpdates['is_solo_parent'] = $row['is_solo'] ? 1 : 0;
                                if (isset($row['is_ip'])) $scUpdates['is_ip'] = ($row['is_ip'] === 'Yes' || $row['is_ip'] === true) ? 'Yes' : 'No';

                                if (!empty($scUpdates)) $scholar->update($scUpdates);

                                // D. Update Address
                                if (isset($row['province']) || isset($row['city'])) {
                                    $address = $scholar->address ?? new Address(['scholar_id' => $scholar->id]);
                                    if (isset($row['province'])) $address->province = $row['province'];
                                    if (isset($row['city'])) $address->town_city = $row['city'];
                                    $address->save();
                                }
                            }
                        }
                    }
                }
            });

            return back()->with('success', 'Records updated successfully!');
        } catch (\Exception $e) {
            Log::error('Estat Bulk Update Error: ' . $e->getMessage());
            return back()->with('error', 'Update failed. Check logs.');
        }
    }

public function fetchStatisticsData(Request $request)
    {
        // Add logic for municipalities/heis if needed by charts, or just return basic stats
        return response()->json($this->getStatsData());
    }
    // --- 3. GENERATE MASTERLIST EXCEL ---
    public function generateMasterlistExcel(Request $request)
    {
        // Ensure you create an Export class: php artisan make:export EstatMasterlistExport
return Excel::download(new EstatistikolarExport($this->programId, $request->all()), 'Estat_Masterlist.xlsx');
        
        // Placeholder if Export class doesn't exist yet:
        return back()->with('error', 'Export class not created yet.');
    }
private function getStatsData() {
        $pid = $this->programId;
        return [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'active' => ScholarEnrollment::where('program_id', $pid)->where('status', 'ACTIVE')->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            'by_type' => DB::table('scholar_enrollments')->where('program_id', $pid)
                ->select('scholarship_type', DB::raw('count(*) as count'))->groupBy('scholarship_type')->get(),
            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')->get(),
            'special_groups' => [
                'PWD' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_pwd', 1)->count(),
                'Solo Parent' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_solo_parent', 1)->count(),
                'Indigenous' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_ip', 'Yes')->count(),
            ],
        ];
    }
    // --- 4. GENERATE MASTERLIST PDF ---
public function generateMasterlistPdf(Request $request)
    {
        $export = new EstatistikolarExport($this->programId, $request->all());
        $records = $export->query()->limit(500)->get(); 

        // ✅ CORRECT VIEW PATH: resources/views/estatistikolar/pdf_masterlist.blade.php
        $pdf = Pdf::loadView('estatistikolar.pdf_masterlist', [
            'records' => $records, 
            'title' => 'Masterlist'
        ])->setPaper('a4', 'landscape');
        
        return $pdf->stream('Estat_Masterlist.pdf');
    }
    // --- IMPORT (Smart Detection) ---
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,csv']);
        
        // Use the Multi-Sheet Import Class we created
Excel::import(new EstatskolarMultiSheetImport($request->user()->id), $request->file('file'));        
        return back()->with('success', 'Import Queued! Processing E-1 and E-2 sheets...');
    }

  
    public function exportStatisticsExcel()
    {
        return Excel::download(new EstatistikolarStatisticsExport($this->programId), 'Estat_Stats.xlsx');
    }
public function exportStatisticsPdf()
    {
        $data = $this->getStatsData();
        
        // ✅ CORRECT VIEW PATH: resources/views/estatistikolar/pdf_statistics.blade.php
        $pdf = Pdf::loadView('estatistikolar.pdf_statistics', [
            'stats' => $data, 
            'title' => 'Estatistikolar Program Statistics', 
            'date' => now()->format('F d, Y')
        ]);
        
        return $pdf->stream('Estatistikolar_Stats.pdf');
    }
    // --- EXPORT STATISTICS (PDF) ---
   
}