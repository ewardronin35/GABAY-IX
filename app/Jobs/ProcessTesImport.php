<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Imports\TesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessTesImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

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
     */
    public function handle(): void
    {
        $fullPath = Storage::path($this->filePath);

        Log::info("Queue Worker: Starting TES import for file: {$this->filePath}");

        try {
            Excel::import(new TesImport, $fullPath);
            Log::info("Queue Worker: Successfully imported {$this->filePath}.");
        } catch (\Exception $e) {
            Log::error("Queue Worker: TES Import Failed.", [
                'file' => $this->filePath,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        } finally {
            // Always clean up the uploaded file after processing
            Storage::delete($this->filePath);
            Log::info("Queue Worker: Cleaned up temporary file: {$this->filePath}");
        }
    }
}