<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Imports\StufapImport; // We will create this import class next
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class ProcessStufapImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // This property will hold the path to the temporary file
    protected string $filePath;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    /**
     * Execute the job.
     * This is where the heavy lifting happens.
     */
    public function handle(): void
    {
        // Get the full, absolute path to the file in the storage directory
        $fullPath = Storage::path($this->filePath);

        Log::info("Queue Worker: Starting StuFAPs import for file: {$this->filePath}");

        try {
            // Use the StufapImport class to process the Excel file
            Excel::import(new StufapImport, $fullPath);

            Log::info("Queue Worker: Successfully imported {$this->filePath}.");

        } catch (\Exception $e) {
            // If any error occurs during the import, log it in detail
            Log::error("Queue Worker: StuFAPs Import Failed.", [
                'file' => $this->filePath,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString() // Provides the full error stack trace for debugging
            ]);
        } finally {
            // This block always runs, ensuring the temporary file is deleted
            // whether the import succeeds or fails.
            if (Storage::exists($this->filePath)) {
                Storage::delete($this->filePath);
                Log::info("Queue Worker: Cleaned up temporary file: {$this->filePath}");
            }
        }
    }
}