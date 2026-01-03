<?php

namespace App\Imports;

use App\Models\AcademicRecord;
use App\Models\AcademicYear;
use App\Models\Address;
use App\Models\City;
use App\Models\Course;
use App\Models\District;
use App\Models\HEI;
use App\Models\Program;
use App\Models\Province;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Semester;
use App\Models\BillingRecord;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas; 

class StuFapsImport implements ToCollection, WithHeadingRow, WithChunkReading, ShouldQueue, WithCalculatedFormulas
{
    private $programId;
    private $userId;

    // ✅ MANUAL MAPPING for Stubborn HEIs
    // Key: Excel Value (Upper), Value: DB Search Keyword
    private $heiCorrections = [
        'DMC COLLEGE FOUNDATION' => 'DIPOLOG MEDICAL CENTER',
        'DIPOLOG MEDICAL COLLEGE' => 'DIPOLOG MEDICAL CENTER',
        'DR. AUROLELIO MENDOZA' => 'DR. AURELIO MENDOZA', // Typo fix
        'MSU-IIT' => 'ILIGAN INSTITUTE OF TECHNOLOGY',
        'MSU-TCTO' => 'TAWI-TAWI COLLEGE OF TECHNOLOGY',
        'SAINT JOSEPH COLLEGE OF SINDANGAN' => 'SAINT JOSEPH COLLEGE OF SINDANGAN',
        'WESTERN MINDANAO STATE UNIVERSITY' => 'WESTERN MINDANAO STATE UNIVERSITY',
        'OUR LADY OF TRIUMPH' => 'OUR LADY OF TRIUMPH',
        'LICEO DE CAGAYAN' => 'LICEO DE CAGAYAN',
        'XAVIER UNIVERSITY' => 'XAVIER UNIVERSITY'
    ];

    public function __construct($userId)
    {
        $this->userId = $userId;
        $program = Program::firstOrCreate(['program_name' => 'StuFAPs']);
        $this->programId = $program->id;
    }

    public function headingRow(): int
    {
        return 7;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
        Log::info("StuFaps Queue: Starting chunk of " . $rows->count() . " rows.");

        foreach ($rows as $row) {
            $regionCheck = strtoupper($row['region'] ?? '');
            if (in_array($regionCheck, ['PREPARED:', 'REVIEWED:', 'NOTED:', 'APPROVED:']) || empty($row['region'])) {
                continue; 
            }

            if (empty($row['award_number']) && empty($row['lastname'])) {
                continue;
            }

            try {
                // --- PREPARE DATA ---
                $amountRaw = $row['remarks'] ?? 0;
                $amount = $this->cleanAmount($amountRaw);
                $lastName = $this->cleanText($row['lastname']);
                $firstName = $this->cleanText($row['firstname']);
                $awardNo = $row['award_number']; 
                
                $sexRaw = $this->cleanText($row['sex']);
                $sex = $sexRaw ? strtoupper(substr($sexRaw, 0, 1)) : null;

                // Find Code
                $scholarshipCode = $this->findScholarshipCode($row);

                if (!$lastName || !$firstName) continue;

                // --- LOCATIONS ---
                $provinceId = null;
                $provName = $this->cleanText($row['province']);
                if ($provName) {
                    $prov = Province::firstOrCreate(['name' => $provName]);
                    $provinceId = $prov->id;
                }

                $cityId = null;
                $cityName = $this->cleanText($row['townmunicipality']);
                if ($cityName) {
                    $cQuery = City::where('name', $cityName);
                    if ($provinceId) $cQuery->where('province_id', $provinceId);
                    $city = $cQuery->first() ?? City::create(['name' => $cityName, 'province_id' => $provinceId]);
                    $cityId = $city->id;
                }

                $districtId = null;
                $distName = $this->cleanText($row['dist']);
                if ($distName && $provinceId) {
                    $distModel = District::firstOrCreate(
                        ['name' => $distName, 'province_id' => $provinceId],
                        ['name' => $distName]
                    );
                    $districtId = $distModel->id;
                }

                // --- SCHOLAR ---
                $scholar = Scholar::updateOrCreate(
                    [
                        'family_name' => $lastName,
                        'given_name' => $firstName,
                        'middle_name' => $this->cleanText($row['middlename']),
                    ],
                    [
                        'extension_name' => $this->cleanText($row['ext']),
                        'sex' => $sex,
                    ]
                );

                $this->processAddress($scholar, $row, $provinceId, $cityId, $districtId);

                // --- ENROLLMENT ---
                $enrollment = ScholarEnrollment::updateOrCreate(
                    [
                        'scholar_id' => $scholar->id, 
                        'program_id' => $this->programId
                    ],
                    [
                        'award_number' => $awardNo, 
                        'status' => 'Enrolled',
                        'scholarship_type' => $scholarshipCode 
                    ]
                );

                // --- HEI LOOKUP (V4) ---
                $heiId = null;
                $heiName = $this->cleanText($row['hei']);
                
                if ($heiName) {
                    $heiId = $this->findHeiRobust($heiName);
                    
                    if ($heiId) {
                        $enrollment->update(['hei_id' => $heiId]);
                    } else {
                        Log::warning("StuFaps Import: HEI '$heiName' not found for $lastName. (ID: {$scholar->id})");
                    }
                }

                // --- COURSE LOOKUP (V4) ---
                $courseId = null;
                $courseName = $this->cleanText($row['program']);
                
                if ($courseName) {
                    $courseId = $this->findCourseRobust($courseName);
                    
                    if (!$courseId) {
                        Log::warning("StuFaps Import: Course '$courseName' not found for $lastName. (ID: {$scholar->id})");
                    }
                }

                // --- ACADEMIC RECORD ---
                $ayName = $row['award_year'] ?? date('Y');
                $ay = AcademicYear::where('name', $ayName)->orWhere('name', 'LIKE', "$ayName-%")->first();
                if (!$ay) $ay = AcademicYear::firstOrCreate(['name' => $ayName]);

                $sem = Semester::where('name', '1st Semester')->first();
                if (!$sem) $sem = Semester::firstOrCreate(['name' => '1st Semester']);

                $record = AcademicRecord::updateOrCreate(
                    [
                        'scholar_enrollment_id' => $enrollment->id,
                        'academic_year_id' => $ay->id,
                        'semester_id' => $sem->id,
                    ],
                    [
                        'hei_id' => $heiId,
                        'course_id' => $courseId,
                        'year_level' => $this->cleanText($row['curr_year']),
                        'grant_amount' => $amount,
                    ]
                );

                $record->billingRecord()->updateOrCreate(
                    ['academic_record_id' => $record->id],
                    [
                        'billing_amount' => $amount,
                        'status' => 'Pending',
                        'validated_by_user_id' => $this->userId,
                    ]
                );

                Log::info("StuFaps Import: Imported {$lastName}, {$firstName} (Code: {$scholarshipCode})");

            } catch (\Exception $e) {
                Log::error("StuFaps Import Failed Row: " . $e->getMessage() . " | Data: " . json_encode($row));
                continue;
            }
        }
    }

    /**
     * V4 HEI Search with Manual Mapping
     */
    private function findHeiRobust($heiName)
    {
        $search = strtoupper(trim($heiName));

        // 1. Check Manual Mapping First
        foreach ($this->heiCorrections as $key => $correctVal) {
            if (str_contains($search, $key)) {
                // If mapping found, search by the corrected value
                $hei = HEI::where('hei_name', 'LIKE', "%{$correctVal}%")->first();
                if ($hei) return $hei->id;
            }
        }

        // 2. Exact Match (Case Insensitive)
        $hei = HEI::whereRaw('UPPER(hei_name) = ?', [$search])->first();
        if ($hei) return $hei->id;

        // 3. Normalized "Saint"
        $normalized = str_replace(['ST.', 'ST '], 'SAINT ', $search);
        $hei = HEI::whereRaw('UPPER(hei_name) = ?', [$normalized])->first();
        if ($hei) return $hei->id;

        // 4. Remove Inc/Corp & Punctuation
        $cleanName = preg_replace('/[,.]?\s*(INCORPORATED|INC\.?|CORPORATION|CORP\.?|FOUNDATION|FDN\.?)\b/i', '', $heiName);
        $cleanName = trim($cleanName);
        
        // Match cleaned
        if (strlen($cleanName) > 5) {
            $hei = HEI::where('hei_name', 'LIKE', "%{$cleanName}%")->first();
            if ($hei) return $hei->id;
        }

        // 5. Split by hyphen ("Xavier University - Ateneo") -> Search "Xavier University"
        if (str_contains($heiName, '-')) {
            $parts = explode('-', $heiName);
            $firstPart = trim($parts[0]);
            // Clean first part too
            $firstPartClean = preg_replace('/[,.]?\s*(INCORPORATED|INC\.?|CORPORATION|CORP\.?)\b/i', '', $firstPart);
            $firstPartClean = trim($firstPartClean);

            if (strlen($firstPartClean) > 3) {
                $hei = HEI::where('hei_name', 'LIKE', "%{$firstPartClean}%")->first();
                if ($hei) return $hei->id;
            }
        }

        return null;
    }

    /**
     * V4 Course Search with Expansion
     */
    private function findCourseRobust($courseName)
    {
        $courseName = trim($courseName);
        $search = strtoupper($courseName);

        // 1. Direct Match
        $course = Course::whereRaw('UPPER(course_name) = ?', [$search])->first();
        if ($course) return $course->id;

        // 2. Special Case: BS EDUCATION-[MAJOR]
        if (str_contains($search, 'BS EDUCATION-') || str_contains($search, 'BS EDUCATION -')) {
            $major = trim(substr($search, strpos($search, '-') + 1));
            $tryEd = "Bachelor of Secondary Education Major in " . $major;
            
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($tryEd)])->first();
            if ($course) return $course->id;

            // Try Elementary if Secondary fails
            $tryEdElem = "Bachelor of Elementary Education Major in " . $major;
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($tryEdElem)])->first();
            if ($course) return $course->id;
        }

        // 3. "BS [COURSE]" (No "IN") -> "Bachelor of Science in [COURSE]"
        if (preg_match('/^BS\s+(?!IN\s)/i', $courseName)) {
            $expanded = preg_replace('/^BS\s+/i', 'Bachelor of Science in ', $courseName);
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($expanded)])->first();
            if ($course) return $course->id;
        }

        // 4. "BS IN [COURSE]" -> "Bachelor of Science in [COURSE]"
        if (preg_match('/^BS\s+IN\s+/i', $courseName)) {
            $expanded = preg_replace('/^BS\s+IN\s+/i', 'Bachelor of Science in ', $courseName);
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($expanded)])->first();
            if ($course) return $course->id;
        }

        // 5. "AB [COURSE]" -> "Bachelor of Arts in [COURSE]"
        if (preg_match('/^AB\s+/i', $courseName)) {
            $expanded = preg_replace('/^AB\s+/i', 'Bachelor of Arts in ', $courseName);
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($expanded)])->first();
            if ($course) return $course->id;
        }

        // 6. Fallbacks
        $fallbacks = [
            "Bachelor of " . $courseName,
            "Bachelor of Science in " . $courseName,
            str_replace('DOCTOR IN', 'Doctor of', $courseName)
        ];

        foreach($fallbacks as $fb) {
            $course = Course::whereRaw('UPPER(course_name) = ?', [strtoupper($fb)])->first();
            if ($course) return $course->id;
        }

        return null;
    }

    private function findScholarshipCode($row)
    {
        // 1. Direct Keys
        if (!empty($row['scholarship_code'])) return $row['scholarship_code'];
        if (!empty($row['scholarship'])) return $row['scholarship'];
        if (!empty($row['code'])) return $row['code'];
        
        // 2. Robust Search for "scholarship" + "code"
        foreach ($row as $key => $value) {
            $cleanKey = str_replace(['_', ' ', "\n", "\r"], '', strtolower($key));
            if (str_contains($cleanKey, 'scholarship') && str_contains($cleanKey, 'code')) {
                return $value;
            }
        }
        return null;
    }

    private function processAddress($scholar, $row, $provinceId, $cityId, $districtId)
    {
        try {
            $rawBrgy = $this->cleanText($row['brgy']); 
            $rawCity = $this->cleanText($row['townmunicipality']);
            $rawProv = $this->cleanText($row['province']);
            $distName = $this->cleanText($row['dist']);

            Address::updateOrCreate(
                ['scholar_id' => $scholar->id],
                [
                    'province_id' => $provinceId,
                    'city_id' => $cityId,
                    'district_id' => $districtId,
                    'barangay_id' => null, 
                    'specific_address' => $rawBrgy, 
                    'province' => $rawProv,
                    'town_city' => $rawCity,
                    'barangay' => $rawBrgy,
                    'barangay_text' => $rawBrgy,
                    'congressional_district' => $distName,
                    'region' => 'Region IX'
                ]
            );
        } catch (\Exception $e) {
            Log::warning("Address error for scholar {$scholar->id}: " . $e->getMessage());
        }
    }

    private function cleanAmount($val)
    {
        if (!$val) return 0;
        $clean = str_replace(['P', ',', ' ', '₱'], '', $val);
        return is_numeric($clean) ? (float) $clean : 0;
    }

    private function cleanText($val)
    {
        return $val ? trim($val) : null;
    }
}