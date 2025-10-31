<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // 👈 1. Add Log
use Illuminate\Validation\ValidationException; // 👈 2. Add ValidationException

class UploadController extends Controller
{
    /**
     * Process the chunked or single file upload from FilePond.
     */
    public function process(Request $request)
    {
        try {
            // 3. Add validation (matches your FilePondUploader)
            $request->validate([
                'attachments' => 'required|file|mimes:pdf,png,jpg,jpeg|max:3072', // 3MB max
            ]);

            if ($request->hasFile('attachments')) {
                $file = $request->file('attachments');
                
                // Using 'private' disk, which maps to 'storage/app/private'
                $path = $file->store('tmp', 'private'); 

                Log::info('UploadController: File processed successfully', ['path' => $path]);

                // Return the unique server ID (the path) for FilePond to track
                return response($path, 200)->header('Content-Type', 'text/plain');
            }
            
            Log::warning('UploadController: "attachments" file not found in request.');
            return response('No file uploaded.', 400);

        } catch (ValidationException $e) {
            // 4. Catch validation errors
            Log::error('UploadController Validation Error: ', $e->errors());
            
            // Return the first validation error message as plain text
            // FilePond will show this error to the user!
            $errorMessage = $e->errors()['attachments'][0] ?? 'Validation failed';
            return response($errorMessage, 422)
                   ->header('Content-Type', 'text/plain');
                   
        } catch (\Exception $e) {
            // 5. Catch all other errors (e.g., disk permissions)
            Log::error('UploadController Exception: ' . $e->getMessage());
            return response('Server error during upload.', 500)
                   ->header('Content-Type', 'text/plain');
        }
    }

    /**
     * Revert a file upload from FilePond.
     */
    public function revert(Request $request)
    {
        $filePath = $request->getContent();
        Log::info('UploadController Revert: Attempting to delete', ['path' => $filePath]);

        if ($filePath && Storage::disk('private')->exists($filePath)) {
            Storage::disk('private')->delete($filePath);
            Log::info('UploadController Revert: Success', ['path' => $filePath]);
            return response('File reverted.', 200);
        }

        Log::warning('UploadController Revert: File not found', ['path' => $filePath]);
        return response('File not found.', 404);
    }
}