<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TravelClaim extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function itinerary(): HasOne
    {
        return $this->hasOne(Itinerary::class);
    }

    public function appendixB(): HasOne
    {
        return $this->hasOne(AppendixB::class);
    }

    public function rer(): HasOne
    {
        return $this->hasOne(Rer::class);
    }

    public function travelReport(): HasOne
    {
        return $this->hasOne(TravelReport::class);
    }
    
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}