<?php

namespace App\Exports;

use App\Models\TdpAcademicRecord;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithDrawings;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;

class TdpMasterlistExport implements 
    FromQuery, 
    WithHeadings, 
    WithMapping, 
    ShouldAutoSize,
    WithDrawings,
    WithEvents,
    WithCustomStartCell
{
    protected $request;

    // ✅ MODIFIED: Accept the full Request object
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    // ✅ MODIFIED: Apply filters from the request
  public function query()
    {
        $query = TdpAcademicRecord::query()->with(['scholar', 'hei', 'course']);
        
        // Filter by search
        $query->when($this->request->input('search_ml'), function ($q, $search) {
            $q->whereHas('scholar', function ($scholarQuery) use ($search) {
                $scholarQuery->where('family_name', 'like', "%{$search}%");
            });
        });

        // Filter by HEI
        $query->when($this->request->input('hei_id'), function ($q, $heiId) {
            $q->where('hei_id', $heiId);
        });

        // Filter by Batch
        $query->when($this->request->input('batch'), function ($q, $batch) {
            $q->where('batch', $batch);
        });
        
        // ✅ ADDED academic_year filter
        $query->when($this->request->input('academic_year'), function ($q, $ay) {
            $q->where('academic_year', $ay);
        });
        
        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'SEQ', 'APP NO', 'AWARD NO',
            'HEI NAME', 'HEI TYPE', 'HEI CITY/MUNICIPALITY', 'HEI PROVINCE', 'HEI DISTRICT',
            'LASTNAME', 'FIRSTNAME', 'EXT', 'MIDDLENAME', 'SEX',
            'COURSE ENROLLED', 'YEAR LEVEL',
            'STREET', 'TOWN/CITY', 'DISTRICT', 'PROVINCE',
            'CONTACT', 'EMAIL',
            'BATCH', 'STATUS OF VALIDATION',
        ];
    }

    /**
    * @param TdpAcademicRecord $record
    */
    public function map($record): array
    {
        return [
            $record->seq,
            $record->app_no,
            $record->award_no,
            $record->hei->hei_name ?? 'N/A',
            $record->hei->hei_type ?? 'N/A',
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

    public function drawings()
    {
        $chedLogo = new Drawing();
        $chedLogo->setName('CHED Logo');
        $chedLogo->setPath(public_path('images/ched-logo.png'));
        $chedLogo->setHeight(90);
        $chedLogo->setCoordinates('A1');

        $bpLogo = new Drawing();
        $bpLogo->setName('Bagong Pilipinas Logo');
        $bpLogo->setPath(public_path('images/bagong-pilipinas-logo.png'));
        $bpLogo->setHeight(90);
        
        $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($this->headings()));
        $bpLogo->setCoordinates($lastColumn.'1');

        return [$chedLogo, $bpLogo];
    }

    public function startCell(): string
    {
        return 'A8';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastColumnIndex = count($this->headings());
                $mergeRange = 'B2:'.$this->getColumnLetter($lastColumnIndex - 1).'6';

                $sheet->mergeCells($mergeRange);
                $sheet->getCell('B2')->setValue(
                    "Republic of the Philippines\n" .
                    "OFFICE OF THE PRESIDENT\n" .
                    "COMMISSION ON HIGHER EDUCATION\n\n" .
                    "Tulong Dunong Program (TDP) Masterlist"
                );

                $style = $sheet->getStyle('B2');
                $style->getAlignment()->setWrapText(true);
                $style->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $style->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $style->getFont()->setBold(true);
                $style->getFont()->setSize(14);
                
                $sheet->getStyle('A8:'.$this->getColumnLetter($lastColumnIndex).'8')->getFont()->setBold(true);
            },
        ];
    }
    
    private function getColumnLetter($index) {
        return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index);
    }
}