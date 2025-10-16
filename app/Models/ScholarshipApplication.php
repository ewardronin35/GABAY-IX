<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarshipApplication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id', 'status', 'last_name', 'first_name', 'middle_name', 'suffix',
        'birthdate', 'place_of_birth', 'sex', 'civil_status', 'citizenship',
        'mobile_number', 'email_address', 'permanent_address', 'zip_code', 'distinctive_marks',
        'father_status', 'father_name', 'father_address', 'father_occupation', 'father_educational_attainment',
        'mother_status', 'mother_name', 'mother_address', 'mother_occupation', 'mother_educational_attainment',
        'parents_combined_income', 'siblings_above_18', 'siblings_below_18', 'spouse_name',
        'shs_name', 'shs_address', 'shs_track', 'shs_strand', 'shs_gwa',
        'college_name', 'college_address', 'college_course',
        'other_scholarship_name', 'other_scholarship_year',
        'doc_birth_certificate', 'doc_good_moral', 'doc_report_card', 'doc_school_registration',
        'doc_voters_certificate', 'doc_parent_voters_certificate', 'doc_proof_of_income', 'doc_certificate_of_indigency',
    ];

    /**
     * Get the user that owns the application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}