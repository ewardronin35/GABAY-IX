<?php

namespace App\Imports;

use App\Models\Estatskolar;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log; // Make sure Log is imported

class EstatskolarBeneficiaryImport implements ToModel, WithHeadingRow, WithBatchInserts
{
    /**
     * ✅ ADD THIS METHOD
     * This tells the importer that the headers are on Row 10.
     * It will automatically start reading data from Row 11.
     */
    public function headingRow(): int
    {
        return 10;
    }

    public function model(array $row)
    {
       
      if (config('app.debug')) {
            Log::info('[Beneficiary Import] Processing row:', $row);
        }

        if (!isset($row['award_number']) || empty($row['award_number'])) {
            // ✅ ADD THIS LOG
            Log::warning('[Beneficiary Import] Skipping row. Missing award_number.', $row);
            return null; // Skip rows without an award number
        }

        return new Estatskolar([
            'region' => $row['region'],
            'lrn' => $row['learner_reference_number'],
            'scholarship_type' => $row['scholarshipgrant'],
            'award_number' => $row['award_number'],
            'last_name' => $row['last_name'],
            'first_name' => $row['first_name'],
            'middle_name' => $row['middle_name'],
            'extension_name' => $row['ext'],
            'birthdate' => isset($row['birthdate']) ? Date::excelToDateTimeObject($row['birthdate']) : null,
            'sex' => $row['sex_fm'],
            'civil_status' => $row['civil_status'],
            'brgy_psgc_code' => $row['brgy_psgc_code'],
            'city_psgc_code' => $row['townmunicipality_city_psgc_code'],
            'province_psgc_code' => $row['province_psgc_code'],
            'uii_code' => $row['uii_code'],
            'hei_name' => $row['hei_name'],
            'priority_program_code' => $row['priority_program_code'],
            'program_name' => $row['program_name'],
            'special_equity_group' => $row['special_equity_group'],
            'special_equity_group_type' => $row['special_equity_group_type'],
        ]);
    }

    public function batchSize(): int
    {
        return 200;
    }
}