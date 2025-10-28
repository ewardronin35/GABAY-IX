<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Illuminate\Database\Eloquent\Builder; // ✅ ADD THIS

class MasterlistExport implements FromView, WithStyles, WithEvents
{
    // ✅ ADD a property to hold the query
    protected $query;

    // ✅ ADD a constructor to accept the query
    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    // ✅ UPDATED: This method now uses the passed-in query
// In MasterlistExport.php

public function view(): View
{
    $scholars = $this->query->get()->map(function ($scholar) {
        $latestAcademicYear = $scholar->academicYears->sortByDesc('academic_year')->first();
        return [
            'award_no' => $latestAcademicYear->award_number ?? 'N/A',
            'last_name' => $scholar->family_name,
            'first_name' => $scholar->given_name,
            'middle_name' => $scholar->middle_name, // ✅ ADD THIS
            'sex' => $scholar->sex,                 // ✅ ADD THIS
            'hei' => $scholar->education->hei->hei_name ?? 'N/A',
            'course' => $scholar->education->course->course_name ?? 'N/A',
            'region' => $scholar->address->region ?? 'N/A',
            'status' => $latestAcademicYear->status_type ?? 'N/A',
        ];
    });

    return view('reports.masterlist-excel', ['scholars' => $scholars]);
}

    // The styles() and registerEvents() methods remain exactly the same.
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F81BD']],
        ]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $sheet->freezePane('A2');
                foreach (range('A', 'H') as $columnID) {
                    $sheet->getColumnDimension($columnID)->setAutoSize(true);
                }
            },
        ];
    }
}