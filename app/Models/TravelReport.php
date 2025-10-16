<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelReport extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function travelClaim(): BelongsTo
    {
        return $this->belongsTo(TravelClaim::class);
    }
}