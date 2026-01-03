<?php

namespace App\Imports;

use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\BillingRecord; // ✅ Added BillingRecord Model
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\Program;
use App\Models\Address;
use App\Models\Province;
use App\Models\City;
use App\Models\Barangay;
use App\Models\HEI;
use App\Models\Semester;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MsrsProfileImport implements ToModel, WithStartRow, WithBatchInserts, SkipsEmptyRows, WithChunkReading, ShouldQueue
{
    private $uploaderId;
    private $msrsProgramId;

    public function __construct($uploaderId = null)
    {
        $this->uploaderId = $uploaderId ?? Auth::id();
        try {
            $this->msrsProgramId = Program::where('program_name', 'like', '%MSRS%')->value('id') ?? 5;
        } catch (\Exception $e) {
            $this->msrsProgramId = 5;
        }
    }

    public function startRow(): int { return 7; }

    public function model(array $row)
    {
        try {
            // 1. DATA VALIDATION (Basic)
            // Ensure Last Name and First Name exist
            if (empty($row[2]) || empty($row[3]) || strtoupper(trim($row[2])) === 'LAST NAME') {
                return null;
            }
            $seq = trim($row[0] ?? null);
            $awardNo    = trim($row[1] ?? '');
            $lastName   = strtoupper(trim($row[2]));
            $firstName  = strtoupper(trim($row[3]));
            $extName    = trim($row[4] ?? null);
            $middleName = strtoupper(trim($row[5] ?? ''));
            $sex        = $this->transformSex($row[6] ?? null);

            // 2. CREATE/UPDATE SCHOLAR
            $scholar = Scholar::firstOrCreate(
                ['given_name' => $firstName, 'family_name' => $lastName, 'middle_name' => $middleName],
                ['extension_name' => $extName, 'sex' => $sex]
            );

            // 3. ADDRESS PROCESSING (WITH BARANGAY LOOKUP)
            $this->processAddress($scholar, $row);

            // 4. HEI & COURSE LOOKUP
          
            $heiName = trim($row[11] ?? '');
            $heiId = null;

            if ($heiName) {
                // Attempt 1: Standard Search
                $hei = HEI::where('hei_name', $heiName)->first();

                // Attempt 2: Robust Uppercase Match
                // This forces both the Database value and Excel value to UPPERCASE before comparing
                if (!$hei) {
                    $hei = HEI::whereRaw('UPPER(hei_name) = ?', [strtoupper($heiName)])->first();
                }

                if ($hei) {
                    $heiId = $hei->id;
                } else {
                    // Optional: Log names that STILL fail so you can fix them in Excel
                    Log::warning("HEI Lookup Failed: '{$heiName}' not found in DB.");
                }
            }
            $rawCourse = trim($row[13] ?? '');
            $courseId = null;
            if ($rawCourse) {
                if (str_contains(strtoupper($rawCourse), 'MEDICINE')) {
                    $courseId = Course::where('course_name', 'DOCTOR OF MEDICINE')->value('id');
                } else {
                    $courseId = Course::where('course_name', $rawCourse)->value('id');
                }
            }

            // 5. ENROLLMENT RECORD
            $enrollment = ScholarEnrollment::firstOrCreate(
                ['scholar_id' => $scholar->id, 'program_id' => $this->msrsProgramId],
                ['award_number' => $awardNo, 'status' => 'Enrolled', 'hei_id' => $heiId]
            );
            
            // Update award number if missing
            if ($awardNo && empty($enrollment->award_number)) {
                $enrollment->update(['award_number' => $awardNo]);
            }

            // 6. PROCESS ACADEMIC & BILLING HISTORY (All Years/Sems)
            // Config mapping columns to Years and Sems
            // 's1_col' contains the amount for Sem 1, 's2_col' contains amount for Sem 2
            $historyMap = [
                ['ay' => '2021-2022', 'year_col' => 14, 's1_col' => 15, 's2_col' => 17],
                ['ay' => '2022-2023', 'year_col' => 19, 's1_col' => 20, 's2_col' => 22],
                ['ay' => '2023-2024', 'year_col' => 24, 's1_col' => 25, 's2_col' => 27],
                ['ay' => '2024-2025', 'year_col' => 29, 's1_col' => 30, 's2_col' => 32],
                ['ay' => '2025-2026', 'year_col' => 34, 's1_col' => 35, 's2_col' => 37],
            ];

            foreach ($historyMap as $map) {
                $yearLevelVal = trim($row[$map['year_col']] ?? '');
                
                // If year level is missing, skip this block entirely
                if (empty($yearLevelVal) || !is_numeric($yearLevelVal)) continue;
                
                $ayId = AcademicYear::firstOrCreate(['name' => $map['ay']])->id;

                // --- 1st Semester ---
                $rawAmount1 = trim($row[$map['s1_col']] ?? '');
                if ($rawAmount1 !== '') {
                    // Extract amount, remove commas
                    $amount1 = (float) str_replace(',', '', $rawAmount1);
$this->createAcademicRecord($enrollment->id, $ayId, 1, $yearLevelVal, $heiId, $courseId, $amount1, $seq);                }

                // --- 2nd Semester ---
                $rawAmount2 = trim($row[$map['s2_col']] ?? '');
                if ($rawAmount2 !== '') {
                    $amount2 = (float) str_replace(',', '', $rawAmount2);
                    $this->createAcademicRecord($enrollment->id, $ayId, 2, $yearLevelVal, $heiId, $courseId, $amount2, $seq);
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error("MSRS Import Row Failed: " . $e->getMessage());
            return null;
        }
    }

    private function processAddress($scholar, $row)
    {
        try {
            // Columns: 7=Brgy/Street, 8=Town/City, 9=Province
            $rawBrgy = trim($row[7] ?? '');
            $rawCity = trim($row[8] ?? '');
            $rawProv = trim($row[9] ?? '');

            // 1. Find Province
            $province = Province::where('name', $rawProv)->first();
            $provinceId = $province?->id;

            // 2. Find City
            $city = null;
            if ($provinceId && $rawCity) {
                $city = City::where('name', $rawCity)->where('province_id', $provinceId)->first();
            }
            $cityId = $city?->id;

            // 3. Find or Set Barangay
            $barangayId = null;
            $barangayText = null;

            if ($cityId && $rawBrgy) {
                // Try strict lookup
                $barangay = Barangay::where('city_id', $cityId)
                    ->where('name', $rawBrgy) // Assumes exact match
                    ->first();
                
                if ($barangay) {
                    $barangayId = $barangay->id;
                } else {
                    // FALLBACK: Store as text, do not create
                    $barangayText = $rawBrgy;
                }
            } else {
                 $barangayText = $rawBrgy;
            }

            Address::updateOrCreate(
                ['scholar_id' => $scholar->id],
                [
                    'province_id' => $provinceId,
                    'city_id' => $cityId,
                    'barangay_id' => $barangayId, // Link if found
                    'barangay_text' => $barangayText, // Store raw text if not found
                    'province' => $rawProv, // Fallback text
                    'town_city' => $rawCity, // Fallback text
                    'specific_address' => $rawBrgy, // Full street/brgy text
                    'region' => 'Region IX' 
                ]
            );

        } catch (\Exception $e) {
            // Log but don't stop import
            Log::warning("Address error for scholar {$scholar->id}: " . $e->getMessage());
        }
    }

    // ✅ MODIFIED: Accepts $amount to create Billing Record
    private function createAcademicRecord($enrollmentId, $ayId, $semId, $yearLevel, $heiId, $courseId, $amount = 0)
    {
        $record = AcademicRecord::updateOrCreate(
            [
                'scholar_enrollment_id' => $enrollmentId,
                'academic_year_id' => $ayId,
                'semester_id' => $semId
            ],
            [
                'hei_id' => $heiId,
                'course_id' => $courseId,
                'year_level' => $yearLevel,
                'validation_status' => 'Validated', // Default active
                'grant_amount' => $amount 
            ]
        );

       
        
    }

    private function transformSex($sex) {
        if (!$sex) return null;
        $s = strtoupper(substr(trim($sex), 0, 1));
        return in_array($s, ['M', 'F']) ? $s : null;
    }

    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }
}