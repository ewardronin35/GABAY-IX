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
use App\Models\Major;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;

class TdpProfileImport implements ToModel, WithHeadingRow, WithBatchInserts, SkipsEmptyRows
{
    private $programId;
    private $uploaderId;
    private $provinces;
    private $regions;

    public function __construct($programId, $uploaderId)
    {
        $this->programId = $programId;
        $this->uploaderId = $uploaderId;
        // Cache lists for speed
        $this->provinces = Province::pluck('id', 'name')->toArray();
        $this->regions = Region::pluck('id', 'name')->toArray();
    }

    public function headingRow(): int
    {
        return 1;
    }

    public function model(array $row)
    {
        // 1. Critical Data Check
        if (!isset($row['seq']) || !isset($row['last_name'])) {
             return null;
        }

        $seq = trim($row['seq']);

        // 2. HEI LINKING
        $hei = HEI::firstOrCreate(
            ['hei_code' => $row['hei_uii']],
            [
                'hei_name' => $row['hei_name'] ?? 'Unknown HEI',
                'hei_type' => $row['type_of_hei'] ?? null,
            ]
        );

        // 3. SCHOLAR CREATION
        $scholar = Scholar::updateOrCreate(
            ['seq' => $seq],
            [
                'family_name'   => trim($row['last_name']),
                'given_name'    => trim($row['first_name']),
                'middle_name'   => trim($row['middle_name'] ?? ''),
                'extension_name'=> $row['ext_name'] ?? $row['ext'] ?? null,
                'sex'           => $this->transformSex($row['gender'] ?? $row['sex'] ?? null),
                'birthdate'     => isset($row['birthdate']) ? $this->transformDate($row['birthdate']) : null,
                'email_address' => $row['email'] ?? $row['email_address'] ?? null,
                'contact_no'    => $row['contact_no'] ?? $row['contact_number'] ?? null,
            ]
        );

        // 4. PROCESS ADDRESS (Barangay Creation Logic Included)
        $this->processAddress($scholar, $row);

        // 5. LOOKUPS (Academic Year & Semester)
        // FORCE CREATE if missing to ensure ID is never null
        $acadYearId = null;
        if (isset($row['academic_year'])) {
            $ay = AcademicYear::firstOrCreate(['name' => trim($row['academic_year'])]);
            $acadYearId = $ay->id;
        }

        $semesterId = null;
        if (isset($row['semester'])) {
            $sem = Semester::firstOrCreate(['name' => trim($row['semester'])]);
            $semesterId = $sem->id;
        }

        // 6. ENROLLMENT
        $enrollment = ScholarEnrollment::firstOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $this->programId,
            ],
            [
                'hei_id' => $hei->id,
                'award_number' => $row['award_number'] ?? $row['award_no'] ?? null,
                'status' => 'Enrolled',
                'academic_year_applied_id' => $acadYearId 
            ]
        );

        // 7. COURSE & MAJOR
        $courseId = null;
        $majorId = null;
        
        $degreeString = $row['degree_program'] ?? $row['course'] ?? 'Unspecified';

        // Split string: "BS Nursing MAJOR IN Biology" -> ["BS Nursing", "Biology"]
        $parts = preg_split('/ MAJOR IN /i', $degreeString);
        $courseName = trim($parts[0]);

        // A. Handle Course
        $course = Course::firstOrCreate(['course_name' => $courseName]);
        $courseId = $course->id;

        // B. Handle Major (Smart Search)
        if (isset($parts[1])) {
            $majorName = trim($parts[1]);
            // Use LIKE for case-insensitive matching (e.g. "Math" matches "MATH")
            $major = Major::where('major_name', 'LIKE', $majorName)->first();
            
            // Only set ID if found. We respect your rule "Don't Create Majors",
            // but the LIKE search solves the "NULL because of capitalization" issue.
            if ($major) {
                $majorId = $major->id;
            } else {
                Log::warning("Major not found for: {$majorName}");
            }
        }

        // 8. ACADEMIC RECORD
        $record = AcademicRecord::updateOrCreate(
            ['scholar_enrollment_id' => $enrollment->id, 'seq' => $seq],
            [
                'course_id' => $courseId,
                'major_id' => $majorId,
                'academic_year_id' => $acadYearId, 
                'semester_id' => $semesterId,    
                'year_level' => $row['year_level'] ?? null,
                'hei_id' => $hei->id,
                'batch_no' => $row['award_batch'] ?? $row['batch'] ?? 1,
                'grant_amount' => $row['billing_ammount'] ?? $row['amount_due'] ?? null, 
                'payment_status' => $row['status'] ?? $row['remarks'] ?? null,
                'validation_status' => $row['for_validation'] ?? null,
            ]
        );

        // 9. BILLING RECORD
        $amount = $row['billing_ammount'] ?? $row['billing_amount'] ?? $row['amount_due'] ?? null;
        
        // Check for validator user
        $validatorId = null;
        $remarks = $row['remarks'] ?? null;
        if (!empty($row['validated_by']) && $row['validated_by'] !== '-') {
            $user = User::where('name', 'like', '%' . $row['validated_by'] . '%')->first();
            if ($user) {
                $validatorId = $user->id;
            }
        }

        BillingRecord::updateOrCreate(
            ['academic_record_id' => $record->id],
            [
                'billing_amount' => $amount,
                'status' => $row['status'] ?? 'Processed',
                'remarks' => $remarks,
                'validated_by_user_id' => $validatorId,

                // Mapping Dates (Not NULL if data exists)
                'date_fund_request' => $this->transformDate($row['date_of_fund_request'] ?? null),
                'date_sub_aro' => $this->transformDate($row['date_of_sub_aro'] ?? null),
                'date_nta' => $this->transformDate($row['date_of_nta'] ?? null),
                'date_disbursed_hei' => $this->transformDate($row['date_disbursed_to_heis'] ?? null),
                'date_disbursed_grantee' => $this->transformDate($row['date_disbursed_to_grantees'] ?? null),
            ]
        );

        return null; 
    }

    private function transformDate($value)
    {
        if (!$value || $value == '-') return null;
        try {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    private function transformSex($sex)
    {
        if (!$sex) return null;
        $clean = strtoupper(substr(trim($sex), 0, 1));
        return in_array($clean, ['M', 'F']) ? $clean : null;
    }

    private function processAddress($scholar, $row)
    {
        $regionName = trim($row['region'] ?? '');
        $regionId = $this->regions[$regionName] ?? Region::firstOrCreate(['name' => $regionName])->id;

        $provName = trim($row['province'] ?? '');
        $provinceId = null;
        if (!empty($provName)) {
            $provinceId = $this->provinces[$provName] ?? Province::firstOrCreate(['name' => $provName], ['region_id' => $regionId])->id;
        }

        $cityName = trim($row['citymunicipality'] ?? $row['city_municipality'] ?? '');
        $cityId = null;
        if (!empty($cityName) && $provinceId) {
            $city = City::firstOrCreate(
                ['name' => $cityName, 'province_id' => $provinceId], 
                ['name' => $cityName]
            );
            $cityId = $city->id;
        }

        // District Logic
        $districtStr = trim($row['district'] ?? '');
        $districtId = null;
        if (!empty($districtStr) && $provinceId) {
            // Create if matches
            $district = District::firstOrCreate(
                ['name' => $districtStr, 'province_id' => $provinceId],
                ['name' => $districtStr]
            );
            $districtId = $district->id;
        }

        // --- BARANGAY LOGIC (Create New if Not Found) ---
        $brgyName = trim($row['barangay'] ?? '');
        $brgyId = null;

        if (!empty($brgyName) && $cityId) {
            $barangay = Barangay::firstOrCreate(
                ['barangay' => $brgyName, 'cityID' => $cityId], // Search criteria
                ['barangay' => $brgyName]                       // Creation values
            );
            $brgyId = $barangay->barangayID;
        }
        // ------------------------------------------------

        Address::updateOrCreate(
            ['scholar_id' => $scholar->id],
            [
                'region_id' => $regionId,
                'province_id' => $provinceId,
                'city_id' => $cityId,
                'district_id' => $districtId,
                'barangay_id' => $brgyId, // Will NOT be null now if name existed in Excel
                
                'region' => $regionName,
                'province' => $provName,
                'town_city' => $cityName,
                'congressional_district' => $districtStr,
                'barangay' => $brgyName,
                'zip_code' => $row['zip_code'] ?? null,
                'specific_address' => $row['specific_address'] ?? $row['street'] ?? null,
            ]
        );
    }

    public function batchSize(): int
    {
        return 500;
    }
    
    public function chunkSize(): int
    {
        return 500;
    }
}