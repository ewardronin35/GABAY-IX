<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StufapAcademicRecord extends Model
{
    use HasFactory;
protected $fillable = [
        'stufap_scholar_id',
        'program_id',
        'hei_id',
        'course_id',
        'seq',
        'award_year',
        'award_number',
        'priority_cluster',
        '1st_payment_sem',
        '2nd_payment_sem',
        'curriculum_year',
        'remarks',
        'status_type',
        // Add other relevant fields here
    ];
    /**
     * Get the scholar that owns this academic record.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(StufapScholar::class, 'stufap_scholar_id');
    }
    
    /**
     * Get the program associated with this academic record.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the HEI associated with this academic record.
     */
    public function hei(): BelongsTo
    {
        return $this->belongsTo(Hei::class);
    }

    /**
     * Get the course associated with this academic record.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}