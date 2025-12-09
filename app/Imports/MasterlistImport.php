<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Illuminate\Support\Facades\Log;
use App\Models\Program;


class MasterlistImport implements WithMultipleSheets
{
    private $programId;
    private $uploaderId;

    public function __construct($programId, $uploaderId)
    {
        $this->programId = $programId;
        $this->uploaderId = $uploaderId;
    }

    public function sheets(): array
    {
        Log::info('Masterlist Import Started. Program ID: ' . $this->programId);

        $program = Program::find($this->programId);
        
        // ✅ FIX: Only check program_name
        $isTes = $program && str_contains($program->program_name, 'TES');

        if ($isTes) {
            return [
                0 => new TesProfileImport($this->programId, $this->uploaderId),
                1 => new TesFinancialImport($this->programId),
                2 => new TesFinancialImport($this->programId),
            ];
        }

        return [
            0 => new TdpProfileImport($this->programId, $this->uploaderId),
            1 => new TdpFinancialImport($this->programId),
            2 => new TdpFinancialImport($this->programId),
        ];
    }
}