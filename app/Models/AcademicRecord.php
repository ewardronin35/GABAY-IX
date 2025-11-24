<?php
// app/Models/AcademicRecord.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// --- ADD THESE TWO LINES ---
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
// --- END OF FIX ---

class AcademicRecord extends Model
{
    use HasFactory;

    /**
     * Allow mass assignment for all fields.
     */
    protected $guarded = [];

    /**
     * Get the scholar enrollment that this record belongs to.
     */
    public function enrollment(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(ScholarEnrollment::class, 'scholar_enrollment_id');
    }

    /**
     * Get the HEI for this specific academic record.
     */
    public function hei(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(HEI::class);
    }

    // --- THIS IS YOUR NEW, CORRECT FUNCTION ---
    public function billingRecord(): HasOne
    {
        return $this->hasOne(BillingRecord::class);
    }
    // --- END OF FIX ---

    /**
     * Get the Course for this specific academic record.
     */
    public function course(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(Course::class);
    }
    
    public function major(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(Major::class);
    }
    
    /**
     * Get the academic year this record belongs to.
     */
    public function academicYear(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function semester(): BelongsTo // <-- Added BelongsTo type
    {
        return $this->belongsTo(Semester::class);
    }
}