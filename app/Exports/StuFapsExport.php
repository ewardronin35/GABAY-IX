<?php

namespace App\Exports;

use App\Models\AcademicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;

class StuFapsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithColumnFormatting
{
    protected $programId;
    protected $filters;

    public function __construct($programId, $filters)
    {
        $this->programId = $programId;
        $this->filters = $filters;
    }

    public function query()
    {
        $query = AcademicRecord::query()
            ->select('academic_records.*')
            ->join('scholar_enrollments', 'academic_records.scholar_enrollment_id', '=', 'scholar_enrollments.id')
            ->join('scholars', 'scholar_enrollments.scholar_id', '=', 'scholars.id')
            ->leftJoin('heis', 'academic_records.hei_id', '=', 'heis.id')
            ->leftJoin('courses', 'academic_records.course_id', '=', 'courses.id')
            ->where('scholar_enrollments.program_id', $this->programId)
            ->with(['enrollment.scholar', 'hei', 'course']);

        // Apply Filters (Same as Controller)
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholar_enrollments.award_number', 'like', "%{$search}%");
            });
        }
        if (!empty($this->filters['hei_id']) && $this->filters['hei_id'] !== 'all') {
            $query->where('academic_records.hei_id', $this->filters['hei_id']);
        }
        if (!empty($this->filters['sex']) && $this->filters['sex'] !== 'all') {
            $query->where('scholars.sex', $this->filters['sex']);
        }

        // Apply Sort
        $sort = $this->filters['sort'] ?? 'updated_at';
        $dir = $this->filters['direction'] ?? 'desc';
        
        switch ($sort) {
            case 'name': $query->orderBy('scholars.family_name', $dir); break;
            case 'award_number': $query->orderBy('scholar_enrollments.award_number', $dir); break;
            case 'hei': $query->orderBy('heis.hei_name', $dir); break;
            default: $query->orderBy('academic_records.updated_at', 'desc'); break;
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Award Number',
            'Code',
            'Last Name',
            'First Name',
            'Middle Name',
            'Sex',
            'HEI Name',
            'Course/Program',
            'Year Level',
            'Grant Amount',
            'Status'
        ];
    }

    public function map($record): array
    {
        return [
            $record->enrollment->award_number ?? '',
            $record->enrollment->scholarship_type ?? '',
            $record->enrollment->scholar->family_name ?? '',
            $record->enrollment->scholar->given_name ?? '',
            $record->enrollment->scholar->middle_name ?? '',
            $record->enrollment->scholar->sex ?? '',
            $record->hei->hei_name ?? '',
            $record->course->course_name ?? '',
            $record->year_level,
            $record->grant_amount,
            $record->validation_status
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => '0054A6']]], // CHED Blue Header
        ];
    }

    public function columnFormats(): array
    {
        return [
            'J' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Grant Amount Column
        ];
    }
}