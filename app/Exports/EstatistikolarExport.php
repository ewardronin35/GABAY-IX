<?php

namespace App\Exports;

use App\Models\AcademicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EstatistikolarExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $programId;
    protected $filters;
    protected $rowNumber = 0;

    public function __construct($programId, $filters = [])
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
            ->where('scholar_enrollments.program_id', $this->programId)
            ->with(['enrollment.scholar', 'hei', 'course', 'academicYear', 'semester']);

        // ✅ 1. Apply Search Filter (Name, Award No, LRN)
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholar_enrollments.award_number', 'like', "%{$search}%")
                  ->orWhere('scholars.lrn', 'like', "%{$search}%");
            });
        }

        // ✅ 2. Apply Academic Year Filter
        if (!empty($this->filters['academic_year'])) {
            $ay = $this->filters['academic_year'];
            $query->whereHas('academicYear', fn($q) => $q->where('name', $ay));
        }

        // ✅ 3. Apply HEI Filter
        if (!empty($this->filters['hei_id'])) {
            $query->where('academic_records.hei_id', $this->filters['hei_id']);
        }

        return $query->orderBy('scholars.family_name');
    }

    public function headings(): array
    {
        return [
            'NO.',
            'AWARD NUMBER',
            'LRN', // ✅ Added LRN
            'LAST NAME',
            'FIRST NAME',
            'MIDDLE NAME',
            'SEX',
            'BIRTHDATE',
            'HEI NAME',
            'COURSE / PROGRAM',
            'YEAR LEVEL',
            'GWA',
            'STATUS',
            'SCHOLARSHIP TYPE',
            'ACADEMIC YEAR'
        ];
    }

    public function map($record): array
    {
        $this->rowNumber++;
        $scholar = $record->enrollment->scholar;
        $enrollment = $record->enrollment;

        return [
            $this->rowNumber,
            $enrollment->award_number,
            $scholar->lrn, // ✅ Mapped LRN
            $scholar->family_name,
            $scholar->given_name,
            $scholar->middle_name,
            $scholar->sex,
            $scholar->date_of_birth,
            
            // Handle potentially missing HEI/Course relations gracefully
            $record->hei->hei_name ?? $enrollment->hei->hei_name ?? 'N/A',
            $record->course->course_name ?? 'N/A',
            
            $record->year_level,
            $record->gwa,
            $enrollment->status,
            $enrollment->scholarship_type,
            $record->academicYear->name ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header Style
            1 => ['font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF10B981']]], // Emerald Green
        ];
    }
}