<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholar_id', 'brgy_street', 'town_city', 'province', 'congressional_district',
    ];

    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }
}
