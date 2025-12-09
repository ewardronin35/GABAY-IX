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
use App\Models\Program; // <--- Added this to look up Program IDs
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;

class TesProfileImport implements ToModel, WithHeadingRow, WithBatchInserts, SkipsEmptyRows
{
    private $programId;
    private $uploaderId;
    
    // Cache IDs
    private $tesProgramId = null;
    private $tdpProgramId = null;

    private $provinces;
    private $regions;

    public function __construct($programId, $uploaderId)
    {
        $this->programId = $programId;
        $this->uploaderId = $uploaderId;
        
        $this->provinces = Province::pluck('id', 'name')->toArray();
        try {
            $this->regions = Region::pluck('id', 'name')->toArray(); 
        } catch (\Exception $e) {
            $this->regions = []; 
        }

        // Pre-fetch Program IDs
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
        return 1;
    }

  public function model(array $row)
    {
        if (!isset($row['seq']) || !isset($row['last_name'])) {
             return null;
        }

        $seq = trim($row['seq']);

        // ---------------------------------------------------------
        // 1. AUTO-DETECT PROGRAM BASED ON AWARD NUMBER
        // ---------------------------------------------------------
        $finalProgramId = $this->programId; // Default to TES (since this is TesProfileImport)
        
        $awardNo = $row['award_number'] ?? $row['award_no'] ?? '';
        
        if (!empty($awardNo)) {
            $prefix = strtoupper(substr($awardNo, 0, 4)); 
            
            if ($prefix === 'TDP-' && $this->tdpProgramId) {
                $finalProgramId = $this->tdpProgramId; // Switch to TDP
            } elseif ($prefix === 'TES-' && $this->tesProgramId) {
                $finalProgramId = $this->tesProgramId; // Explicitly TES
            }
        }
        // 2. HEI LINKING
        $hei = HEI::where('hei_code', $row['hei_uii'] ?? '')->first();
        if (!$hei && !empty($row['hei_name'])) {
            $hei = HEI::firstOrCreate(
                ['hei_name' => $row['hei_name']],
                ['hei_code' => $row['hei_uii'] ?? null, 'type_of_heis' => $row['type_of_hei'] ?? null]
            );
        }

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
                'contact_no'    => substr($row['contact_no'] ?? $row['contact_number'] ?? '', 0, 20),
            ]
        );

        // --- CAPTURE REPRESENTATIVE ---
        $representative = $row['representative'] ?? $row['endorsed_by'] ?? $row['congressman'] ?? null;

        // 4. PROCESS ADDRESS (Updates District Representative)
        $this->processAddress($scholar, $row, $representative);

        // 5. LOOKUPS
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

        // 6. ENROLLMENT & PROGRAM DETECTION
        $appNo = $row['application_number'] ?? $row['app_no'] ?? $row['application_no'] ?? null;
        $awardNo = $row['award_number'] ?? $row['award_no'] ?? null;

        // --- NEW LOGIC START: DETECT PROGRAM TYPE ---
        $detectedProgramId = $this->programId; // Default to the one passed in MasterlistImport

        if ($awardNo) {
            $prefix = strtoupper(substr($awardNo, 0, 4)); // Get first 4 chars
            
            if ($prefix === 'TES-' && $this->tesProgramId) {
                $detectedProgramId = $this->tesProgramId;
            } elseif ($prefix === 'TDP-' && $this->tdpProgramId) {
                $detectedProgramId = $this->tdpProgramId;
            }
        }
        // --- NEW LOGIC END ---

        $enrollment = ScholarEnrollment::firstOrCreate(
            [
                'scholar_id' => $scholar->id,
               'program_id' => $finalProgramId,
            ],
            [
                'hei_id' => $hei ? $hei->id : null,
                'status' => 'Enrolled',
                'award_number' => $awardNo,
                'academic_year_applied_id' => $acadYearId,
                'application_number' => $appNo, 
            ]
        );

        $enrollment->update([
            'application_number' => $appNo, 
            'award_number' => $awardNo ?? $enrollment->award_number,
            'academic_year_applied_id' => $acadYearId ?? $enrollment->academic_year_applied_id
        ]);

        // 7. COURSE & MAJOR
        $courseId = null;
        $majorId = null;
        
        $degreeString = $row['degree_program'] ?? $row['course'] ?? null;
        if ($degreeString) {
            $parts = preg_split('/ MAJOR IN /i', $degreeString);
            $courseName = trim($parts[0]);

            $course = Course::firstOrCreate(['course_name' => $courseName]);
            $courseId = $course->id;

            if (isset($parts[1])) {
                $majorName = trim($parts[1]);
                $major = Major::firstOrCreate(['major_name' => $majorName]); 
                $majorId = $major->id;
            }
        }

        // 8. ACADEMIC RECORD
        $validationStatus = $row['validation_status'] ?? $row['for_validation'] ?? $row['status_of_validation'] ?? null;

        $record = AcademicRecord::updateOrCreate(
            ['scholar_enrollment_id' => $enrollment->id, 'seq' => $seq],
            [
                'course_id' => $courseId,
                'major_id' => $majorId,
                'academic_year_id' => $acadYearId, 
                'semester_id' => $semesterId,    
                'year_level' => $row['year_level'] ?? null,
                'hei_id' => $hei ? $hei->id : null,
                'batch_no' => $row['award_batch'] ?? $row['batch'] ?? 1,
                'grant_amount' => $row['billing_ammount'] ?? $row['amount_due'] ?? null, 
                'payment_status' => $row['status'] ?? $row['remarks'] ?? null,
                'validation_status' => $validationStatus,
            ]
        );

        // 9. BILLING RECORD
        $amount = $row['billing_ammount'] ?? $row['billing_amount'] ?? $row['amount_due'] ?? null;
        $validatorId = null;
        $validatorName = $row['validated_by'] ?? null;
        
        if (!empty($validatorName) && $validatorName !== '-') {
            $user = User::where('name', 'like', '%' . $validatorName . '%')->first();
            if ($user) $validatorId = $user->id;
        }

        BillingRecord::updateOrCreate(
            ['academic_record_id' => $record->id],
            [
                'billing_amount' => $amount,
                'status' => $row['status'] ?? 'Processed',
                'remarks' => $row['remarks'] ?? null,
                'validated_by_user_id' => $validatorId,
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

    private function processAddress($scholar, $row, $representative)
    {
        // 1. Region
        $regionName = trim($row['region'] ?? '');
        $regionId = null;
        if($regionName) {
            $reg = Region::firstOrCreate(['name' => $regionName]);
            $regionId = $reg->id;
        }

        // 2. Province
        $provName = trim($row['province'] ?? '');
        $provinceId = null;
        if ($provName) {
            $prov = Province::firstOrCreate(
                ['name' => $provName],
                ['region_id' => $regionId]
            );
            $provinceId = $prov->id;
        }

        // 3. City
        $cityName = trim($row['citymunicipality'] ?? $row['city_municipality'] ?? $row['town_city'] ?? '');
        $cityId = null;
        if ($cityName && $provinceId) {
            $city = City::firstOrCreate(
                ['name' => $cityName, 'province_id' => $provinceId], 
                ['name' => $cityName]
            );
            $cityId = $city->id;
        }

        // 4. District
       $districtStr = trim($row['district'] ?? '');
        $districtId = null;
        if ($districtStr && $provinceId) {
            $district = District::firstOrCreate(['name' => $districtStr, 'province_id' => $provinceId], ['name' => $districtStr]);
            
            // STRICT CHECK: Only update if Representative is NOT NULL and NOT EMPTY string
            if (!is_null($representative) && $representative !== '') {
                $district->update(['representative' => $representative]);
            }
            $districtId = $district->id;
        }

        // 5. Barangay
        $brgyName = trim($row['barangay'] ?? '');
        $brgyId = null;

        if (!empty($brgyName) && $cityId) {
            // Uses 'barangay' column name per your DB structure
            $barangay = Barangay::firstOrCreate(
                ['barangay' => $brgyName, 'cityID' => $cityId], 
                ['barangay' => $brgyName] 
            );
            $brgyId = $barangay->barangayID; 
        }

        // --- B. SAVE ADDRESS ---
        Address::updateOrCreate(
            ['scholar_id' => $scholar->id],
            [
                'region_id' => $regionId,
                'province_id' => $provinceId,
                'city_id' => $cityId,
                'district_id' => $districtId,
                'barangay_id' => $brgyId, 
                
                // Fallback Text
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