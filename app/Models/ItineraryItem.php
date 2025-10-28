<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_id',
        'date',
        'place',
        'arrival_time',
        'departure_time',
        'mode_of_transport',
        'amount',
    ];

    /**
     * Get the itinerary that this item belongs to.
     */
    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }
}