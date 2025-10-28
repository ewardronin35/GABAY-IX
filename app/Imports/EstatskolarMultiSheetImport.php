<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EstatskolarMultiSheetImport implements WithMultipleSheets 
{
    /**
     * This method maps your sheet names to their dedicated import classes.
     * The package will automatically find these sheets by name, regardless of
     * their order in the Excel file.
     *
     * Any other sheets in the file that are not listed here will be safely ignored.
     */
    public function sheets(): array
    {
        return [
            'E-1_Beneficiaries' => new EstatskolarBeneficiaryImport(),
            'E-2_Transaction and Monitoring' => new EstatskolarMonitoringImport(),
        ];
    }
}