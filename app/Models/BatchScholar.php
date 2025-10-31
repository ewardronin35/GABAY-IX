<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchScholar extends Model
{
    use HasFactory;

    protected $fillable = ['batch_id', 'scholar_id'];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }
}