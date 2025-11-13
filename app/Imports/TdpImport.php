<?php

namespace App\Imports;

// Import all the models we need
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\Program;
use App\Models\Address;
use App\Models\Course;
use App\Models\HEI;

// Laravel & Maatwebsite utilities
use Illuminate\Support\Str;
use Carbon\Carbon;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Illuminate\Support\Facades\Log;

class TdpImport implements OnEachRow, WithHeadingRow, WithChunkReading
{
    use RemembersRowNumber; 

    private $heis;
    private $courses;
    private $tdpProgramId;
    public $skippedRows = [];

    /**
     * Header is on Row 1
     */
    public function headingRow(): int
    {
        return 1;
    }

    /**
     * Normalizer function (includes suffix fix)
     */
    private function normalize(?string $name): string 
    {
        // 1. Default null to an empty string
        $name = Str::upper($name ?? ''); 
        
        // 2. Handle known abbreviations
        $name = str_replace('BSSW', 'BACHELOR OF SCIENCE IN SOCIAL WORK', $name);
        $name = str_replace('BSBA-FM', 'BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION MAJOR IN FINANCIAL MANAGEMENT', $name);
        
        // 3. Remove common suffixes
        $suffixes = [
            ' INCORPORATED',
            ' INC',
            ' CORPORATION',
            ' CORP',
        ];
        $name = str_replace($suffixes, '', $name);

        // 4. Remove all remaining punctuation and spaces
        return preg_replace('/[^A-Z0-9]/', '', $name);
    }

    /**
     * Constructor (includes database column fix)
     */
    public function __construct()
    {
        $this->tdpProgramId = Program::where('program_name', 'TDP')->firstOrFail()->id;

        // *** FIX: Use 'hei_name' to match your database ***
        $this->heis = HEI::whereNotNull('hei_name')->get()->keyBy(function ($hei) {
            return $this->normalize($hei->hei_name); 
        });

        // *** FIX: Use 'course_name' to match your database ***
        $this->courses = Course::whereNotNull('course_name')->get()->keyBy(function ($course) {
            return $this->normalize($course->course_name);
        });
    }

    /**
     * Finds a HEI from the cache. Returns ID or null.
     */
    private function findHei(string $name): ?int
    {
        $normalizedName = $this->normalize($name);
        if (isset($this->heis[$normalizedName])) {
            return $this->heis[$normalizedName]->id;
        }
        return null;
    }

    /**
     * Finds a Course from the cache. Returns ID or null.
     */
    private function findCourse(string $name): ?int
    {
        $normalizedName = $this->normalize($name);
        if (isset($this->courses[$normalizedName])) {
            return $this->courses[$normalizedName]->id;
        }
        return null;
    }

    private function isEmailValid($email): bool
    {
        $email = strtolower(trim($email ?? ''));
        $invalidEmails = ['', '0', 'na@gmail.com', 'n/a@gmail.com', 'none@gmail.com', 'none', 'n/a'];
        if (in_array($email, $invalidEmails) || !str_contains($email, '@')) {
            return false;
        }
        return true;
    }

    private function generatePlaceholderEmail(array $row): string
    {
        $firstName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $row['firstname'] ?? ''));
        $lastName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $row['lastname'] ?? ''));
        $rowNumber = $this->getRowNumber();
        return "tdp.{$lastName}.{$firstName}.{$rowNumber}@gabayix-placeholder.com";
    }

    /**
     * This method is called for every row in the Excel file.
     */
    public function onRow(Row $row)
    {
        $row = $row->toArray();
        $rowNumber = $this->getRowNumber();

        // 1. Silently skip blank rows
        if (empty($row['firstname']) && empty($row['lastname']) && empty($row['hei_name'])) {
            return;
        }

        // 2. Log warnings for rows with data but missing key fields
        if (empty($row['year']) || empty($row['semester'])) {
            $this->skippedRows[] = "Row $rowNumber: Skipped due to missing YEAR or SEMESTER.";
            Log::warning("TDP Import: Row $rowNumber skipped. Reason: Missing YEAR or SEMESTER.");
            return; 
        }

        // --- 1. GET FOREIGN IDs ---
        $heiId = $this->findHei($row['hei_name']);
        if (is_null($heiId)) {
            $this->skippedRows[] = "Row $rowNumber: HEI not found in database: '" . $row['hei_name'] . "'. Row skipped.";
            Log::warning("TDP Import: Row $rowNumber skipped. Reason: HEI not found: '" . $row['hei_name'] . "'");
            return; // Skip
        }

        $courseId = $this->findCourse($row['course_enrolled']);
        if (is_null($courseId)) {
            $this->skippedRows[] = "Row $rowNumber: Course not found in database: '" . $row['course_enrolled'] . "'. Row skipped.";
            Log::warning("TDP Import: Row $rowNumber skipped. Reason: Course not found: '" . $row['course_enrolled'] . "'");
            return; // Skip
        }

        // --- 2. GET A VALID EMAIL ---
        $email = $this->isEmailValid($row['email']) 
                 ? $row['email'] 
                 : $this->generatePlaceholderEmail($row);

        //
        // --- ▼▼▼ FIX #1: SCHOLAR COLUMN NAMES (matches Scholar.php) ▼▼▼ ---
        //
        $scholar = Scholar::updateOrCreate(
            [
                'given_name'   => trim($row['First Name']), // CSV 'firstname'
                'family_name'  => trim($row['Last Name']),  // CSV 'lastname'
                'middle_name'  => isset($row['Middle Name']) ? trim($row['Middle Name']) : null,
            ],
            [
                'sex'           => $row['sex'] ? strtoupper(substr(trim($row['sex']), 0, 1)) : null,
                'contact_no'    => $row['contact'],
                'email_address' => $email, // <-- Corrected to 'email_address'
            ]
        );
        // --- ▲▲▲ END OF FIX #1 ▲▲▲ ---


        // --- 4. CREATE/UPDATE SCHOLAR'S ADDRESS ---
        //
        // --- ▼▼▼ FIX #2: TOWN/CITY KEY (matches CSV header) ▼▼▼ ---
        //
        Address::updateOrCreate(
            ['scholar_id' => $scholar->id],
            [
                'brgy_street'            => $row['street'],
                'town_city'              => $row['town_city'], // <-- Corrected to 'town/city'
                'province'               => $row['province'],
                'congressional_district' => $row['district'],
            ]
        );
        // --- ▲▲▲ END OF FIX #2 ▲▲▲ ---

        // --- 5. CREATE/UPDATE SCHOLAR'S ENROLLMENT ---
        $enrollment = ScholarEnrollment::updateOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $this->tdpProgramId, 
            ],
            [
                'hei_id'                => $heiId,
                'status'                => 'active', 
                'academic_year_applied' => $row['year'],
            ]
        );

        // --- 6. CREATE THE NEW ACADEMIC RECORD ---
        $datePaid = null;
        if (!empty($row['date_paid']) && strtolower($row['date_paid']) !== 'n/a') {
            try {
                $datePaid = Carbon::parse($row['date_paid'])->toDateString();
            } catch (\Exception $e) {
                $datePaid = null;
            }
        }
        
        AcademicRecord::create([
            'scholar_enrollment_id' => $enrollment->id,
            'hei_id'                => $heiId,
            'course_id'             => $courseId,
            'academic_year'         => $row['year'],
            'semester'              => $row['semester'],
            'year_level'            => $row['year_level'],
            'validation_status'     => $row['status_of_validation_verification'],
            'payment_status'        => $datePaid ? 'Paid' : 'Unpaid',
            'grant_amount'          => $row['tdp_grant'],
            'app_no'                => $row['app_no'],
            'award_number'          => $row['award_no'],
            'endorsed_by'           => $row['endorsed_by'],
            'disbursement_date'     => $datePaid,
        ]);
    }

    public function chunkSize(): int
    {
        return 500;
    }
    
    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}