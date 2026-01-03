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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Str;

class EstatskolarBeneficiaryImport implements ToCollection, WithHeadingRow, WithChunkReading, ShouldQueue
{
    private $programId;
    private $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
        $program = Program::firstOrCreate(['program_name' => 'Estatistikolar']);
        $this->programId = $program->id;
    }

    // Header is on Row 10 in your E-1 Sheet
    public function headingRow(): int
    {
        return 10;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
        $importedCount = 0;
        $defaultAY = AcademicYear::firstOrCreate(['name' => '2024-2025']); 

        // Log headers for debugging
        if ($rows->isNotEmpty()) {
            Log::info("Estat Headers: " . implode(', ', array_keys($rows->first()->toArray())));
        }

        foreach ($rows as $row) {
            try {
                // --- 1. SMART HEADER DETECTION ---
                $allKeys = array_keys($row->toArray());
                
                // Find key containing "learn" and "ref" (e.g., learner_reference_number, learning_ref_no)
                $lrnKey = collect($allKeys)->first(function ($key) {
                    $norm = Str::lower(str_replace(['_', ' ', '-', '*'], '', $key));
                    return $norm === 'lrn' || (str_contains($norm, 'learn') && str_contains($norm, 'ref'));
                });

                // ✅ FIX 1: Allow Numbers! (Removed strict is_string check in clean())
                $lrn = $this->clean($row[$lrnKey] ?? $row['lrn'] ?? null);
                $awardNum = $this->clean($row['award_number']);

                // Skip if main identifiers are missing
                if (empty($awardNum) && empty($row['last_name'])) continue;

                // --- 2. SCHOLAR LOGIC ---
                $scholar = null;

                if ($lrn) $scholar = Scholar::where('lrn', $lrn)->first();
                
                if (!$scholar) {
                    $scholar = Scholar::where('given_name', $this->clean($row['first_name']))
                        ->where('family_name', $this->clean($row['last_name']))
                        ->first();
                }

                if (!$scholar) $scholar = new Scholar();

                // Map Personal Data
                $scholar->given_name = $this->clean($row['first_name']);
                $scholar->family_name = $this->clean($row['last_name']);
                $scholar->middle_name = $this->clean($row['middle_name']);
                $scholar->extension_name = $this->clean($row['ext']);
                $scholar->lrn = $lrn; 
                $scholar->date_of_birth = $this->parseDate($row['birthdate']);
                $scholar->sex = $this->parseSex($row['sex_fm']);
                $scholar->civil_status = $this->clean($row['civil_status']);

                // Map Groups
                $equityGroup = strtoupper($this->clean($row['special_equity_group'] ?? ''));
                $equityType = $this->clean($row['special_equity_group_type']);

                $scholar->is_pwd = str_contains($equityGroup, 'PWD') ? 1 : 0;
                $scholar->is_solo_parent = str_contains($equityGroup, 'SOLO') ? 1 : 0;
                $scholar->is_ip = (str_contains($equityGroup, 'IP') || str_contains($equityGroup, 'INDIGENOUS')) ? 1 : 0;

                if ($scholar->is_pwd) $scholar->disability = $equityType;
                if ($scholar->is_ip) $scholar->indigenous_group = $equityType;

                $scholar->save();

                // 3. ADDRESS
                $address = Address::firstOrNew(['scholar_id' => $scholar->id]);
                $address->region_name = $this->clean($row['region']); 
                $address->province = $this->clean($row['province_psgc_code']);
                $address->town_city = $this->clean($row['townmunicipality_city_psgc_code']);
                $address->specific_address = 'Brgy Code: ' . $this->clean($row['brgy_psgc_code']);
                $address->save();

                // 4. HEI
                $heiName = $this->clean($row['hei_name']);
                $hei = null;
                if ($heiName) {
                    $hei = HEI::where('hei_name', $heiName)->first();
                    if ($hei && empty($hei->uii_code) && !empty($row['uii_code'])) {
                        $hei->update(['uii_code' => $this->clean($row['uii_code'])]);
                    }
                }

                // 5. COURSE
                $courseName = $this->clean($row['program_name']);
                $course = null;
                if ($courseName) {
                    $course = Course::where('course_name', 'LIKE', trim($courseName))->first();
                }

                // 6. ENROLLMENT
                $enrollment = ScholarEnrollment::updateOrCreate(
                    [
                        'scholar_id' => $scholar->id,
                        'program_id' => $this->programId,
                    ],
                    [
                        'award_number' => $awardNum,
                        'hei_id' => $hei ? $hei->id : null,
                        'scholarship_type' => $this->clean($row['scholarshipgrant']),
                        'status' => 'ACTIVE' 
                    ]
                );

                // 7. ACADEMIC RECORD
                // ✅ FIX 2: Use null coalescing (??) for year_level so it doesn't crash if column missing
                AcademicRecord::updateOrCreate(
                    [
                        'scholar_enrollment_id' => $enrollment->id,
                        'academic_year_id' => $defaultAY->id,
                        'semester_id' => 1 
                    ],
                    [
                        'hei_id' => $hei ? $hei->id : null,
                        'course_id' => $course ? $course->id : null,
                        'year_level' => $this->clean($row['year_level'] ?? null), 
                    ]
                );

                $importedCount++;

            } catch (\Exception $e) {
                Log::error("Estat Import Error Row: " . json_encode($row) . " | " . $e->getMessage());
            }
        }
        
        Log::info("Estat Import Completed: {$importedCount} records.");
    }

    // --- HELPERS ---
    
    // ✅ Updated Clean Function (Handles Integers/Floats properly)
    private function clean($val) {
        if (is_null($val)) return null;
        // Convert number to string before trimming
        $str = trim((string) $val);
        return $str === '' ? null : $str;
    }

    private function parseDate($val) {
        if (!$val) return null;
        try {
            return is_numeric($val) 
                ? Date::excelToDateTimeObject($val)->format('Y-m-d') 
                : Carbon::parse($val)->format('Y-m-d');
        } catch (\Exception $e) { return null; }
    }

    private function parseSex($val) {
        $v = strtoupper($this->clean($val));
        if (in_array($v, ['M', 'MALE'])) return 'M';
        if (in_array($v, ['F', 'FEMALE'])) return 'F';
        return null;
    }
}