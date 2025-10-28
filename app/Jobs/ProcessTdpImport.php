<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Imports\TdpImport; // The import class
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessTdpImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        $fullPath = Storage::path($this->filePath);
        Log::info("Queue Worker: Starting TDP import for file: {$this->filePath}");
        try {
            Excel::import(new TdpImport, $fullPath);
            Log::info("Queue Worker: Successfully imported {$this->filePath}.");
        } catch (\Exception $e) {
            Log::error("Queue Worker: TDP Import Failed.", [
                'file' => $this->filePath, 'message' => $e->getMessage(), 'trace' => $e->getTraceAsString()
            ]);
        } finally {
            if (Storage::exists($this->filePath)) {
                Storage::delete($this->filePath);
                Log::info("Queue Worker: Cleaned up temporary file: {$this->filePath}");
            }
        }
    }
}