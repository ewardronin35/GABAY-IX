<?php

namespace App\Imports;

// NEW: Import the new normalized models
use App\Models\Scholar;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use App\Models\Program;
// These models are still correct
use App\Models\Course;
use App\Models\HEI;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;

class TesImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    use RemembersRowNumber;

    /**
     * These properties will hold our in-memory cache.
     */
    private $heis;
    private $courses;
    private $tesProgramId; // NEW: To store the "TES" program ID

    public function __construct()
    {
        /**
         * Before the import starts, we load all existing HEIs and Courses.
         * This creates an efficient 'Name' => 'ID' map in memory.
         * This is the core of the pre-caching optimization.
         */
        $this->heis = HEI::pluck('id', 'hei_name');
        $this->courses = Course::pluck('id', 'course_name');

        // NEW: Find the "TES" Program ID once and store it.
        $tesProgram = Program::where('program_name', 'TES')->first();
        if (!$tesProgram) {
            // This will stop the import if you haven't seeded your 'programs' table
            throw new \Exception("Program 'TES' not found in the 'programs' table. Please seed the table.");
        }
        $this->tesProgramId = $tesProgram->id;
    }

    public function headingRow(): int
    {
        // This should be the row number where your headers are located.
        return 8;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Skip row if essential data is missing
        if (empty($row['lastname']) || empty($row['firstname'])) {
            return null;
        }

        // --- STEP 1: Find or Create the "Person" (Scholar) ---
        $scholar = $this->findOrCreateScholar($row);

        // --- STEP 2: Find or Create HEI and Course ---
        $heiId = $this->findOrCreateHei($row);
        $courseId = $this->findOrCreateCourse($row);

        // --- STEP 3: Find or Create the "Enrollment" ---
        // This links the Scholar (Person) to the TES Program
        $enrollment = ScholarEnrollment::firstOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $this->tesProgramId,
                // We add academic_year_applied to make the enrollment unique
                // in case they are in TES for multiple years.
                'academic_year_applied' => $row['year'] ?? null, 
            ],
            [
                'hei_id' => $heiId,
                'award_number' => $row['award_no'] ?? null,
                'status' => 'active', // Default status for new imports
            ]
        );

        // --- STEP 4: Create the "Academic Record" ---
        // This is the actual semester data, now linked to the enrollment.
        return new AcademicRecord([
            'scholar_enrollment_id' => $enrollment->id, // THE KEY CHANGE
            'hei_id' => $heiId,
            'course_id' => $courseId,
            'seq' => $row['seq'] ?? null,
            'app_no' => $row['app_no'] ?? null,
            'year_level' => $row['year_level'] ?? null,
            'total_units_enrolled' => $row['total_units_enrolled'] ?? null,
            'grant_amount' => $row['grant'] ?? null,
            'batch_no' => $row['batch_no'] ?? null,
            'validation_status' => $row['status_of_validation_verification'] ?? null,
            'payment_status' => $row['payment'] ?? null,
            'remarks' => $row['remarks'] ?? null,
            'endorsed_by' => $row['endorsed_by'] ?? null,
            'semester' => $row['semester'] ?? null,
            'academic_year' => $row['year'] ?? null,
            // You can add any other fields from the row here
        ]);
    }

    /**
     * --- HELPER 1: Find or Create the Scholar (Person) ---
     * This function is updated to use the NEW 'Scholar' model
     */
    private function findOrCreateScholar(array $row)
    {
        $dob = $this->transformDate($row['date_of_birth']);
        $email = strtolower(trim($row['email_address'] ?? ''));

        // Try to find by email first
        if (!empty($email)) {
            $scholar = Scholar::where('email', $email)->first();
            if ($scholar) {
                return $scholar;
            }
        }
        
        // If not found by email, find or create by name + birthday
        return Scholar::updateOrCreate(
            [
                'first_name' => $row['firstname'],
                'last_name' => $row['lastname'],
                'birthday' => $dob,
            ],
            [
                'middle_name' => $row['middlename'] ?? null,
                'sex' => $this->mapSex($row['sex'] ?? null),
                'contact_number' => $row['contact_number'] ?? null,
                'email' => $email,
            ]
        );
    }

    /**
     * --- HELPER 2: Find or Create HEI ---
     * This function is unchanged and still works perfectly.
     */
    private function findOrCreateHei(array $row)
    {
        $heiName = trim($row['hei_name'] ?? null);
        if (empty($heiName)) {
            return null;
        }

        // Check if we have this HEI in our pre-loaded cache
        if (isset($this->heis[$heiName])) {
            return $this->heis[$heiName];
        }

        // If not, create it and add it to the cache
        $hei = HEI::create(['hei_name' => $heiName]);
        $this->heis[$heiName] = $hei->id;
        return $hei->id;
    }

    /**
     * --- HELPER 3: Find or Create Course ---
     * This function is unchanged and still works perfectly.
     */
    private function findOrCreateCourse(array $row)
    {
        $courseName = trim($row['course_program'] ?? null);
        if (empty($courseName)) {
            return null;
        }

        // Check if we have this Course in our pre-loaded cache
        if (isset($this->courses[$courseName])) {
            return $this->courses[$courseName];
        }

        // If not, create it and add it to the cache
        $course = Course::create([
            'course_name' => $courseName,
            'course_code' => $row['course_code'] ?? null
        ]);
        $this->courses[$courseName] = $course->id;
        return $course->id;
    }
    
    // Process the file in large, efficient chunks
    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }

    // Helper to handle various Excel date formats
    private function transformDate($value) {
        if (!$value) return null;
        try {
            // Try to parse as Excel timestamp
            return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value));
        } catch (\Exception $e) {
            try {
                // Try to parse as standard date string
                return Carbon::parse($value);
            } catch (\Exception $e) {
                return null;
            }
        }
    }

    // Helper to map Sex to M/F
    private function mapSex($value) {
        if (empty($value)) return null;
        $val = strtoupper(trim($value))[0]; // Get first letter
        if ($val === 'M') return 'M';
        if ($val === 'F') return 'F';
        return null;
    }
}