<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FromCollectionExport implements FromCollection, WithTitle, WithHeadings, ShouldAutoSize, WithStyles
{
    protected $title;
    protected $headings;
    protected $data;

    public function __construct(string $title, array $headings, Collection $data)
    {
        $this->title = $title;
        $this->headings = $headings;
        $this->data = $data;
    }

    public function collection() { return $this->data; }
    public function title(): string { return $this->title; }
    public function headings(): array { return $this->headings; }
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('1')->getFont()->setBold(true);
    }
}