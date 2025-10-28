<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Process the chunked or single file upload from FilePond.
     */
    public function process(Request $request)
    {
        // We use the 'attachments' field name configured in FilePond
        if ($request->hasFile('attachments')) {
            
            // ⬇️ **THE FIX**
            // FilePond sends one file, so we get it directly.
            // It's not an array, so $request->file('attachments')[0] is incorrect.
            $file = $request->file('attachments');
            
            // Store in 'storage/app/public/tmp'
            $path = $file->store('tmp', 'public');
            
            // Return the unique server ID (the path) for FilePond to track
            return response($path, 200)->header('Content-Type', 'text/plain');
        }

        return response('No file uploaded.', 400);
    }

    /**
     * Revert a file upload from FilePond.
     */
    public function revert(Request $request)
    {
        // Get the temporary file path from the request body
        $filePath = $request->getContent();

        // Check if the file exists in the temp storage and delete it
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
            return response('File reverted.', 200);
        }

        return response('File not found.', 404);
    }
}