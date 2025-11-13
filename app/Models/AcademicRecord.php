<?php
// app/Models/AcademicRecord.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    public function enrollment()
    {
        return $this->belongsTo(ScholarEnrollment::class, 'scholar_enrollment_id');
    }

    /**
     * Get the HEI for this specific academic record.
     */
    public function hei()
    {
        return $this->belongsTo(HEI::class);
    }

    /**
     * Get the Course for this specific academic record.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}