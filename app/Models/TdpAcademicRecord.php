<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TdpAcademicRecord extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = []; // ✅ <-- THIS IS THE FIX

    /**
     * Get the scholar that this record belongs to.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(TdpScholar::class, 'tdp_scholar_id');
    }

    /**
     * Get the HEI that this record belongs to.
     */
    public function hei(): BelongsTo
    {
        return $this->belongsTo(Hei::class);
    }

    /**
     * Get the course that this record belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}