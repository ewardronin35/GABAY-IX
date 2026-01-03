<?php

namespace App\Imports;

use App\Models\Address;
use App\Models\HEI;
use App\Models\Course;
use App\Models\Program;
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\ScholarRelative;
use App\Models\ScholarApplicationDocument;
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

class CmspImport implements ToCollection, WithHeadingRow, WithChunkReading, ShouldQueue
{
    private $programId;
    private $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
        $program = Program::firstOrCreate(['program_name' => 'CMSP']);
        $this->programId = $program->id;
    }

    public function headingRow(): int
    {
        return 6;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
$importedCount = 0;
        $created = 0;
        $updated = 0;        
        // Cache Academic Years to avoid repeated queries
        $ayCache = AcademicYear::pluck('id', 'name')->toArray();

        foreach ($rows as $row) {
            try {
                // 0. SKIP EMPTY ROWS
                if (empty($row['lname']) && empty($row['fname'])) {
                    continue;
                }

                // =========================================================
                // 1. SCHOLAR (Find or Create)
                // =========================================================
               $lrn = $this->clean($row['lrn']);
                $fname = $this->clean($row['fname']);
                $lname = $this->clean($row['lname']);
                
                $scholar = null;

                // FIX: Only search by LRN if it exists to avoid merging all nulls
                if ($lrn) {
                    $scholar = Scholar::where('lrn', $lrn)->first();
                }

                // If no LRN match (or no LRN provided), strict search by Name
                if (!$scholar) {
                    $scholar = Scholar::where('given_name', $fname)
                        ->where('family_name', $lname)
                        ->first();
                }

                if (!$scholar) {
                    $scholar = new Scholar();
                    // $scholar->user_id = $this->userId; 
                    $created++;
                } else {
                    $updated++;
                }

                $scholar->given_name = $fname;
                $scholar->family_name = $lname;
                $scholar->middle_name = $this->clean($row['mname']);
                $scholar->extension_name = $this->clean($row['name_ext']);
                $scholar->sex = $this->parseSex($row['sex']);
                $scholar->civil_status = $this->clean($row['civil_status']);
                $scholar->date_of_birth = $this->parseDate($row['bdate']);
                $scholar->birth_place = $this->clean($row['bplace']);
                $scholar->email_address = $this->clean($row['email']);
                $scholar->contact_no = $this->clean($row['contact']);
                $scholar->facebook_account = $this->clean($row['fb_account']);
                $scholar->lrn = $lrn;
                $scholar->high_school = $this->clean($row['highschool']);
                
                $scholar->siblings_count = (int) $this->clean($row['no_siblings']);
                $scholar->is_4ps_beneficiary = $this->parseBool($row['is_4ps']);
                
                $ethnicGroup = $this->clean($row['ethnic']);
                $scholar->is_ip = ($ethnicGroup && $ethnicGroup !== 'N/A') ? 'Yes' : 'No';
                $scholar->indigenous_group = $ethnicGroup;
                
                $scholar->disability = $this->clean($row['disability']);
                $scholar->is_pwd = ($scholar->disability && $scholar->disability !== 'N/A') ? 'Yes' : 'No';
                
                $scholar->is_solo_parent = $this->parseBool($row['is_single_parent']) ? 'Yes' : 'No';
                $scholar->family_income = $this->cleanMoney($row['income']);

                $scholar->save();

                // =========================================================
                // 2. ADDRESS
                // =========================================================
                $address = Address::firstOrNew(['scholar_id' => $scholar->id]);
                $address->town_city = $this->clean($row['town']);
                $address->province = $this->clean($row['province']);
                $address->specific_address = $this->clean($row['street']); 
                $address->zip_code = $this->clean($row['zip_code']);
                $address->region_name = $this->clean($row['region']); 
                $address->district_no = $this->clean($row['dist']);
                $address->save();

                // =========================================================
                // 3. RELATIVES
                // =========================================================
                $fNameCombined = $this->combineName($row['f_name'], $row['f_lname'], $row['f_mname'], $row['f_ename']);
                $this->saveRelative($scholar->id, 'FATHER', [
                    'name'    => $fNameCombined,
                    'occu'    => $row['f_occu'] ?? null,
                    'addr'    => $row['f_address'] ?? null,
                    'educ'    => $row['f_educ'] ?? null,
                    'living'  => $row['f_is_living'] ?? null
                ]);

                $mNameCombined = $this->combineName($row['m_name'], $row['m_lname'], $row['m_mname'], null);
                $this->saveRelative($scholar->id, 'MOTHER', [
                    'name'    => $mNameCombined,
                    'occu'    => $row['m_occu'] ?? null,
                    'addr'    => $row['m_address'] ?? null,
                    'educ'    => $row['m_educ'] ?? null,
                    'living'  => $row['m_is_living'] ?? null
                ]);

                // =========================================================
                // 4. ENROLLMENT (Main Program Record)
                // =========================================================
                $heiName = $this->clean($row['intended_school']);
                $hei = null;

                if ($heiName) {
  $hei = HEI::where('hei_name', 'LIKE', trim($heiName))->first();
    
    // ✅ ADD THIS BLOCK: Log missing schools
    if (!$hei) {
        Log::warning("HEI Not Found in Database: '{$heiName}' for Student: {$row['last_name']}. Please add this HEI to the system.");
    }
}
                // Points Logic
                $gPoints = $this->cleanDecimal($row['g_points']);
                $iPoints = $this->cleanDecimal($row['i_points']);
                $tPoints = $this->cleanDecimal($row['t_points']);
                if ($tPoints == 0 && ($gPoints > 0 || $iPoints > 0)) {
                    $tPoints = $gPoints + $iPoints;
                }

                $enrollment = ScholarEnrollment::updateOrCreate(
                    [
                        'scholar_id' => $scholar->id,
                        'program_id' => $this->programId,
                    ],
                    [
                        'hei_id' => $hei ? $hei->id : null,
                        'school_type' => $this->clean($row['school_type']), 
                        'entry_date' => $this->parseDate($row['entry_date']),
                        'application_date' => $this->parseDate($row['app_date']),
                        'academic_year_applied' => $this->clean($row['app_year']),
                        'application_type' => $this->clean($row['app_type']),
                        'scholarship_type' => $this->clean($row['scholarship']),
                        'gwa' => $this->cleanGrade($row['grade']),
                        'grade_points' => $gPoints,
                        'income_points' => $iPoints,
                        'total_points' => $tPoints, 
                        'qualified_scholarships' => $this->clean($row['q_scholarships']),
                        'status' => 'Enrolled' 
                    ]
                );

                // =========================================================
                // 5. DOCUMENTS
                // =========================================================
                $docMap = [
                    'proof_income' => 'INCOME_PROOF',
                    'gm_cert'      => 'GOOD_MORAL',
                    'sp_cert'      => 'SOLO_PARENT_CERT',
                    'ip_cert'      => 'IP_CERT',
                    'pwd_cert'     => 'PWD_CERT',
                    'aff_guard'    => 'GUARDIAN_AFFIDAVIT',
                ];

                foreach ($docMap as $excelCol => $docType) {
                    $hasDoc = $this->hasDoc($row[$excelCol] ?? null);
                    ScholarApplicationDocument::updateOrCreate(
                        ['scholar_enrollment_id' => $enrollment->id, 'document_type' => $docType],
                        ['is_submitted' => $hasDoc]
                    );
                }

                // =========================================================
                // 6. ACADEMIC RECORD (Dynamic History)
                // =========================================================
                $excelAy = $this->clean($row['a_year']) ?? $this->clean($row['app_year']);
                $ayId = null;

                if ($excelAy) {
                    if (isset($ayCache[$excelAy])) {
                        $ayId = $ayCache[$excelAy];
                    } else {
                        $newAy = AcademicYear::firstOrCreate(['name' => $excelAy]);
                        $ayId = $newAy->id;
                        $ayCache[$excelAy] = $ayId;
                    }
                }

                if ($ayId && (!empty($row['c_year']) || !empty($row['course']))) {
                    $courseName = $this->clean($row['course']);
                    $course = Course::where('course_name', 'LIKE', "%{$courseName}%")->first();
                    
                    AcademicRecord::updateOrCreate(
                        [
                            'scholar_enrollment_id' => $enrollment->id,
                            'academic_year_id' => $ayId, // Dynamic
                            'semester_id' => 1, 
                        ],
                        [
                            'year_level' => $this->parseYearLevel($row['c_year']),
                            'gwa' => $this->cleanGrade($row['grade']),
                            'hei_id' => $hei ? $hei->id : null,
                            'course_id' => $course ? $course->id : null, 
                        ]
                    );
                }

                $importedCount++;

            } catch (\Exception $e) {
                Log::error("CMSP Import Failed for Row: " . json_encode($row) . " | Error: " . $e->getMessage());
            }
        }

        // Log Final Count
        $totalScholars = ScholarEnrollment::where('program_id', $this->programId)->count();
        Log::info("CMSP Import Chunk Processed: {$importedCount}. Total DB: {$totalScholars}");
    }

    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================

    private function saveRelative($scholarId, $type, $data)
    {
        if (empty($data['name'])) return;

        ScholarRelative::updateOrCreate(
            ['scholar_id' => $scholarId, 'relationship_type' => $type],
            [
                'full_name' => $data['name'],
                'occupation' => $this->clean($data['occu']),
                'address' => $this->clean($data['addr']),
                'educational_attainment' => $this->clean($data['educ']),
                'is_living' => $this->parseLivingStatus($data['living'])
            ]
        );
    }

    private function clean($val)
    {
        if (is_string($val)) {
            $val = trim($val);
            if ($val === '' || $val === 'N/A' || $val === '-') return null;
        }
        return $val;
    }

    private function combineName($f, $l, $m, $e = null)
    {
        $parts = array_filter([$f, $m, $l, $e], fn($x) => !empty($x));
        $name = implode(' ', $parts);
        return empty($name) ? null : trim($name);
    }

    private function parseDate($val)
    {
        if (!$val || $val === 'N/A') return null;
        try {
            if (is_numeric($val)) {
                return Date::excelToDateTimeObject($val)->format('Y-m-d');
            }
            return Carbon::parse($val)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseSex($val)
    {
        $val = strtoupper($this->clean($val));
        if (str_starts_with($val, 'M')) return 'M';
        if (str_starts_with($val, 'F')) return 'F';
        return null;
    }

    private function parseBool($val)
    {
        $val = strtoupper($this->clean($val));
        return in_array($val, ['YES', 'Y', 'TRUE', '1']) ? 1 : 0;
    }

    private function hasDoc($val)
    {
        $val = $this->clean($val);
        return $val ? 1 : 0;
    }

    private function cleanMoney($val)
    {
        if (!$val) return 0;
        return (float) str_replace([',', ' '], '', $val);
    }

    private function cleanDecimal($val)
    {
        if (!$val || $val === 'N/A') return 0;
        return (float) $val;
    }

    private function cleanGrade($val)
    {
        if (!$val || $val === 'N/A') return 0;
        return (float) filter_var($val, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }

    private function parseYearLevel($val)
    {
        $val = strtoupper($this->clean($val));
        if (str_contains($val, '1')) return 1;
        if (str_contains($val, '2')) return 2;
        if (str_contains($val, '3')) return 3;
        if (str_contains($val, '4')) return 4;
        if (str_contains($val, '5')) return 5;
        return 1; 
    }

    private function parseLivingStatus($val)
    {
        $val = strtoupper($this->clean($val));
        if (in_array($val, ['DECEASED', 'DEAD', 'D', 'NO', '0'])) return 0;
        return 1; 
    }
}