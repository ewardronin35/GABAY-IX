<?php
namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Facades\DB;

class CmspStatisticsExport implements FromCollection, WithHeadings
{
    protected $programId;
    public function __construct($id) { $this->programId = $id; }

    public function collection() {
        return DB::table('scholar_enrollments')
            ->where('program_id', $this->programId)
            ->select('scholarship_type', DB::raw('count(*) as count'))
            ->groupBy('scholarship_type')
            ->get();
    }

    public function headings(): array { return ['Type', 'Count']; }
}