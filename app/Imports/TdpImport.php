<?php

namespace App\Imports;

use App\Models\Course;
use App\Models\HEI; // Make sure your model is Hei, not Hei
use App\Models\TdpAcademicRecord;
use App\Models\TdpScholar;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\Log;

class TdpImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    private $heis;
    private $courses;

    public function __construct()
    {
        // Pre-load existing HEIs and Courses to avoid duplicate queries in the loop
        $this->heis = HEI::pluck('id', 'hei_name');
        $this->courses = Course::pluck('id', 'course_name');
    }

    /**
     * ✅ ADD THIS METHOD
     * This tells the importer that your header row is on line 5.
     * The importer will automatically start reading data from line 6.
     */
    public function headingRow(): int
    {
        return 5;
    }

    public function model(array $row)
    {
        if (empty($row['lastname']) || empty($row['firstname'])) {
            return null;
        }

        $heiName = $row['hei_name'] ?? 'N/A';
        $heiId = $this->heis->get($heiName);
        if (!$heiId) {
            $hei = HEI::create([
                'hei_name' => $heiName, 'hei_type' => $row['hei_type'] ?? null, 'city' => $row['hei_citymunicipality'] ?? null,
                'province' => $row['hei_province'] ?? null, 'district' => $row['hei_district'] ?? null,
            ]);
            $heiId = $hei->id;
            $this->heis->put($heiName, $heiId);
        }

        $courseName = $row['course_enrolled'] ?? 'N/A';
        $courseId = $this->courses->get($courseName);
        if (!$courseId) {
            $course = Course::create(['course_name' => $courseName]);
            $courseId = $course->id;
            $this->courses->put($courseName, $courseId);
        }

      $scholarData = [
            'family_name' => $row['lastname'],
            'given_name' => $row['firstname'],
            'middle_name' => $row['middlename'] ?? null,
            'extension_name' => $row['ext'] ?? null,
            'sex' => isset($row['sex']) ? strtoupper(trim($row['sex']))[0] : null,
            'street' => $row['street'] ?? null,
            'town_city' => $row['towncity'] ?? null,
            'district' => $row['district'] ?? null,
            'province' => $row['province'] ?? null,
            'contact_no' => $row['contact'] ?? null,
        ];

        // 2. Validate the email from Excel
        $emailFromExcel = isset($row['email']) ? trim($row['email']) : null;
        $isValidEmail = !empty($emailFromExcel) && $emailFromExcel !== '0' && strcasecmp($emailFromExcel, 'N/A') !== 0 && filter_var($emailFromExcel, FILTER_VALIDATE_EMAIL);

        // 3. Try to find an existing scholar based on name (or other reliable unique fields)
        $existingScholar = TdpScholar::where('family_name', $scholarData['family_name'])
                                     ->where('given_name', $scholarData['given_name'])
                                     ->where('middle_name', $scholarData['middle_name'])
                                     // Optional: Add other unique fields like birthdate if available
                                     ->first();

        $scholar = null; // Initialize scholar

        if ($existingScholar) {
            // 4a. Scholar Found: Update them
            Log::info('TDP Import: Found existing scholar', ['id' => $existingScholar->id, 'name' => $scholarData['family_name']]);
            // Only update the email if the Excel provided a valid one AND it's not taken by someone else
            if ($isValidEmail) {
                $emailExists = TdpScholar::where('email_address', $emailFromExcel)
                                         ->where('id', '!=', $existingScholar->id)
                                         ->exists();
                if (!$emailExists) {
                    $scholarData['email_address'] = $emailFromExcel; // Add valid email to data to be updated
                } else {
                    Log::warning('TDP Import: Valid email from Excel is already taken. Skipping email update.', ['scholar_id' => $existingScholar->id, 'email' => $emailFromExcel]);
                }
            } else {
                 Log::info('TDP Import: Email in Excel is invalid/missing. Keeping existing email.', ['scholar_id' => $existingScholar->id]);
            }
            $existingScholar->update($scholarData); // Update the scholar
            $scholar = $existingScholar; // Use the found scholar

        } else {
            // 4b. Scholar Not Found: Create a new one
            Log::info('TDP Import: Creating new scholar', ['name' => $scholarData['family_name']]);
            if ($isValidEmail) {
                 $emailExists = TdpScholar::where('email_address', $emailFromExcel)->exists();
                 if (!$emailExists) {
                     $scholarData['email_address'] = $emailFromExcel; // Add valid email for creation
                 } else {
                      Log::warning('TDP Import: Valid email for new user is already taken. Generating placeholder.', ['email' => $emailFromExcel]);
                      // Generate placeholder if valid email is taken
                      $unique_id = uniqid();
                      $lastName = strtolower(preg_replace('/[^a-z0-9]/i', '', $row['lastname']));
                      $scholarData['email_address'] = "placeholder-{$lastName}-{$unique_id}@gabay-ix.com";
                 }
            } else {
                // Generate placeholder because email is invalid/missing
                $unique_id = uniqid();
               $lastName = strtolower(preg_replace('/[^a-z0-9]/i', '', $row['lastname']));
                $scholarData['email_address'] = "placeholder-{$lastName}-{$unique_id}@gabay-ix.com";
                Log::info('TDP Import: Email invalid/missing for new user. Generated placeholder.', ['placeholder' => $scholarData['email_address']]);
            }
            $scholar = TdpScholar::create($scholarData); // Create the new scholar
        }
       // --- Create or Update Academic Record ---
        $academicYear = $row['year'] ?? $row['academic_year'] ?? '2024-2025'; // Default or from Excel

        if($scholar){ // Ensure scholar was found or created before proceeding
            TdpAcademicRecord::updateOrCreate(
                [
                    // Keys to find an existing record
                    'tdp_scholar_id' => $scholar->id,
                    'award_no' => $row['award_no'] ?? null,
                    'academic_year' => $academicYear,
                ],
                [
                    // Data to update or set if creating new
                    'hei_id' => $heiId,
                    'course_id' => $courseId,
                    'seq' => $row['seq'] ?? null,
                    'app_no' => $row['app_no'] ?? null,
                    'year_level' => $row['year_level'] ?? null,
                    'batch' => $row['batch'] ?? null,
                    'validation_status' => $row['status_of_validation_verification'] ?? null,
                    'semester' => $row['semester'] ?? null, // Make sure you have a 'semester' column header if using this
                    // Add your new financial fields (use correct keys from Excel)
                   'date_paid' => is_numeric($row['date_paid']) ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['date_paid'])->format('Y-m-d') : null,
                    'ada_no' => $row['ada_no'] ?? null,
                    'tdp_grant' => isset($row['tdp_grant']) ? $this->sanitizeCurrency($row['tdp_grant']) : null,
                    'endorsed_by' => $row['endorsed_by'] ?? null,
                ]
            );
        } else {
             Log::error('TDP Import: Scholar object was null, cannot create academic record for row.', $row);
        }

        // Return null because we are handling creation/update directly
        return null;
    }
private function sanitizeCurrency($value): ?float
    {
        if (is_numeric($value)) {
            return (float)$value;
        }
        if (is_string($value)) {
            // Remove currency symbols (₱, $, etc.), commas, and spaces
            $cleanedValue = preg_replace('/[^\d.]/', '', $value);
            return is_numeric($cleanedValue) ? (float)$cleanedValue : null;
        }
        return null; // Return null if it's not a string or number
    }
    public function batchSize(): int { return 500; }
    public function chunkSize(): int { return 500; }
}