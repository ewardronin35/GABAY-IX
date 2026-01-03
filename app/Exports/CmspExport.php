<?php
namespace App\Exports;

use App\Models\AcademicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CmspExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $programId;
    protected $filters;

    public function __construct($programId, $filters) {
        $this->programId = $programId;
        $this->filters = $filters;
    }

    public function query() {
        // Reuse query logic from Controller for consistency
        return AcademicRecord::query()
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->leftJoin('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->leftJoin('courses', 'academic_records.course_id', '=', 'courses.id')
            ->where('scholar_enrollments.program_id', $this->programId)
            ->with(['enrollment.scholar', 'hei', 'course']);
    }

    public function headings(): array {
        return ['Name', 'Type', 'HEI', 'Course', 'Year', 'GWA', 'Amount'];
    }

    public function map($record): array {
        return [
            $record->enrollment->scholar->family_name . ', ' . $record->enrollment->scholar->given_name,
            $record->enrollment->scholarship_type,
            $record->hei->hei_name ?? '',
            $record->course->course_name ?? '',
            $record->year_level,
            $record->gwa,
            $record->grant_amount
        ];
    }

    public function styles(Worksheet $sheet) {
        return [1 => ['font' => ['bold' => true]]];
    }
}