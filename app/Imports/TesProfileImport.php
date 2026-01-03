<?php

namespace App\Imports;

use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\Address;
use App\Models\AcademicRecord;
use App\Models\BillingRecord;
use App\Models\HEI;
use App\Models\Region;
use App\Models\Province;
use App\Models\City;
use App\Models\Barangay;
use App\Models\District;
use App\Models\Course;
use App\Models\Major; // Added Major Model
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\User;
use App\Models\Program;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TesProfileImport implements ToModel, WithHeadingRow, WithBatchInserts, SkipsEmptyRows
{
    private $programId;
    private $uploaderId;
    
    // Cache for IDs
    private $tesProgramId = null;
    private $tdpProgramId = null;

    // Reporting
    public $skippedStudents = [];
    public $importedCount = 0;

    public function __construct($programId, $uploaderId)
    {
        $this->programId = $programId;
        $this->uploaderId = $uploaderId;

        try {
            $tes = Program::where('program_name', 'like', '%TES%')->first();
            $this->tesProgramId = $tes ? $tes->id : null;

            $tdp = Program::where('program_name', 'like', '%TDP%')->first();
            $this->tdpProgramId = $tdp ? $tdp->id : null;
        } catch (\Exception $e) {
            Log::error("Program Lookup Error: " . $e->getMessage());
        }
    }

    public function headingRow(): int
    {
        return 2;
    }

    public function model(array $row)
    {
        // 1. Basic Validation
        if (empty($row['last_name']) || empty($row['first_name'])) {
             return null;
        }

        $seq = isset($row['seq']) ? trim((string)$row['seq']) : null;

        // ---------------------------------------------------------
        // 2. IDENTIFY SCHOLAR (Name Match + Email Sanitization)
        // ---------------------------------------------------------
        $firstName  = strtoupper(trim($row['first_name']));
        $lastName   = strtoupper(trim($row['last_name']));
        $middleName = strtoupper(trim($row['middle_name'] ?? ''));
        $extName    = $row['ext_name'] ?? null;

        // Sanitize Email
        $rawEmail = trim($row['email_add'] ?? $row['email'] ?? '');
        $email = $this->isValidEmail($rawEmail) ? $rawEmail : null;

        // A. Find Existing
        $scholar = Scholar::where('given_name', $firstName)
            ->where('family_name', $lastName)
            ->where('middle_name', $middleName)
            ->first();

        // B. Check Email Conflict
        if ($email) {
            $emailTaken = Scholar::where('email_address', $email)
                ->when($scholar, fn($q) => $q->where('id', '!=', $scholar->id))
                ->exists();
            if ($emailTaken) $email = null; // Skip email update if taken
        }

        // C. Create/Update
        if (!$scholar) {
            $scholar = new Scholar();
            $scholar->given_name  = $firstName;
            $scholar->family_name = $lastName;
            $scholar->middle_name = $middleName;
        }

        $scholar->extension_name = $extName;
        if ($email) $scholar->email_address = $email;
        
        $scholar->sex        = $this->transformSex($row['sex'] ?? null);
        $scholar->contact_no = substr($row['contact_no'] ?? '', 0, 20);
        $scholar->is_pwd     = strtolower($row['pwd'] ?? '') === 'yes';
        $scholar->disability = $row['disability'] ?? null;
        $scholar->save();

        // ---------------------------------------------------------
        // 3. AUTO-DETECT PROGRAM
        // ---------------------------------------------------------
        $finalProgramId = $this->programId;
        $awardNo = $row['award_no'] ?? null;
        
        if (!empty($awardNo)) {
            $prefix = strtoupper(substr($awardNo, 0, 3)); 
            if ($prefix === 'TDP' && $this->tdpProgramId) {
                $finalProgramId = $this->tdpProgramId;
            } elseif ($prefix === 'TES' && $this->tesProgramId) {
                $finalProgramId = $this->tesProgramId;
            }
        }

        // ---------------------------------------------------------
        // 4. HEI LINKING (Strict Lookup - No Creation)
        // ---------------------------------------------------------
        $heiId = null;
        if (!empty($row['hei_name'])) {
            $heiName = trim($row['hei_name']);
            // Only find existing HEI, do not create
            $heiId = HEI::where('hei_name', $heiName)->value('id');
        }

        // ---------------------------------------------------------
        // 5. PROCESS ADDRESS (Strict Lookup - No Creation)
        // ---------------------------------------------------------
        $this->processAddress($scholar, $row);

        // ---------------------------------------------------------
        // 6. LOOKUPS (Year & Sem) - STRICT
        // ---------------------------------------------------------
        $acadYearId = null;
        if (isset($row['academic_year'])) {
            $ayName = trim($row['academic_year']);
            $acadYearId = AcademicYear::where('name', $ayName)->value('id');
        }

        $semesterId = null;
        if (!empty($row['semester'])) {
            $semName = trim($row['semester']);
            if ($semName !== '') {
                $semesterId = Semester::where('name', $semName)->value('id');
                // Fallback Mapping
                if (!$semesterId) {
                    if (stripos($semName, '1st') !== false) {
                        $semesterId = Semester::where('name', '1st Semester')->value('id');
                    } elseif (stripos($semName, '2nd') !== false) {
                        $semesterId = Semester::where('name', '2nd Semester')->value('id');
                    } elseif (stripos($semName, 'Sum') !== false || stripos($semName, 'Mid') !== false) {
                        $semesterId = Semester::where('name', 'Summer')->value('id');
                    }
                }
            }
        }
        
        // ---------------------------------------------------------
        // 7. ENROLLMENT
        // ---------------------------------------------------------
        $appNo = $row['app_id'] ?? null;

        $enrollment = ScholarEnrollment::firstOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $finalProgramId,
            ],
            [
                'hei_id' => $heiId,
                'status' => 'Enrolled',
                'award_number' => $awardNo,
                'academic_year_applied_id' => $acadYearId,
                'application_number' => $appNo, 
            ]
        );

        $enrollment->update([
            'application_number' => $appNo ?? $enrollment->application_number, 
            'award_number' => $awardNo ?? $enrollment->award_number,
            'hei_id' => $heiId ?? $enrollment->hei_id
        ]);

        // ---------------------------------------------------------
        // 8. COURSE & MAJOR (SMART PARSING)
        // ---------------------------------------------------------
        $courseId = null;
        $majorId = null;
        $rawCourse = $row['courseprogram_enrolled'] ?? null;

        if ($rawCourse) {
            // A. Separate Course from Major
            $parsed = $this->parseCourseAndMajor($rawCourse);

            // B. Find Course ID (Using the cleaner Logic)
            $courseId = $this->findCourseId($parsed['courseName']);

            // C. Find Major ID (If extracted)
            if ($parsed['majorName']) {
                $majorId = Major::where('major_name', $parsed['majorName'])->value('id');
            }
            
            // D. Fallback: If no ID found by split, try finding ID using the whole original string
            if (!$courseId) {
                $courseId = $this->findCourseId($rawCourse);
            }
        }

        // ---------------------------------------------------------
        // 9. ACADEMIC RECORD
        // ---------------------------------------------------------
        $validatorName = $row['verified_by'] ?? $row['validated_by'] ?? null;
        $validationStatus = !empty($validatorName) ? 'Validated' : ($row['status'] ?? 'Pending');

        $record = AcademicRecord::updateOrCreate(
            ['scholar_enrollment_id' => $enrollment->id, 'seq' => $seq],
            [
                'course_id' => $courseId,
                'major_id'  => $majorId, // ✅ SAVING MAJOR ID HERE
                'academic_year_id' => $acadYearId, 
                'semester_id' => $semesterId,    
                'year_level' => $row['year_level'] ?? null,
                'hei_id' => $heiId,
                'batch_no' => $row['batch'] ?? null,
                'student_id' => $row['student_id'] ?? null,
                
                'eligibility_equivalent' => 0.5, 
                
                'validation_status' => $validationStatus,
                'remarks' => $row['remarks'] ?? null,
            ]
        );

        $this->importedCount++;

        // ---------------------------------------------------------
        // 10. BILLING RECORD
        // ---------------------------------------------------------
        $validatorId = null;
        if (!empty($validatorName) && $validatorName !== '-') {
            $user = User::where('name', 'like', '%' . trim($validatorName) . '%')->first();
            if ($user) $validatorId = $user->id;
        }

        BillingRecord::updateOrCreate(
            ['academic_record_id' => $record->id],
            [
                'validated_by_user_id' => $validatorId,
                'status' => $validatorId ? 'Validated' : 'Processed', 
            ]
        );

        return null;
    }

    /**
     * Helper: Split "BSBA Major in Marketing" into ["BSBA", "Marketing"]
     */
    private function parseCourseAndMajor($rawName)
    {
        $clean = strtoupper(trim($rawName));
        $clean = preg_replace('/\s+/', ' ', $clean);

        // Check for specific splitters
        $majorName = null;
        $courseName = $clean;

        if (str_contains($clean, ' MAJOR IN ')) {
            $parts = explode(' MAJOR IN ', $clean);
            $courseName = trim($parts[0]);
            $majorName = trim($parts[1] ?? '');
        } elseif (str_contains($clean, ' SPECIALIZATION IN ')) {
            $parts = explode(' SPECIALIZATION IN ', $clean);
            $courseName = trim($parts[0]);
            $majorName = trim($parts[1] ?? '');
        }

        return ['courseName' => $courseName, 'majorName' => $majorName];
    }

    /**
     * Helper: Smart Course Finder
     */
    private function findCourseId($rawName)
    {
        if (!$rawName) return null;
        $clean = strtoupper(trim($rawName));

        // 1. Try Exact Match (Name or Abbreviation)
        $course = Course::where('course_name', $clean)
            ->orWhere('abbreviation', $clean)
            ->first();
        if ($course) return $course->id;

        // 2. Try replacing "MAJOR IN" with "IN" (Common CHED format)
        // e.g. CSV: "Bachelor of Arts Major in English" -> DB: "Bachelor of Arts in English"
        $normalized = str_replace(' MAJOR IN ', ' IN ', $clean);
        $course = Course::where('course_name', $normalized)->first();
        if ($course) return $course->id;

        // 3. Try Abbreviations Expansion
        if (str_starts_with($normalized, 'BS ')) {
            $expanded = 'BACHELOR OF SCIENCE IN ' . substr($normalized, 3);
            $course = Course::where('course_name', $expanded)->first();
            if ($course) return $course->id;
        }
        if (str_starts_with($normalized, 'BA ')) {
            $expanded = 'BACHELOR OF ARTS IN ' . substr($normalized, 3);
            $course = Course::where('course_name', $expanded)->first();
            if ($course) return $course->id;
        }

        return null;
    }

    private function isValidEmail($email)
    {
        $invalid = ['0', 'N.A@GMAIL.COM', 'NA@GMAIL.COM', 'N/A', 'NONE', 'NA', '-', 'NULL', 'NO EMAIL'];
        return filter_var($email, FILTER_VALIDATE_EMAIL) && !in_array(strtoupper($email), $invalid);
    }

    private function transformSex($sex)
    {
        if (!$sex) return null;
        $clean = strtoupper(substr(trim($sex), 0, 1));
        return in_array($clean, ['M', 'F']) ? $clean : null;
    }

    private function processAddress($scholar, $row)
    {
        // Inputs
        $regionName = trim($row['region'] ?? '');
        $provName = trim($row['province'] ?? $row['hei_province'] ?? '');
        $cityName = trim($row['city'] ?? $row['hei_citymunicipality'] ?? '');
        $districtStr = trim($row['hei_district'] ?? '');
        $brgyName = trim($row['barangay'] ?? '');

        // 1. Region
        $regionId = Region::where('name', $regionName)->value('id');

        // 2. Province
        $provinceId = Province::where('name', $provName)->value('id');

        // 3. City (Depends on Province)
        $cityId = null;
        if ($cityName && $provinceId) {
            $cityId = City::where('name', $cityName)
                          ->where('province_id', $provinceId)
                          ->value('id');
        }

        // 4. District (Depends on Province)
        $districtId = null;
        if ($districtStr && $provinceId) {
             $districtId = District::where('name', $districtStr)
                                   ->where('province_id', $provinceId)
                                   ->value('id');
        }

        // 5. Barangay (Depends on City)
        $brgyId = null;
        if ($brgyName && $cityId) {
             $brgyId = Barangay::where('barangay', $brgyName)
                               ->where('cityID', $cityId)
                               ->value('id'); 
        }

        // Save Address
        Address::updateOrCreate(
            ['scholar_id' => $scholar->id],
            [
                'region_id' => $regionId,
                'province_id' => $provinceId,
                'city_id' => $cityId,
                'district_id' => $districtId,
                'barangay_id' => $brgyId, 
                
                'region' => $regionName,
                'province' => $provName,
                'town_city' => $cityName,
                'congressional_district' => $districtStr,
                'barangay' => $brgyName, 
                
                'zip_code' => $row['zipcode'] ?? null, 
                'specific_address' => $row['address'] ?? null,
            ]
        );
    }

    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }
}