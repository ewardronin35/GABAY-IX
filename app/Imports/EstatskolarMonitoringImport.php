<?php

namespace App\Imports;

use App\Models\Estatskolar;
use App\Models\EstatskolarMonitoring;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class EstatskolarMonitoringImport implements ToModel, WithHeadingRow
{
    /**
     * This tells the importer that the headers are on Row 10.
     */
    public function headingRow(): int
    {
        return 10;
    }

    public function model(array $row)
    {
        if (!isset($row['award_number']) || empty($row['award_number'])) {
            Log::warning('[Monitoring Import] Skipping row. Missing award_number.', $row);
            return null;
        }

        $scholar = Estatskolar::where('award_number', $row['award_number'])->first();

        if (!$scholar) {
            Log::warning('[Monitoring Import] Estatskolar not found for award number: ' . $row['award_number']);
            return null;
        }
        
        // This will now find the *first* record for a scholar and update it.
        // It will overwrite existing data from other years.
        EstatskolarMonitoring::updateOrCreate(
            [
                'estatskolar_id' => $scholar->id,
            ],
            [
                // These keys match your Excel headers (e.g., "CURRENT YEAR LEVEL 1ST SEM, AY _____")
                'current_year_level_1st_sem' => $row['current_year_level_1st_sem_ay_'] ?? null,
                'status_1st_semester' => $row['status_1st_semester_ay_'] ?? null,
                'osds_fund_release_amount_1st_semester' => $row['osds_fund_release_amount_1st_semester_ay_'] ?? null,
                'osds_fund_release_date_1st_semester' => isset($row['osds_fund_release_date_1st_semester_ay_']) ? Date::excelToDateTimeObject($row['osds_fund_release_date_1st_semester_ay_']) : null,
                'chedro_payment_amount_1st_semester' => $row['chedro_payment_amount_1st_semester_ay_'] ?? null,
                'chedro_payment_date_1st_semester' => isset($row['chedro_payment_date_1st_semester_ay_']) ? Date::excelToDateTimeObject($row['chedro_payment_date_1st_semester_ay_']) : null,
                'mode_of_payment_1st_semester' => $row['mode_of_payment_1st_semester_ay_'] ?? null,
                
                'current_year_level_2nd_sem' => $row['current_year_level_2nd_sem_ay_'] ?? null,
                'status_2nd_semester' => $row['status_2nd_semester_ay_'] ?? null,
                'osds_fund_release_amount_2nd_semester' => $row['osds_fund_release_amount_2nd_semester_ay_'] ?? null,
                'osds_fund_release_date_2nd_semester' => isset($row['osds_fund_release_date_2nd_semester_ay_']) ? Date::excelToDateTimeObject($row['osds_fund_release_date_2nd_semester_ay_']) : null,
                'chedro_payment_amount_2nd_semester' => $row['chedro_payment_amount_2nd_semester_ay_'] ?? null,
                'chedro_payment_date_2nd_semester' => isset($row['chedro_payment_date_2nd_semester_ay_']) ? Date::excelToDateTimeObject($row['chedro_payment_date_2nd_semester_ay_']) : null,
                'mode_of_payment_2nd_semester' => $row['mode_of_payment_2nd_semester_ay_'] ?? null,
                
                'remarks' => $row['remarks'] ?? null,
            ]
        );
        
        return null; 
    }
}