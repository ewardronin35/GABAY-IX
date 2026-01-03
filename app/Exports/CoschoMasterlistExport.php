<?php

namespace App\Exports;

use App\Models\AcademicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CoschoMasterlistExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
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
            ->with(['enrollment.scholar.address', 'hei', 'course', 'academicYear']);

        // 1. Apply Search Filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('scholars.family_name', 'like', "%{$search}%")
                  ->orWhere('scholars.given_name', 'like', "%{$search}%")
                  ->orWhere('scholar_enrollments.award_number', 'like', "%{$search}%");
            });
        }

        // 2. Apply Academic Year Filter
        if (!empty($this->filters['academic_year'])) {
            $ay = $this->filters['academic_year'];
            $query->whereHas('academicYear', fn($q) => $q->where('name', $ay));
        }

        // 3. Apply HEI Filter
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
            'LAST NAME',
            'FIRST NAME',
            'MIDDLE NAME',
            'EXT',
            'SEX',
            'ADDRESS (TOWN/PROVINCE)',
            'HEI NAME',
            'COURSE / PROGRAM',
            'YEAR LEVEL',
            'GRANT AMOUNT',
            'STATUS',
            'ACADEMIC YEAR'
        ];
    }

    public function map($record): array
    {
        $this->rowNumber++;
        $scholar = $record->enrollment->scholar;
        $enrollment = $record->enrollment;
        $address = $scholar->address;

        $fullAddress = $address ? 
            ($address->town_city . ', ' . $address->province) : '';

        return [
            $this->rowNumber,
            $enrollment->award_number,
            $scholar->family_name,
            $scholar->given_name,
            $scholar->middle_name,
            $scholar->extension_name,
            $scholar->sex,
            $fullAddress,
            
            // HEI & Course
            $record->hei->hei_name ?? $enrollment->hei->hei_name ?? 'N/A',
            $record->course->course_name ?? 'N/A',
            
            $record->year_level,
            $record->grant_amount, // Financial Benefit
            $enrollment->status,
            $record->academicYear->name ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header Style: Blue Background, White Text
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']], 
                'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF2563EB']]
            ], 
        ];
    }
}