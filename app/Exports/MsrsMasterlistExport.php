<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MsrsMasterlistExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $records;

    public function __construct($records)
    {
        $this->records = $records;
    }

    public function view(): View
    {
        return view('exports.msrs.masterlist-excel', [
            'records' => $this->records
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        // Optional: specific styling tweaks if needed, 
        // but most styling is now handled in the Blade view.
        return []; 
    }
}