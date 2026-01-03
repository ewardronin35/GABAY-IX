<?php

namespace App\Exports;

use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\Scholar;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Facades\DB;

class EstatistikolarStatisticsExport implements FromView, ShouldAutoSize
{
    protected $programId;

    public function __construct($programId)
    {
        $this->programId = $programId;
    }

    public function view(): View
    {
        $pid = $this->programId;

        // ✅ Gather Real-Time Statistics (Same logic as PDF)
        $stats = [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'active' => ScholarEnrollment::where('program_id', $pid)->where('status', 'ACTIVE')->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            
            'by_type' => DB::table('scholar_enrollments')
                ->where('program_id', $pid)
                ->select('scholarship_type', DB::raw('count(*) as count'))
                ->groupBy('scholarship_type')
                ->get(),

            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')
                ->get(),

            'special_groups' => [
                'PWD' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_pwd', 1)->count(),
                'Solo Parent' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_solo_parent', 1)->count(),
                'Indigenous' => Scholar::whereHas('enrollments', fn($q) => $q->where('program_id', $pid))->where('is_ip', 'Yes')->count(),
            ],
        ];

        // ✅ FIXED: Points to 'estatistikolar.pdf_statistics' (The file you already have)
        // This will render the HTML table and save it as an .xlsx file
        return view('estatistikolar.pdf_statistics', [
            'stats' => $stats,
            'title' => 'Estatistikolar Program Statistics Report',
            'date' => now()->format('F d, Y'),
        ]);
    }
}