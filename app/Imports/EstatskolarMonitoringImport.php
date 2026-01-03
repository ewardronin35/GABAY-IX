<?php

namespace App\Imports;

use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\AcademicYear;
use App\Models\Program;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class EstatskolarMonitoringImport implements ToCollection, WithStartRow, WithChunkReading, ShouldQueue
{
    private $programId;

    public function __construct($userId)
    {
        $program = Program::firstOrCreate(['program_name' => 'Estatistikolar']);
        $this->programId = $program->id;
    }

    // Data starts on Row 11 based on your file structure
    public function startRow(): int
    {
        return 11;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
        $importedCount = 0;
        
        // Setup AY (You might need to make this dynamic if file covers multiple years)
        $ay = AcademicYear::firstOrCreate(['name' => '2024-2025']);

        foreach ($rows as $row) {
            try {
                // MAPPING BASED ON EXCEL COLUMNS (0-indexed)
                // Col 3: AWARD NUMBER (Key Identifier)
                $awardNumber = $this->clean($row[3]);
                
                if (empty($awardNumber)) continue;

                // 1. FIND ENROLLMENT
                $enrollment = ScholarEnrollment::where('award_number', $awardNumber)
                    ->where('program_id', $this->programId)
                    ->first();

                if (!$enrollment) {
                    Log::warning("Estat E-2: No Enrollment found for Award Number: $awardNumber. Skipping.");
                    continue;
                }

                // 2. PROCESS 1ST SEMESTER (Cols 8-14)
                $this->updateSemesterRecord($enrollment, $ay->id, 1, [
                    'year_level'   => $row[8],
                    'status'       => $row[9],
                    'grant_amount' => $row[12], // CHED Payment Amount
                    'payment_date' => $row[13],
                    'osds_amount'  => $row[10], // Store in meta or specific column
                ]);

                // 3. PROCESS 2ND SEMESTER (Cols 15-21)
                // Only if there is data (e.g. status or amount exists)
                if (!empty($row[16]) || !empty($row[19])) {
                    $this->updateSemesterRecord($enrollment, $ay->id, 2, [
                        'year_level'   => $row[15],
                        'status'       => $row[16],
                        'grant_amount' => $row[19], // CHED Payment Amount
                        'payment_date' => $row[20],
                        'osds_amount'  => $row[17],
                    ]);
                }

                // 4. UPDATE REMARKS (Col 22)
                if (!empty($row[22])) {
                    $enrollment->update(['remarks' => $this->clean($row[22])]);
                }

                $importedCount++;

            } catch (\Exception $e) {
                Log::error("Estat E-2 Error Row: " . json_encode($row) . " | " . $e->getMessage());
            }
        }

        Log::info("Estatistikolar E-2 Chunk Imported: {$importedCount} records.");
    }

    private function updateSemesterRecord($enrollment, $ayId, $semId, $data)
    {
        $status = strtoupper($this->clean($data['status']));
        $amount = $this->cleanMoney($data['grant_amount']);
        $yearLevel = $this->parseYearLevel($data['year_level']);

        AcademicRecord::updateOrCreate(
            [
                'scholar_enrollment_id' => $enrollment->id,
                'academic_year_id' => $ayId,
                'semester_id' => $semId
            ],
            [
                'year_level' => $yearLevel,
                'grant_amount' => $amount,
                // If you added an 'osds_amount' column to your DB, map it here:
                // 'osds_amount' => $this->cleanMoney($data['osds_amount']),
            ]
        );

        // Update Main Status if "Terminated", "Graduated", etc.
        if (in_array($status, ['TERMINATED', 'GRADUATED', 'WAIVED', 'DEFERRED'])) {
            $enrollment->update(['status' => $status]);
        }
    }

    // --- HELPERS ---
    private function clean($val) {
        return (is_string($val) && trim($val) !== '') ? trim($val) : null;
    }

    private function cleanMoney($val) {
        if (!$val) return 0;
        return (float) str_replace([',', ' '], '', $val);
    }

    private function parseYearLevel($val) {
        $val = strtoupper($this->clean($val));
        if (is_numeric($val)) return (int)$val;
        if (str_contains($val, '1')) return 1;
        if (str_contains($val, '2')) return 2;
        if (str_contains($val, '3')) return 3;
        if (str_contains($val, '4')) return 4;
        return 1;
    }
}