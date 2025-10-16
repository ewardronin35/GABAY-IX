<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ScholarshipApplicationController extends Controller
{
    /**
     * Store or update the scholarship application.
     */
    public function store(Request $request): RedirectResponse
    {
        // --- 1. VALIDATION ---
        // Maps frontend field names (camelCase) to validation rules
        $validated = $request->validate([
            // Personal
            'lastName' => 'required|string|max:255',
            'firstName' => 'required|string|max:255',
            'middleName' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birthdate' => 'required|date',
            'placeOfBirth' => 'required|string|max:255',
            'sex' => 'required|string|max:10',
            'civilStatus' => 'required|string|max:255',
            'citizenship' => 'required|string|max:255',
            'mobileNumber' => 'required|string|max:20',
            'email' => 'required|email',
            'permanentAddress' => 'required|string',
            'zipCode' => 'required|string|max:10',
            'distinctiveMarks' => 'nullable|string|max:255',

            // Family
            'fatherStatus' => 'nullable|string',
            'fatherName' => 'nullable|string|max:255',
            // ... add all other family background validations
            'parentsCombinedIncome' => 'required|numeric|min:0',
            'siblingsAbove18' => 'required|integer|min:0',
            'siblingsBelow18' => 'required|integer|min:0',

            // Education
            'shsName' => 'required|string|max:255',
            // ... add all other education validations
            'shsGwa' => 'required|numeric|between:0,100',

            // Documents (validating that they are files)
            'doc_birth_certificate' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'doc_good_moral' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'doc_report_card' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'doc_proof_of_income' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            // ... add validation for the rest of the documents
        ]);

        // --- 2. DATA MAPPING ---
        // Maps validated frontend data (camelCase) to database columns (snake_case)
        $dataToSave = [
            'last_name' => $validated['lastName'],
            'first_name' => $validated['firstName'],
            // ... map all other text-based fields here
        ];

        // --- 3. FILE HANDLING ---
        $documentFields = [
            'doc_birth_certificate', 'doc_good_moral', 'doc_report_card', 'doc_school_registration',
            'doc_voters_certificate', 'doc_parent_voters_certificate', 'doc_proof_of_income', 'doc_certificate_of_indigency'
        ];
        
        foreach ($documentFields as $field) {
            if ($request->hasFile($field)) {
                // Delete the old file if it exists, to prevent orphaned files
                $application = ScholarshipApplication::firstWhere('user_id', Auth::id());
                if ($application && $application->$field) {
                    Storage::disk('public')->delete($application->$field);
                }

                // Store the new file and get its path
                $path = $request->file($field)->store('documents/' . Auth::id(), 'public');
                $dataToSave[$field] = $path;
            }
        }
        
        // --- 4. SAVE TO DATABASE ---
        ScholarshipApplication::updateOrCreate(
            ['user_id' => Auth::id()], // Find the application by the user's ID
            $dataToSave // Update it with the new data, or create it if it doesn't exist
        );

        return redirect()->route('dashboard')->with('success', 'Application saved successfully!');
    }
}