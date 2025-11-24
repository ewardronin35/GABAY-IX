<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'is_active'];

    /**
     * Get all the academic records for this academic year.
     */
    public function academicRecords()
    {
        return $this->hasMany(AcademicRecord::class);
    }
}