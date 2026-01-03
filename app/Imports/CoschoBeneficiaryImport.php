<?php

namespace App\Imports;

use App\Models\Address;
use App\Models\HEI;
use App\Models\Course;
use App\Models\Program;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\AcademicYear;
use App\Models\District; // ✅ Added District Model
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Carbon\Carbon;

class CoschoBeneficiaryImport implements ToCollection, WithStartRow, WithChunkReading, ShouldQueue
{
    private $programId;
    private $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
        $program = Program::firstOrCreate(['program_name' => 'COSCHO']);
        $this->programId = $program->id;
    }

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
        $defaultAY = AcademicYear::firstOrCreate(['name' => '2024-2025']); 

        foreach ($rows as $row) {
            try {
                // Skip rows that look like headers inside the data (e.g., "LAST NAME")
                if ($row[2] === 'LAST NAME' || empty($row[2])) continue;

                $awardNum = $this->clean($row[1]);
                $lastName = $this->clean($row[2]);
                $firstName = $this->clean($row[3]);

                if (empty($awardNum) && empty($lastName)) continue;

                // --- 1. SCHOLAR ---
                $scholar = null;
                if ($awardNum) {
                    $scholar = Scholar::whereHas('enrollments', fn($q) => $q->where('award_number', $awardNum))->first();
                }
                if (!$scholar) {
                    $scholar = Scholar::where('given_name', $firstName)->where('family_name', $lastName)->first();
                }
                if (!$scholar) $scholar = new Scholar();

                $scholar->family_name = $lastName;
                $scholar->given_name = $firstName;
                $scholar->middle_name = $this->clean($row[4]);
                $scholar->extension_name = $this->clean($row[5]);
                
                $sexRaw = strtoupper($this->clean($row[6]));
                $scholar->sex = (str_starts_with($sexRaw, 'F')) ? 'F' : ((str_starts_with($sexRaw, 'M')) ? 'M' : null);
                
                $scholar->save();

                // --- 2. ADDRESS & DISTRICT LOOKUP ---
                $address = Address::firstOrNew(['scholar_id' => $scholar->id]);
                $address->specific_address = $this->clean($row[7]); // Brgy
                $address->town_city = $this->clean($row[8]);
                $address->province = $this->clean($row[9]);
                
                // ✅ Fix: Lookup District ID
                $districtRaw = $this->clean($row[10]); // e.g., "1", "2", "1st District"
                $districtId = null;

                if ($districtRaw) {
                    // Try to find by number (assuming your District table has a 'district_number' or 'name' column)
                    // If district is just "1", "2", etc.
                    $dist = District::where('district', 'LIKE', "%{$districtRaw}%")->first();
                    if ($dist) {
                        $districtId = $dist->id;
                    }
                }
                $address->district_id = $districtId; // ✅ Use correct column name
                
                $address->save();

                // --- 3. HEI ---
                $heiName = $this->clean($row[11]);
                $hei = null;
                if ($heiName) {
                    $hei = HEI::where('hei_name', 'LIKE', trim($heiName))->first();
                }

                // --- 4. COURSE ---
                $courseName = $this->clean($row[13]);
                $course = null;
                if ($courseName) {
                    $course = Course::where('course_name', 'LIKE', trim($courseName))->first();
                }

                // --- 5. ENROLLMENT ---
                $enrollment = ScholarEnrollment::updateOrCreate(
                    [
                        'scholar_id' => $scholar->id,
                        'program_id' => $this->programId,
                    ],
                    [
                        'award_number' => $awardNum,
                        'hei_id' => $hei ? $hei->id : null,
                        'status' => 'ACTIVE'
                    ]
                );

                // --- 6. ACADEMIC RECORD ---
                $grantAmount = $this->cleanMoney($row[15]);
                
                AcademicRecord::updateOrCreate(
                    [
                        'scholar_enrollment_id' => $enrollment->id,
                        'academic_year_id' => $defaultAY->id,
                        'semester_id' => 1
                    ],
                    [
                        'hei_id' => $hei ? $hei->id : null,
                        'course_id' => $course ? $course->id : null,
                        'year_level' => $this->clean($row[14]),
                        'grant_amount' => $grantAmount
                    ]
                );

                $importedCount++;

            } catch (\Exception $e) {
                // Log simplified error
                Log::error("COSCHO Import Error Row {$row[0]}: " . $e->getMessage());
            }
        }
        
        Log::info("COSCHO Import Completed: {$importedCount} records.");
    }

    private function clean($val) {
        return (is_string($val) && trim($val) !== '') ? trim($val) : null;
    }

    private function cleanMoney($val) {
        if (!$val) return 0;
        return (float) str_replace([',', ' '], '', $val);
    }
}