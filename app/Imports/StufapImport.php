<?php

namespace App\Imports;

use App\Models\Course;
use App\Models\HEI;
use App\Models\StufapAcademicRecord;
use App\Models\StufapScholar;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use App\Models\Program; 

class StufapImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    /**
     * These properties will hold our in-memory cache to prevent
     * querying the database for every single row, boosting performance.
     */
    private $heis;
    private $courses;
private $programs;
    public function __construct()
    {
        // Before the import starts, we load all existing HEIs and Courses into memory.
        $this->heis = HEI::pluck('id', 'hei_name');
        $this->courses = Course::pluck('id', 'course_name');
        $this->programs = Program::pluck('id', 'program_name');
    }

    /**
     * Specify the row number where your headers are located.
     * Based on your "Annex E" file, this is row 10.
     */
    public function headingRow(): int
    {
        return 10;
    }

    public function model(array $row)
    {
        // The maatwebsite/excel library automatically converts headers
        // from "FAMILY NAME" to "family_name". We use these slugified keys.
        
        // Skip row if essential data like name is missing
        if (empty($row['family_name']) || empty($row['given_name'])) {
            return null;
        }

        // --- 1. Get HEI ID from cache or create a new one ---
        $heiName = $row['hei_name'] ?? 'N/A';
        $heiId = $this->heis->get($heiName);
        if (!$heiId) {
            $hei = HEI::create(['hei_name' => $heiName]);
            $heiId = $hei->id;
            $this->heis->put($heiName, $heiId); // Add the new HEI to our cache
        }
        
        // --- 2. Get Course ID from cache or create a new one ---
        $courseName = $row['courseprogram'] ?? 'N/A';
        $courseId = $this->courses->get($courseName);
        if (!$courseId) {
            $course = Course::create(['course_name' => $courseName]);
            $courseId = $course->id;
            $this->courses->put($courseName, $courseId); // Add the new course to our cache
        }
$programName = $row['program'] ?? 'N/A'; 
        $programId = $this->programs->get($programName);

        if (!$programId) {
            // Assuming your Program model has a 'program_name' field
            $program = Program::create(['program_name' => $programName]); 
            $programId = $program->id;
            $this->programs->put($programName, $programId); // Add new program to cache
        }
        // --- 3. Find or create the Scholar's permanent data ---
        $scholar = StufapScholar::firstOrCreate(
            [
                'family_name' => $row['family_name'],
                'given_name' => $row['given_name'],
                'middle_name' => $row['middle_name'] ?? null,
            ],
            [
                'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
                'region' => $row['region'] ?? null,
            ]
        );

        // --- 4. Create the Academic Record that links everything ---
        return new StufapAcademicRecord([
            'stufap_scholar_id' => $scholar->id,
            'hei_id' => $heiId,
            'course_id' => $courseId,
            'program_id' => $programId, // <-- ADD THIS LINE
            'seq' => $row['seq'] ?? null,
            'award_number' => $row['award_number'] ?? null,
            'status_type' => $row['status_type'] ?? null,
        ]);
    }

    // Process the file in large, efficient chunks
    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }
}