<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TdpAcademicRecord extends Model
{
    use HasFactory;
    protected $guarded = [];

    /**
     * Get the scholar that owns this academic record.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(TdpScholar::class, 'tdp_scholar_id');
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