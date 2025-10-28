<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCsmpScholarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * A user must be logged in to apply.
     */
    public function authorize(): bool
    {
        return $this->user() != null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // These rules map directly to your form fields
        return [
            'academic_year' => 'required|string|max:10',
            'semester' => 'required|string|max:20',
            'assistance_type' => 'required|string|max:100',
            'is_priority_course' => 'required|boolean',

            'family_name' => 'required|string|max:255',
            'given_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            
            'street' => 'nullable|string|max:255',
            'barangay' => 'required|string|max:255',
            'city_municipality' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'zip_code' => 'nullable|string|max:10',
            
            'sex' => 'required|string|max:10',
            'civil_status' => 'required|string|max:50',
            'birth_date' => 'required|date',
            'birth_place' => 'required|string|max:255',
            'citizenship' => 'required|string|max:50',
            'mobile_no' => 'required|string|max:20',
            
            'disability' => 'nullable|string|max:255',
            'is_indigenous' => 'required|boolean',
            'indigenous_group' => 'nullable|required_if:is_indigenous,true|string|max:100',

            'father_name' => 'nullable|string|max:255',
            'father_status' => 'nullable|string|max:50',
            'father_address' => 'nullable|string',
            'father_occupation' => 'nullable|string|max:255',
            'father_education' => 'nullable|string|max:255',

            'mother_name' => 'nullable|string|max:255',
            'mother_status' => 'nullable|string|max:50',
            'mother_address' => 'nullable|string',
            'mother_occupation' => 'nullable|string|max:255',
            'mother_education' => 'nullable|string|max:255',

            'siblings_count' => 'nullable|integer|min:0',
            'family_income' => 'required|numeric|min:0',
            'is_4ps_beneficiary' => 'required|boolean',

            'last_school_name' => 'required|string|max:255',
            'last_school_address' => 'required|string',
            'last_school_type' => 'required|string|max:50',
            'school_level' => 'required|string|max:50',
            'course' => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:20',
            'gwa' => 'required|numeric|min:0|max:100', // Assuming 0-100 scale
        ];
    }
}