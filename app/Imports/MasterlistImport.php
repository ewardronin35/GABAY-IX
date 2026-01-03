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
        
        // Check if program is TES (Safe check for null and Upper case)
        $isTes = $program && str_contains(strtoupper($program->program_name), 'TES');

        if ($isTes) {
            // ✅ FIX: Only return index 0. 
            // The new TesProfileImport now handles ALL columns (Profile + Billing) on the first sheet.
            return [
                0 => new TesProfileImport($this->programId, $this->uploaderId),
            ];
        }

        // ✅ FIX: Same for TDP. Only return index 0.
        return [
            0 => new TdpProfileImport($this->programId, $this->uploaderId),
        ];
    }
}