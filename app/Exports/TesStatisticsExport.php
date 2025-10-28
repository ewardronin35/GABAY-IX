<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Models\TesScholar;
use App\Models\TesAcademicRecord;
use Illuminate\Support\Facades\DB;

class TesStatisticsExport implements WithMultipleSheets
{
    use Exportable;

    public function sheets(): array
    {
        $sheets = [];

        // Sheet 1: Scholars by Province
        $scholarsPerRegion = TesScholar::select('province', DB::raw('count(*) as total'))
            ->whereNotNull('province')->groupBy('province')->orderBy('total', 'desc')->get();
        $sheets[] = new FromCollectionExport('Scholars by Province', ['Province', 'Total Scholars'], $scholarsPerRegion);

        // Sheet 2: Scholars by Sex
        $scholarsBySex = TesScholar::select('sex', DB::raw('count(*) as total'))
            ->whereNotNull('sex')->whereIn('sex', ['M', 'F'])->groupBy('sex')->get();
        $sheets[] = new FromCollectionExport('Scholars by Sex', ['Sex', 'Total Scholars'], $scholarsBySex);

        // Sheet 3: Scholars by Year Level
        $scholarsByYearLevel = TesAcademicRecord::select('year_level', DB::raw('count(*) as total'))
            ->whereNotNull('year_level')->groupBy('year_level')->orderBy('year_level', 'asc')->get();
        $sheets[] = new FromCollectionExport('Scholars by Year Level', ['Year Level', 'Total Scholars'], $scholarsByYearLevel);

        return $sheets;
    }
}