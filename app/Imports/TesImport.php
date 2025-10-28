<?php

namespace App\Imports;

use App\Models\Course;
use App\Models\Hei;
use App\Models\TesAcademicRecord;
use App\Models\TesScholar;
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

    public function __construct()
    {
        /**
         * Before the import starts, we load all existing HEIs and Courses.
         * This creates an efficient 'Name' => 'ID' map in memory.
         * This is the core of the pre-caching optimization.
         */
        $this->heis = Hei::pluck('id', 'hei_name');
        $this->courses = Course::pluck('id', 'course_name');
    }

    public function headingRow(): int
    {
        // This should be the row number where your headers are located.
        return 8;
    }

    public function model(array $row)
    {
        // Skip row if essential data is missing
        if (empty($row['lastname']) || empty($row['firstname'])) {
            return null;
        }

        // --- 1. Get HEI ID from cache or create a new one ---
        $heiName = $row['hei_name'] ?? 'N/A';
        $heiId = $this->heis->get($heiName);
        if (!$heiId) {
            $hei = Hei::create([
                'hei_name' => $heiName,
                'hei_type' => $row['hei_type'] ?? null,
                'city' => $row['hei_citymunicipality'] ?? null,
                'province' => $row['hei_province'] ?? null,
                'district' => $row['hei_district'] ?? null,
            ]);
            $heiId = $hei->id;
            $this->heis->put($heiName, $heiId); // Add the new HEI to our cache for subsequent rows
        }

        // --- 2. Get Course ID from cache or create a new one ---
        $courseName = $row['courseprogram_enrolled'] ?? 'N/A';
        $courseId = $this->courses->get($courseName);
        if (!$courseId) {
            $course = Course::create(['course_name' => $courseName]);
            $courseId = $course->id;
            $this->courses->put($courseName, $courseId); // Add the new course to our cache
        }

        // --- 3. Find or create the Scholar's permanent data ---
        $scholar = TesScholar::firstOrCreate(
            [
                'family_name' => $row['lastname'],
                'given_name' => $row['firstname'],
                'birthdate' => $this->transformDate($row['birthdate'] ?? null),
            ],
            [
                'middle_name' => $row['middlename'] ?? null,
                'extension_name' => $row['extname'] ?? null,
                'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
                'street' => $row['street'] ?? null,
                'municipality' => $row['municipality'] ?? null,
                'province' => $row['province'] ?? null,
                'pwd_classification' => $row['classification_of_pwd'] ?? null,
            ]
        );

        // --- 4. Create the Academic Record that links everything ---
        return new TesAcademicRecord([
            'tes_scholar_id' => $scholar->id,
            'hei_id' => $heiId,
            'course_id' => $courseId,
            'seq' => $row['seq'] ?? null,
            'app_no' => $row['app_no'] ?? null,
            'award_no' => $row['award_no'] ?? null,
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
        ]);
    }

    // Process the file in large, efficient chunks
    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }

    // Helper to handle various Excel date formats
    private function transformDate($value) {
        if (!$value) return null;
        try {
            return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value))->format('Y-m-d');
        } catch (\Exception $e) {
            try { return Carbon::parse($value)->format('Y-m-d'); } 
            catch (\Exception $e) { return null; }
        }
    }
}