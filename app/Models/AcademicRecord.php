<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AcademicRecord extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(ScholarEnrollment::class, 'scholar_enrollment_id');
    }

    public function hei(): BelongsTo
    {
        return $this->belongsTo(HEI::class);
    }

    public function billingRecord(): HasOne
    {
        return $this->hasOne(BillingRecord::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
    
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }
    public function major(): BelongsTo
    {
        return $this->belongsTo(Major::class);
    }
}