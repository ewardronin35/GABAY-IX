<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use App\Models\ScholarEnrollment;
use App\Models\Scholar;
use App\Models\AcademicRecord;
use Illuminate\Support\Facades\DB;

class StuFapsStatisticsExport implements WithMultipleSheets
{
    protected $programId;

    public function __construct($programId)
    {
        $this->programId = $programId;
    }

    public function sheets(): array
    {
        return [
            new StatisticsSummarySheet($this->programId),
            new FinancialsSheet($this->programId),
        ];
    }
}

// Internal class for Summary
class StatisticsSummarySheet implements FromCollection, WithHeadings, WithTitle
{
    protected $programId;
    public function __construct($id) { $this->programId = $id; }

    public function collection()
    {
        $byCode = ScholarEnrollment::where('program_id', $this->programId)
            ->select('scholarship_type', DB::raw('count(*) as total'))
            ->groupBy('scholarship_type')
            ->get();
            
        return $byCode;
    }

    public function headings(): array { return ['Scholarship Code', 'Total Scholars']; }
    public function title(): string { return 'Scholarship Distribution'; }
}

// Internal class for Financials
class FinancialsSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $programId;
    public function __construct($id) { $this->programId = $id; }

    public function collection()
    {
        return AcademicRecord::whereHas('enrollment', fn($q) => $q->where('program_id', $this->programId))
            ->join('academic_years', 'academic_records.academic_year_id', '=', 'academic_years.id')
            ->select('academic_years.name', DB::raw('sum(grant_amount) as total'))
            ->groupBy('academic_years.name')
            ->get();
    }

    public function headings(): array { return ['Academic Year', 'Total Disbursement']; }
    public function title(): string { return 'Financial History'; }
}