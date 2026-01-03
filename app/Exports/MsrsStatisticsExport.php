<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MsrsStatisticsExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $stats;

    public function __construct($stats)
    {
        $this->stats = $stats;
    }

    public function view(): View
    {
        return view('exports.msrs.statistics-excel', [
            'stats' => $this->stats,
            'generated_at' => now()->format('F d, Y h:i A')
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        return []; // Styling handled in Blade view
    }
}