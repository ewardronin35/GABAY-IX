<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

// ✅ NOTE: Do NOT implement ShouldQueue here. 
// The individual sheet imports below (Beneficiary & Monitoring) handle the queueing.
class EstatskolarMultiSheetImport implements WithMultipleSheets 
{
    private $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function sheets(): array
    {
        return [
            // These classes implement ShouldQueue, so they will run in the background automatically.
            'E-1_Beneficiaries' => new EstatskolarBeneficiaryImport($this->userId),
            'E-2_Transaction and Monitoring' => new EstatskolarMonitoringImport($this->userId),
        ];
    }
}