<?php

namespace App\Exports;

use App\Models\Estatskolar;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class EstatskolarMasterlistExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function query()
    {
        return Estatskolar::query()->orderBy('last_name', 'asc');
    }

    public function headings(): array
    {
        return [
            'Award Number', 'Last Name', 'First Name', 'Middle Name', 'HEI Name', 'Program Name', 'Region', 'Province'
        ];
    }

    public function map($scholar): array
    {
        return [
            $scholar->award_number,
            $scholar->last_name,
            $scholar->first_name,
            $scholar->middle_name,
            $scholar->hei_name,
            $scholar->program_name,
            $scholar->region,
            $scholar->province,
        ];
    }
}