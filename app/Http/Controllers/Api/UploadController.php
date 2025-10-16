<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function process(Request $request)
    {
        // We use the 'attachments' field name configured in FilePond
        if ($request->hasFile('attachments')) {
            $file = $request->file('attachments')[0]; // FilePond sends an array
            $path = $file->store('tmp', 'public'); // Store in 'storage/app/public/tmp'
            
            // Return the unique server ID for FilePond to track
            return response($path, 200)->header('Content-Type', 'text/plain');
        }

        return response('No file uploaded.', 400);
    }

    public function revert(Request $request)
    {
        // Get the temporary file path from the request body
        $filePath = $request->getContent();

        // Check if the file exists in the temp storage and delete it
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
            return response('File reverted.', 200);
        }

        return response('File not found.', 404);
    }
}