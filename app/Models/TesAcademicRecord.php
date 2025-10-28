<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TesAcademicRecord extends Model
{
    use HasFactory;
    protected $guarded = [];

    /**
     * Get the scholar that owns the academic record.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(TesScholar::class, 'tes_scholar_id');
    }

    /**
     * Get the HEI associated with the academic record.
     */
    public function hei(): BelongsTo
    {
        return $this->belongsTo(HEI::class);
    }

    /**
     * Get the course associated with the academic record.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}