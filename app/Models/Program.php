<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = ['program_name', 'description'];

    /**
     * Get all the enrollments for this program.
     */
    public function enrollments()
    {
        return $this->hasMany(ScholarEnrollment::class);
    }

    /**
     * Get all the scholars enrolled in this program.
     */
    public function scholars()
    {
        return $this->belongsToMany(Scholar::class, 'scholar_enrollments');
    }

    /**
     * ✅ ADD THIS: The missing relationship to Requirements
     */
    public function requirements()
    {
        return $this->belongsToMany(Requirement::class, 'program_requirements')
                    ->withPivot('is_required')
                    ->withTimestamps();
    }

    public function getAcademicYears(): array
    {
        return AcademicRecord::query()
            ->whereHas('enrollment', fn($q) => $q->where('program_id', $this->id))
            ->distinct()->orderBy('academic_year', 'desc')
            ->pluck('academic_year')->toArray();
    }
}