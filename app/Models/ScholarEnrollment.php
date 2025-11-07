<?php
// app/Models/ScholarEnrollment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScholarEnrollment extends Model
{
    use HasFactory;

    /**
     * Allow mass assignment for all fields.
     * We will be careful in our migration script.
     */
    protected $guarded = [];

    /**
     * Get the scholar (the person) this enrollment belongs to.
     */
    public function scholar()
    {
        return $this->belongsTo(Scholar::class);
    }

    /**
     * Get the scholarship program this enrollment is for.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the HEI associated with this enrollment.
     */
    public function hei()
    {
        return $this->belongsTo(HEI::class);
    }

    /**
     * Get all the academic records for this specific enrollment.
     */
    public function academic_records()
    {
        return $this->hasMany(AcademicRecord::class);
    }
}