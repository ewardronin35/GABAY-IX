<?php

namespace App\Jobs;

use App\Imports\TdpImport;
use App\Models\ImportLog; // Assuming you have this from our last step
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;      // <-- ADD THIS
use Illuminate\Support\Facades\Storage; // <-- ADD THIS

class ProcessTdpImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Use protected variables to match your TdpController
    protected $filePath;
    
    // --- IF YOU ARE NOT USING THE ImportLog model, remove it ---
    // protected $importLog;
    // public function __construct(ImportLog $importLog, string $filePath)
    // {
    //     $this->importLog = $importLog;
    //     $this->filePath = $filePath;
    // }

    // --- IF YOU ARE JUST PASSING THE PATH, USE THIS ---
    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }


    public function handle(): void
    {
        // 1. Log that the job has started
        Log::info("ProcessTdpImport Job Started. Attempting to process: " . $this->filePath);

        // 2. Check if the file exists on the disk
        // We assume 'private' disk based on your controller
        if (!Storage::disk('private')->exists($this->filePath)) {
            Log::error("TDP Import FAILED: File not found at path: " . $this->filePath);
            // if ($this->importLog) $this->importLog->update(['status' => 'failed', 'errors' => ['File not found']]);
            return; // Stop the job
        }

        // 3. Log that we are about to import
        Log::info("File found. Starting Excel::import...");
        
        // if ($this->importLog) $this->importLog->update(['status' => 'processing']);

        try {
            $import = new TdpImport;
            
            // 4. Run the import
            Excel::import($import, $this->filePath, 'private');

            // 5. Log that we finished the import
            $skippedRows = $import->getSkippedRows();
            $skippedCount = count($skippedRows);
            Log::info("Excel::import complete. Skipped rows: " . $skippedCount);

            // 6. Log the skipped rows if there are any
            if ($skippedCount > 0) {
                Log::warning("TDP Import Skipped Rows:", $skippedRows);
            }
            
            // if ($this->importLog) $this->importLog->update(['status' => 'completed', 'rows_skipped' => $skippedCount, 'errors' => $skippedRows]);
            
        } catch (\Exception $e) {
            // 4. Handle failure
            Log::error('TDP Import Job FAILED: ' . $e->getMessage());
            // if ($this->importLog) $this->importLog->update(['status' => 'failed', 'errors' => ['error' => $e->getMessage()]]);
        }

        Log::info("ProcessTdpImport Job Finished.");
    }
}