<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany; // Import this

class Itinerary extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function items(): HasMany
    {
        return $this->hasMany(ItineraryItem::class);
    }

    // Add this method for the polymorphic relationship
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}