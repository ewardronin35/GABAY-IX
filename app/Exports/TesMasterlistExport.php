<?php

namespace App\Exports;

use App\Models\AcademicRecord; // Import the correct model
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Database\Eloquent\Builder; // Import the Builder

class TesMasterlistExport implements FromQuery, WithHeadings, WithMapping
{
    protected $query;

    /**
     * Accept the query Builder, not the Request.
     */
    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    /**
     * Return the query that was passed in.
     */
    public function query()
    {
        return $this->query;
    }

    /**
     * Define the column headings for the Excel file.
     */
    public function headings(): array
    {
        return [
            'Family Name',
            'Given Name',
            'Middle Name',
            'Sex',
            'Region',
            'HEI',
            'Course',
            'Major', // Added Major
            'Year Level',
            'Remarks',
        ];
    }

    /**
     * Map the data from the new normalized structure.
     * $record is an AcademicRecord model.
     */
    public function map($record): array
    {
        // Use the new relationships
        $scholar = $record->enrollment->scholar;
        $address = $scholar->address; // Access address from the main scholar
        $hei = $record->hei;
        $course = $record->course;
        $major = $record->major;

        return [
            $scholar->family_name ?? 'N/A',
            $scholar->given_name ?? 'N/A',
            $scholar->middle_name ?? '',
            $scholar->sex ?? 'N/A',
            $address->region ?? 'N/A',
            $hei->hei_name ?? 'N/A',
            $course->course_name ?? 'N/A',
            $major->major_name ?? '', // Added Major
            $record->year_level ?? 'N/A',
            $record->remarks ?? '',
        ];
    }
}