<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Illuminate\Database\Eloquent\Builder;

class TesMasterlistExport implements FromView, WithEvents
{
    protected $query;

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    public function view(): View
    {
        return view('exports.tes-masterlist-excel', [
            'records' => $this->query->get()
        ]);
    }

    /**
     * Define custom column widths and styles here to fix "short cells".
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 1. SET COLUMN WIDTHS (Manually set to look good)
                // A=SEQ, B=Reg, C=Prov, D=City, E=Dist, F=Brgy, G=Zip
                // H=HEI, I=Type, J=Award, K=App
                // L=Last, M=First, N=Ext, O=Mid, P=Sex, Q=Contact
                // R=Course, S=Year, T=AY, U=Sem
                // V=Grant, W=Pay, X=Bill, Y=File, Z=Comp

                $sheet->getColumnDimension('A')->setWidth(6);   // SEQ
                $sheet->getColumnDimension('B')->setWidth(15);  // Region
                $sheet->getColumnDimension('C')->setWidth(20);  // Province
                $sheet->getColumnDimension('D')->setWidth(20);  // City
                $sheet->getColumnDimension('E')->setWidth(15);  // District
                $sheet->getColumnDimension('F')->setWidth(20);  // Brgy
                $sheet->getColumnDimension('G')->setWidth(10);  // Zip
                
                $sheet->getColumnDimension('H')->setWidth(45);  // HEI Name (Wide)
                $sheet->getColumnDimension('I')->setWidth(15);  // HEI Type
                
                $sheet->getColumnDimension('J')->setWidth(25);  // Award No
                $sheet->getColumnDimension('K')->setWidth(25);  // App No
                
                $sheet->getColumnDimension('L')->setWidth(20);  // Last Name
                $sheet->getColumnDimension('M')->setWidth(20);  // First Name
                $sheet->getColumnDimension('N')->setWidth(8);   // Ext
                $sheet->getColumnDimension('O')->setWidth(5);   // MI
                $sheet->getColumnDimension('P')->setWidth(6);   // Sex
                $sheet->getColumnDimension('Q')->setWidth(18);  // Contact No
                
                $sheet->getColumnDimension('R')->setWidth(40);  // Course (Wide)
                $sheet->getColumnDimension('S')->setWidth(8);   // Year
                $sheet->getColumnDimension('T')->setWidth(15);  // AY
                $sheet->getColumnDimension('U')->setWidth(15);  // Semester
                
                $sheet->getColumnDimension('V')->setWidth(15);  // Grant Amount
                $sheet->getColumnDimension('W')->setWidth(18);  // Payment Status
                $sheet->getColumnDimension('X')->setWidth(18);  // Billing Status
                $sheet->getColumnDimension('Y')->setWidth(10);  // File
                $sheet->getColumnDimension('Z')->setWidth(30);  // Compliance

                // 2. ENABLE TEXT WRAPPING for long columns
                $sheet->getStyle('H')->getAlignment()->setWrapText(true); // HEI Name
                $sheet->getStyle('R')->getAlignment()->setWrapText(true); // Course
                $sheet->getStyle('D')->getAlignment()->setWrapText(true); // City
                $sheet->getStyle('F')->getAlignment()->setWrapText(true); // Barangay

                // 3. STYLE THE HEADER ROW (Row 7 matches your blade structure)
                $headerRange = 'A7:Z7';
                $sheet->getStyle($headerRange)->getFont()->setBold(true);
                $sheet->getStyle($headerRange)->getAlignment()->setVertical('center');
                $sheet->getStyle($headerRange)->getAlignment()->setHorizontal('center');
                
                // 4. Center Align specific data columns for neatness
                // (SEQ, Zip, Type, Award, App, Ext, MI, Sex, Contact, Year, AY, Sem, File)
                $sheet->getStyle('A:A')->getAlignment()->setHorizontal('center'); // SEQ
                $sheet->getStyle('G:G')->getAlignment()->setHorizontal('center'); // Zip
                $sheet->getStyle('I:K')->getAlignment()->setHorizontal('center'); // Type, Award, App
                $sheet->getStyle('N:Q')->getAlignment()->setHorizontal('center'); // Ext, MI, Sex, Contact
                $sheet->getStyle('S:U')->getAlignment()->setHorizontal('center'); // Year, AY, Sem
                $sheet->getStyle('Y:Y')->getAlignment()->setHorizontal('center'); // File
            },
        ];
    }
}