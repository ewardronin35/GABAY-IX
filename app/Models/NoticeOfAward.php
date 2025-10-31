<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoticeOfAward extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholar_id',
        'batch_id',
        'status',
        'generated_file_path',
        'accepted_at',
    ];

    /**
     * Get the scholar this notice belongs to.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }

    /**
     * Get the NOA batch that this notice was part of.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
}