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
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;

class TdpImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    use RemembersRowNumber; // Use this to get the current Excel row number

    /**
     * These properties will hold our in-memory cache.
     */
    private $heis;
    private $courses;
    private $tdpProgramId;

    /**
     * This is the "secret sauce" normalizer.
     * It cleans a string to a universal format for matching.
     * "St. John's College - Ipil" becomes "STJOHNSCOLLEGEIPIL"
     */
    private function normalize(string $name): string
    {
        $name = Str::upper($name); // 1. Uppercase
        
        // 2. Handle known abbreviations from your data
        $name = str_replace('BSSW', 'BACHELOR OF SCIENCE IN SOCIAL WORK', $name);
        $name = str_replace('BSBA-FM', 'BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION MAJOR IN FINANCIAL MANAGEMENT', $name);
        // Add more abbreviations as you find them
        // $name = str_replace('BS CRIM', 'BACHELOR OF SCIENCE IN CRIMINOLOGY', $name);

        // 3. Remove all punctuation and spaces
        return preg_replace('/[^A-Z0-9]/', '', $name);
    }

    /**
     * Constructor runs once before the import.
     * We load and normalize our entire HEI and Course database here.
     */
    public function __construct()
    {
        // 1. Get the TDP Program ID once
        $this->tdpProgramId = Program::where('program_name', 'TDP')->firstOrFail()->id;

        // 2. Create a NORMALIZED cache for HEIs.
        // This maps "AIMHIGHCOLLEGE" => $hei_model
        $this->heis = HEI::all()->keyBy(function ($hei) {
            return $this->normalize($hei->hei_name); // Use our helper
        });

        // 3. Create a NORMALIZED cache for Courses.
        // This maps "BACHELOROFSCIENCEINSOCIALWORK" => $course_model
        $this->courses = Course::all()->keyBy(function ($course) {
            return $this->normalize($course->course_name); // Use our helper
        });
    }

    /**
     * Finds a HEI from the cache or creates a new one.
     */
    private function findOrCreateHei(string $name): int
    {
        $normalizedName = $this->normalize($name);

        // Check the normalized cache (SUPER FAST)
        if (isset($this->heis[$normalizedName])) {
            return $this->heis[$normalizedName]->id;
        }

        // Not in cache. Create it, add it to our cache, and return the new ID.
        $newHei = HEI::create(['hei_name' => trim($name)]);
        $this->heis[$normalizedName] = $newHei; // Add to cache for this run
        return $newHei->id;
    }

    /**
     * Finds a Course from the cache or creates a new one.
     */
    private function findOrCreateCourse(string $name): int
    {
        $normalizedName = $this->normalize($name);

        // Check the normalized cache (SUPER FAST)
        if (isset($this->courses[$normalizedName])) {
            return $this->courses[$normalizedName]->id;
        }

        // Not in cache. Create it, add it to cache, and return the new ID.
        $newCourse = Course::create(['course_name' => trim($name)]);
        $this->courses[$normalizedName] = $newCourse;
        return $newCourse->id;
    }

    /**
     * Checks if an email is valid (not a placeholder).
     */
    private function isEmailValid($email): bool
    {
        $email = strtolower(trim($email ?? ''));
        $invalidEmails = ['', '0', 'na@gmail.com', 'n/a@gmail.com', 'none@gmail.com', 'none', 'n/a'];
        if (in_array($email, $invalidEmails) || !str_contains($email, '@')) {
            return false;
        }
        return true;
    }

    /**
     * Generates a unique placeholder email based on name and row number.
     */
    private function generatePlaceholderEmail(array $row): string
    {
        $firstName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $row['firstname'] ?? ''));
        $lastName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $row['lastname'] ?? ''));
        $rowNumber = $this->getRowNumber(); // From RemembersRowNumber trait
        return "tdp.{$lastName}.{$firstName}.{$rowNumber}@gabayix-placeholder.com";
    }

    /**
     * This method is called for every row in the Excel file.
     */
    public function model(array $row)
    {
        // --- FIX FOR FAILED JOBS ---
        // This skips the row if critical data is missing
        if (empty($row['year']) || empty($row['semester'])) {
            return null; // Skip this row
        }

        // --- 1. GET FOREIGN IDs using our smart helpers ---
        $heiId = $this->findOrCreateHei($row['hei_name']);
        $courseId = $this->findOrCreateCourse($row['course_enrolled']);

        // --- 2. GET A VALID EMAIL ---
        $email = $this->isEmailValid($row['email']) 
                    ? $row['email'] 
                    : $this->generatePlaceholderEmail($row);

        // --- 3. FIND OR CREATE THE SCHOLAR (Consolidated) ---
        $scholar = Scholar::updateOrCreate(
            [
                'given_name' => trim($row['firstname']),
                'family_name' => trim($row['lastname']),
                'middle_name' => isset($row['middlename']) ? trim($row['middlename']) : null,
            ],
            [
                'sex' => $row['sex'] ? strtoupper(substr($row['sex'], 0, 1)) : null,
                'contact_no' => $row['contact'],
                'email_address' => $email,
            ]
        );

        // --- 4. CREATE/UPDATE SCHOLAR'S ADDRESS ---
        Address::updateOrCreate(
            ['scholar_id' => $scholar->id],
            [
                'brgy_street' => $row['street'],
                'town_city' => $row['town_city'],
                'province' => $row['province'],
                'congressional_district' => $row['district'],
            ]
        );

        // --- 5. CREATE/UPDATE SCHOLAR'S ENROLLMENT IN THIS PROGRAM ---
        $enrollment = ScholarEnrollment::updateOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $this->tdpProgramId, // From our __construct
            ],
            [
                'hei_id' => $heiId,
                'status' => 'active', 
                'academic_year_applied' => $row['year'],
            ]
        );

        // --- 6. CREATE THE NEW ACADEMIC RECORD FOR THIS SEMESTER ---
        AcademicRecord::create([
            'scholar_enrollment_id' => $enrollment->id,
            'hei_id' => $heiId,
            'course_id' => $courseId,
            'academic_year' => $row['year'],
            'semester' => $row['semester'],
            'year_level' => $row['year_level'],
            'validation_status' => $row['status_of_validation_verification'],
            'payment_status' => $row['date_paid'] ? 'Paid' : 'Unpaid',
            'grant_amount' => $row['tdp_grant'],
            'app_no' => $row['app_no'],
            'award_number' => $row['award_no'],
            'endorsed_by' => $row['endorsed_by'],
            'disbursement_date' => $row['date_paid'] ? Carbon::parse($row['date_paid']) : null,
        ]);

        return null; // We handled saving ourselves
    }

    public function batchSize(): int
    {
        return 500; // Import 500 rows at a time
    }

    public function chunkSize(): int
    {
        return 500; // Process in chunks of 500
    }
}