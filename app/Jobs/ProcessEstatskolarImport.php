<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EstatskolarMultiSheetImport;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessEstatskolarImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        try {
            Excel::import(new EstatskolarMultiSheetImport(), $this->filePath);
            
            Log::info("Estatskolar multi-sheet import job completed successfully.");

        } catch (\Throwable $e) {
            Log::error("Estatskolar multi-sheet import job failed. Error: " . $e->getMessage());
            
            // ✅ ADD THIS LINE
            // This tells the queue that the job FAILED and it should be
            // moved to the 'failed_jobs' table.
            throw $e; 

        } finally {
            // This will run whether the job succeeds or fails
            if (Storage::exists($this->filePath)) {
                Storage::delete($this->filePath);
            }
        }
    }
}