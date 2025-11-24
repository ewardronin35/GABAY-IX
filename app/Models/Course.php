<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_name',
        'classification_id' // Changed from 'major'
    ];

    /**
     * Get the classification that owns the course.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(CourseClassification::class, 'classification_id');
    }

    /**
     * The majors that belong to the course.
     */
    public function majors(): BelongsToMany
    {
        return $this->belongsToMany(Major::class, 'course_major', 'course_id', 'major_id');
    }

    /**
     * Get the academic records for the course.
     * (This replaces your old 'educations()' relation)
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }
}