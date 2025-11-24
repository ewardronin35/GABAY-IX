<?php

namespace App\Jobs;

use App\Imports\MasterlistImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class ProcessMasterlistImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour timeout for large files

    public function __construct(
        protected string $filePath,
        protected int $programId,
        protected int $userId
    ) {
    }

    public function handle(): void
    {
        Log::info("Starting Import. Program: {$this->programId}, User: {$this->userId}");

        // FIX: Passed $this->userId as the second argument
        Excel::import(new MasterlistImport($this->programId, $this->userId), $this->filePath);
        
        Log::info("Import process finished.");
    }
}