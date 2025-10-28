<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Education extends Model
{
    use HasFactory;

    protected $table = 'education';

    protected $fillable = [
        'scholar_id',
        'hei_id',
        'course_id', // Replaced 'program'
        'school_id_number', // Added school-specific ID
        'priority_program_tagging',
        'course_code',
    ];

    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }

    public function hei(): BelongsTo
    {
        return $this->belongsTo(HEI::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}