<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'province_id', 'representative'];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function heis(): HasMany
    {
        return $this->hasMany(HEI::class);
    }
}