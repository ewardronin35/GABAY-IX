<?php

namespace App\Exports;

use App\Models\TdpAcademicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TdpMasterlistExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    /**
    * @return \Illuminate\Database\Query\Builder
    */
    public function query()
    {
        // Return the base query to fetch the records with their relationships.
        // The FromQuery concern will handle executing it efficiently.
        return TdpAcademicRecord::query()->with(['scholar', 'hei', 'course']);
    }

    /**
    * @return array
    */
    public function headings(): array
    {
        // These are the column headers that will appear in the Excel file.
        return [
            'SEQ',
            'APP NO',
            'AWARD NO',
            'HEI NAME',
            'HEI TYPE',
            'HEI CITY/MUNICIPALITY',
            'HEI PROVINCE',
            'HEI DISTRICT',
            'LASTNAME',
            'FIRSTNAME',
            'EXT',
            'MIDDLENAME',
            'SEX',
            'COURSE ENROLLED',
            'YEAR LEVEL',
            'STREET',
            'TOWN/CITY',
            'DISTRICT',
            'PROVINCE',
            'CONTACT',
            'EMAIL',
            'BATCH',
            'STATUS OF VALIDATION',
        ];
    }

    /**
    * @param TdpRecord $record
    * @return array
    */
    public function map($record): array
    {
        // This method transforms each record from the query into a flat array.
        // It matches the order of the headings() array above.
        return [
            $record->seq,
            $record->app_no,
            $record->award_no,
            $record->hei->hei_name ?? 'N/A',
            $record->hei->type_of_heis ?? 'N/A', // Assuming 'type_of_heis' is the column name in your HEI model
            $record->hei->city ?? 'N/A',
            $record->hei->province ?? 'N/A',
            $record->hei->district ?? 'N/A',
            $record->scholar->family_name ?? 'N/A',
            $record->scholar->given_name ?? 'N/A',
            $record->scholar->extension_name ?? '',
            $record->scholar->middle_name ?? 'N/A',
            $record->scholar->sex ?? 'N/A',
            $record->course->course_name ?? 'N/A',
            $record->year_level,
            $record->scholar->street ?? 'N/A',
            $record->scholar->town_city ?? 'N/A',
            $record->scholar->district ?? 'N/A',
            $record->scholar->province ?? 'N/A',
            $record->scholar->contact_no ?? 'N/A',
            $record->scholar->email_address ?? 'N/A',
            $record->batch,
            $record->validation_status,
        ];
    }
}