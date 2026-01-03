<?php

namespace App\Exports;

use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\HEI;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Facades\DB;

class CoschoStatisticsExport implements FromView, ShouldAutoSize
{
    protected $programId;

    public function __construct($programId)
    {
        $this->programId = $programId;
    }

    public function view(): View
    {
        $pid = $this->programId;

        // Gather Statistics
        $stats = [
            'total' => ScholarEnrollment::where('program_id', $pid)->count(),
            'active' => ScholarEnrollment::where('program_id', $pid)->where('status', 'ACTIVE')->count(),
            'amount' => AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $pid))->sum('grant_amount'),
            
            'by_hei' => HEI::withCount(['enrollments' => fn($q) => $q->where('program_id', $pid)])
                        ->having('enrollments_count', '>', 0)
                        ->orderByDesc('enrollments_count')
                        ->get(),

            'financials' => DB::table('academic_records')
                ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
                ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
                ->where('scholar_enrollments.program_id', $pid)
                ->select('academic_years.name as year', DB::raw('sum(grant_amount) as total'))
                ->groupBy('academic_years.name')
                ->get(),
        ];

        // Ensure you create this view file next
        return view('coscho.pdf_statistics', [
            'stats' => $stats,
            'title' => 'COSCHO Program Statistics Report',
            'date' => now()->format('F d, Y'),
        ]);
    }
}