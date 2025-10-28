<?php

namespace App\Imports;

use App\Models\Scholar;
use App\Models\Program;
use App\Models\HEI;
use App\Models\Course;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

    class CoschoImport implements ToCollection, WithChunkReading
{
    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            $coschoProgram = Program::firstOrCreate(
                ['program_name' => 'COSCHO'],
                ['description' => 'Coconut Scholarship from CHED and PCA']
            );

            foreach ($rows as $index => $row) {
                if ($index === 0 || $row->filter()->isEmpty()) continue; // Skip header or empty rows

                // Map columns by index to model fields
                $seq = $row[0] ?? null;
                $award_year = $row[1] ?? null;
                $program_name = $row[2] ?? null; // Not used directly since we set program_id
                $new_ongoing = $row[3] ?? null; // Map to status_type if needed
                $region = $row[4] ?? null;
                $award_number = $row[5] ?? null;
                $family_name = $row[6] ?? null;
                $given_name = $row[7] ?? null;
                $middle_name = $row[8] ?? null;
                $extension_name = $row[9] ?? null;
                $sex = $row[10] ?? null;
                $date_of_birth = $this->sanitizeDate($row[11] ?? null);
                $registered_coconut_farmer = $row[12] ?? null;
                $farmer_registry_no = $row[13] ?? null;
                $special_group = $row[14] ?? null;
                $solo_parent = $row[15] ?? null;
                $senior_citizen = $row[16] ?? null;
                $pwd = $row[17] ?? null;
                $ip = $row[18] ?? null;
                $first_generation = $row[19] ?? null;
                $contact_no = $row[20] ?? null;
                $email_address = $row[21] ?? null;
                $brgy_street = $row[22] ?? null;
                $town_city = $row[23] ?? null;
                $province = $row[24] ?? null;
                $congressional_district = $row[25] ?? null;
                $hei_name = $row[26] ?? null;
                $type_of_heis = $row[27] ?? null;
                $hei_code = $row[28] ?? null;
                $education_program = $row[29] ?? null;
                $priority_program_tagging = $row[30] ?? null;
                $course_code = $row[31] ?? null;

                // AY 2023-2024 fields
                $ay2023_cy = $row[32] ?? null;
                $ay2023_osds_date_processed = $this->sanitizeDate($row[33] ?? null);
                $ay2023_transferred_to_chedros = $this->sanitizeCurrency($row[34] ?? null);
                $ay2023_nta_financial_benefits = $row[35] ?? null;
                $ay2023_fund_source = $row[36] ?? null;
                $ay2023_payment_first_sem = $this->sanitizeCurrency($row[37] ?? null);
                $ay2023_first_sem_disbursement_date = $this->sanitizeDate($row[38] ?? null);
                $ay2023_first_sem_status = $row[39] ?? null;
                $ay2023_first_sem_remarks = $row[40] ?? null;
                $ay2023_osds_date_processed2 = $this->sanitizeDate($row[41] ?? null);
                $ay2023_transferred_to_chedros2 = $this->sanitizeCurrency($row[42] ?? null);
                $ay2023_nta_financial_benefits2 = $row[43] ?? null;
                $ay2023_payment_second_sem = $this->sanitizeCurrency($row[44] ?? null);
                $ay2023_second_sem_disbursement_date = $this->sanitizeDate($row[45] ?? null);
                $ay2023_second_sem_status = $row[46] ?? null;
                $ay2023_second_sem_fund_source = $row[47] ?? null;
                // Thesis 2023
                $thesis2023_processed_date = $this->sanitizeDate($row[48] ?? null);
                $thesis2023_transferred_to_chedros = $this->sanitizeCurrency($row[49] ?? null);
                $thesis2023_nta = $row[50] ?? null;
                $thesis2023_amount = $this->sanitizeCurrency($row[51] ?? null);
                $thesis2023_disbursement_date = $this->sanitizeDate($row[52] ?? null);
                $thesis2023_remarks = $row[53] ?? null;

                // AY 2024-2025 fields
                $ay2024_cy = $row[54] ?? null;
                $ay2024_osds_date_processed = $this->sanitizeDate($row[55] ?? null);
                $ay2024_transferred_to_chedros = $this->sanitizeCurrency($row[56] ?? null);
                $ay2024_nta_financial_benefits = $row[57] ?? null;
                $ay2024_fund_source = $row[58] ?? null;
                $ay2024_payment_first_sem = $this->sanitizeCurrency($row[59] ?? null);
                $ay2024_first_sem_disbursement_date = $this->sanitizeDate($row[60] ?? null);
                $ay2024_first_sem_status = $row[61] ?? null;
                $ay2024_first_sem_remarks = $row[62] ?? null;
                $ay2024_osds_date_processed2 = $this->sanitizeDate($row[63] ?? null);
                $ay2024_transferred_to_chedros2 = $this->sanitizeCurrency($row[64] ?? null);
                $ay2024_nta_financial_benefits2 = $row[65] ?? null;
                $ay2024_payment_second_sem = $this->sanitizeCurrency($row[66] ?? null);
                $ay2024_second_sem_disbursement_date = $this->sanitizeDate($row[67] ?? null);
                $ay2024_second_sem_status = $row[68] ?? null;
                $ay2024_second_sem_fund_source = $row[69] ?? null;
                // Thesis 2024
                $thesis2024_processed_date = $this->sanitizeDate($row[70] ?? null);
                $thesis2024_transferred_to_chedros = $this->sanitizeCurrency($row[71] ?? null);
                $thesis2024_nta = $row[72] ?? null;
                $thesis2024_amount = $this->sanitizeCurrency($row[73] ?? null);
                $thesis2024_disbursement_date = $this->sanitizeDate($row[74] ?? null);
                $thesis2024_final_disbursement_date = $this->sanitizeDate($row[75] ?? null); // Assuming extra date column
                $thesis2024_remarks = $row[76] ?? null;

                // Data Integrity Check
                if (empty($family_name) || empty($hei_name)) {
                    Log::warning("Skipping row due to missing family_name or hei_name.");
                    continue;
                }

                $email = (!empty($email_address) && strcasecmp($email_address, 'N/A') !== 0) ? $email_address : 'placeholder-' . uniqid() . '@gabay-ix.com';

                $hei = HEI::firstOrCreate(
                    ['hei_name' => $hei_name],
                    [
                        'type_of_heis' => $type_of_heis ?? 'Unknown',
                        'city' => $town_city ?? null,
                        'province' => $province ?? null,
                        'district' => $congressional_district ?? null,
                        'hei_code' => $hei_code ?? null,
                    ]
                );

                $courseName = !empty($education_program) ? $education_program : 'Unknown';
                $course = Course::firstOrCreate(['course_name' => $courseName]);

                // Create/Update Scholar
                $scholar = Scholar::updateOrCreate(
                    ['email_address' => $email],
                    [
                        'seq' => $seq,
                 
                        'program_id' => $coschoProgram->id,
                        'family_name' => $family_name,
                        'given_name' => $given_name,
                        'middle_name' => $middle_name,
                        'extension_name' => $extension_name,
                        'sex' => $sex,
                        'date_of_birth' => $date_of_birth,
                        'registered_coconut_farmer' => $registered_coconut_farmer,
                        'farmer_registry_no' => $farmer_registry_no,
                        'special_group' => $special_group,
                        'is_solo_parent' => $this->convertToBoolean($solo_parent),
                        'is_senior_citizen' => $this->convertToBoolean($senior_citizen),
                        'is_pwd' => $this->convertToBoolean($pwd),
                        'is_ip' => $this->convertToBoolean($ip),
                        'is_first_generation' => $this->convertToBoolean($first_generation),
                        'contact_no' => $contact_no,
                    ]
                );

                // Address
                $scholar->address()->updateOrCreate([], [
                    'brgy_street' => $brgy_street,
                    'town_city' => $town_city,
                    'province' => $province,
                    'congressional_district' => $congressional_district,
                    'region' => $region ?? 'N/A',
                    'zip_code' => null, // Add if column exists in Excel
                ]);

                // Education
                $scholar->education()->updateOrCreate([], [
                    'hei_id' => $hei->id,
                    'course_id' => $course->id,
                    'priority_program_tagging' => $priority_program_tagging,
                    'course_code' => $course_code,
                ]);

              // Academic Year 2023-2024
$academicYear2023 = $scholar->academicYears()->updateOrCreate(['academic_year' => '2023-2024'], 
 [
           'award_year' => $award_year,
                        'status_type' => $new_ongoing, // Mapping New/Ongoing to status_type
                        'award_number' => $award_number,
        'cy' => $ay2023_cy,
    'osds_date_processed' => $ay2023_osds_date_processed,
    'transferred_to_chedros' => $ay2023_transferred_to_chedros,
    'nta_financial_benefits' => $ay2023_nta_financial_benefits,
    'fund_source' => $ay2023_fund_source,
    'payment_first_sem' => $ay2023_payment_first_sem,
    'first_sem_disbursement_date' => $ay2023_first_sem_disbursement_date,
    'first_sem_status' => $ay2023_first_sem_status,
    'first_sem_remarks' => $ay2023_first_sem_remarks,
    'osds_date_processed2' => $ay2023_osds_date_processed2,
    'transferred_to_chedros2' => $ay2023_transferred_to_chedros2,
    'nta_financial_benefits2' => $ay2023_nta_financial_benefits2,
    'payment_second_sem' => $ay2023_payment_second_sem,
    'second_sem_disbursement_date' => $ay2023_second_sem_disbursement_date,
    'second_sem_status' => $ay2023_second_sem_status,
    'second_sem_fund_source' => $ay2023_second_sem_fund_source,
    // Add other fields like award_number if needed
]);

// Thesis Grant 2023
// ✅ This checks for an amount OR a disbursement date
if (!empty($thesis2023_amount) || !empty($thesis2023_disbursement_date)) {
    $academicYear2023->thesisGrant()->updateOrCreate([], [
        'processed_date' => $thesis2023_processed_date,
        'transferred_to_chedros' => $thesis2023_transferred_to_chedros,
        'nta' => $thesis2023_nta,
        'amount' => $thesis2023_amount,
        'disbursement_date' => $thesis2023_disbursement_date,
        'final_disbursement_date' => null, // No separate column for 2023
        'remarks' => $thesis2023_remarks,
        'details' => 'THESIS/OJT/CONFERENCE', // Hardcode or map if needed
    ]);
}

// Academic Year 2024-2025 (similar mapping)
$academicYear2024 = $scholar->academicYears()->updateOrCreate(['academic_year' => '2024-2025'], [    'cy' => $ay2024_cy,
    'osds_date_processed' => $ay2024_osds_date_processed,
    'transferred_to_chedros' => $ay2024_transferred_to_chedros,
    'nta_financial_benefits' => $ay2024_nta_financial_benefits,
    'fund_source' => $ay2024_fund_source,
    'payment_first_sem' => $ay2024_payment_first_sem,
    'first_sem_disbursement_date' => $ay2024_first_sem_disbursement_date,
    'first_sem_status' => $ay2024_first_sem_status,
    'first_sem_remarks' => $ay2024_first_sem_remarks,
    'osds_date_processed2' => $ay2024_osds_date_processed2,
    'transferred_to_chedros2' => $ay2024_transferred_to_chedros2,
    'nta_financial_benefits2' => $ay2024_nta_financial_benefits2,
    'payment_second_sem' => $ay2024_payment_second_sem,
    'second_sem_disbursement_date' => $ay2024_second_sem_disbursement_date,
    'second_sem_status' => $ay2024_second_sem_status,
    'second_sem_fund_source' => $ay2024_second_sem_fund_source,
]);

// Thesis Grant 2024
if (!empty($thesis2024_amount)) {
    $academicYear2024->thesisGrant()->updateOrCreate([], [
        'processed_date' => $thesis2024_processed_date,
        'transferred_to_chedros' => $thesis2024_transferred_to_chedros,
        'nta' => $thesis2024_nta,
        'amount' => $thesis2024_amount,
        'disbursement_date' => $thesis2024_disbursement_date,
        'final_disbursement_date' => $thesis2024_final_disbursement_date,
        'remarks' => $thesis2024_remarks,
        'details' => 'THESIS/OJT/CONFERENCE',
    ]);
}
            }
        });
    }

private function convertToBoolean($value): bool
{
    return in_array(strtoupper($value ?? ''), ['YES', 'TRUE', '1']);
}

    public function chunkSize(): int
    {
        return 200; // Process 200 rows at a time to save memory
    }

    // --- HELPER FUNCTIONS (Copied from your controller) ---

    private function updateAcademicYear($scholar, $row, $year, $prefix)
    {
        if (empty($row[$prefix . '_cy'])) {
            return;
        }

        $scholar->academicYears()->updateOrCreate(
            ['academic_year' => $year],
            [ 'status_type' => $row['new_ongoing'] ?? null,
                'year' => $year,
                'award_year' => $row['award_year'] ?? null,
                'status_type' => $row['status_type'] ?? null,
                'award_number' => $row['award_number'] ?? null,
                'osds_date_processed' => $this->sanitizeDate($row[$prefix . '_osds_date_processed'] ?? null),
                'osds_date_processed2' => $this->sanitizeDate($row[$prefix . '_osds_date_processed2'] ?? null),
                'transferred_to_chedros' => $this->sanitizeCurrency($row[$prefix . '_transferred_to_chedros'] ?? null),
                'transferred_to_chedros2' => $this->sanitizeCurrency($row[$prefix . '_transferred_to_chedros2'] ?? null),
                'nta_financial_benefits' => $row[$prefix . '_nta_financial_benefits'] ?? null,
                'nta_financial_benefits2' => $row[$prefix . '_nta_financial_benefits2'] ?? null,
                'fund_source' => $row[$prefix . '_fund_source'] ?? null,
                'payment_first_sem' => $this->sanitizeCurrency($row[$prefix . '_payment_first_sem'] ?? null),
                'first_sem_disbursement_date' => $this->sanitizeDate($row[$prefix . '_first_sem_disbursement_date'] ?? null),
                'first_sem_status' => $row[$prefix . '_first_sem_status'] ?? null,
                'payment_second_sem' => $this->sanitizeCurrency($row[$prefix . '_payment_second_sem'] ?? null),
                'second_sem_disbursement_date' => $this->sanitizeDate($row[$prefix . '_second_sem_disbursement_date'] ?? null),
                'second_sem_status' => $row[$prefix . '_second_sem_status'] ?? null,
                'second_sem_fund_source' => $row[$prefix . '_second_sem_fund_source'] ?? null,
            ]
        );
    }

/**
 * Normalizes Excel header keys into a clean, snake_case format.
 * This handles capitalization, extra spaces, and special characters.
 * Example: "Family Name" becomes "family_name"
 */
private function normalizeRowKeys($row)
{
    $normalized = new \Illuminate\Support\Fluent();
    foreach ($row as $key => $value) {
        // 1. Trim whitespace from start and end
        $cleanKey = trim($key);
        // 2. Convert the entire string to lowercase
        $cleanKey = strtolower($cleanKey);
        // 3. Replace all spaces and other non-alphanumeric characters with an underscore
        $cleanKey = preg_replace('/[\s\W]+/', '_', $cleanKey);
        
        $normalized[$cleanKey] = $value;
    }
    return $normalized;
}
private function sanitizeDate($value): ?string
{
    if (empty($value) || !is_string($value) || strcasecmp(trim($value), 'N/A') === 0) {
        return null;
    }

    $value = trim($value);

    // Handle multi-dates like '11/14/2023 & 2/28/2024' - split and take the first
    if (strpos($value, '&') !== false) {
        $parts = explode('&', $value);
        $value = trim($parts[0]); // Take first date
    }

    // Handle 'FY YYYY' - convert to 'YYYY-01-01' or null if not date-like
    if (preg_match('/^FY\s*(\d{4})$/i', $value, $matches)) {
        return $matches[1] . '-01-01'; // Assume start of fiscal year
    }

    try {
        if (is_numeric($value)) {
            return \Carbon\Carbon::createFromTimestamp(($value - 25569) * 86400)->format('Y-m-d');
        }
        return \Carbon\Carbon::parse($value)->format('Y-m-d');
    } catch (\Exception $e) {
        Log::warning("Could not parse date value: '{$value}'. It will be saved as NULL.");
        return null;
    }
}
private function sanitizeCurrency($value): ?float
{
    if (empty($value)) return null;
    $cleaned = preg_replace('/[^\d.]/', '', (string)$value);
    return is_numeric($cleaned) ? (float)$cleaned : null;
}
}