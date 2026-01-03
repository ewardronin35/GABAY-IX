<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Illuminate\Database\Eloquent\Builder;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TdpMasterlistExport implements FromView, WithEvents
{
    protected $query;

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    public function view(): View
    {
        return view('exports.tdp-masterlist-excel', [
            'records' => $this->query->get()
        ]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 1. SET COLUMN WIDTHS
                $sheet->getColumnDimension('A')->setWidth(8);   // SEQ
                $sheet->getColumnDimension('B')->setWidth(15);  // Region
                $sheet->getColumnDimension('C')->setWidth(20);  // Province
                $sheet->getColumnDimension('D')->setWidth(20);  // City
                $sheet->getColumnDimension('E')->setWidth(15);  // District
                $sheet->getColumnDimension('F')->setWidth(20);  // Brgy
                $sheet->getColumnDimension('G')->setWidth(10);  // Zip
                
                $sheet->getColumnDimension('H')->setWidth(40);  // HEI Name
                $sheet->getColumnDimension('I')->setWidth(25);  // Award No
                
                $sheet->getColumnDimension('J')->setWidth(20);  // Last Name
                $sheet->getColumnDimension('K')->setWidth(20);  // First Name
                $sheet->getColumnDimension('L')->setWidth(15);  // Mid Name
                $sheet->getColumnDimension('M')->setWidth(10);  // Ext
                $sheet->getColumnDimension('N')->setWidth(10);  // Sex
                $sheet->getColumnDimension('O')->setWidth(15);  // Contact
                
                $sheet->getColumnDimension('P')->setWidth(30);  // Course
                $sheet->getColumnDimension('Q')->setWidth(10);  // Year
                $sheet->getColumnDimension('R')->setWidth(15);  // AY
                $sheet->getColumnDimension('S')->setWidth(10);  // Sem
                
                $sheet->getColumnDimension('T')->setWidth(15);  // Amount
                $sheet->getColumnDimension('U')->setWidth(15);  // Status

                // 2. STYLING
                $lastRow = $sheet->getHighestRow();
                $dataRange = 'A7:U' . $lastRow; // Assuming data starts at row 7

                // Borders
                $sheet->getStyle($dataRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
                
                // Alignment
                $sheet->getStyle($dataRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle('A:G')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // Location centered
                $sheet->getStyle('H')->getAlignment()->setWrapText(true); // HEI Wrap
                $sheet->getStyle('P')->getAlignment()->setWrapText(true); // Course Wrap
                
                // Header Row (Row 7)
                $sheet->getStyle('A7:U7')->getFont()->setBold(true);
                $sheet->getStyle('A7:U7')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('A7:U7')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
            },
        ];
    }
}