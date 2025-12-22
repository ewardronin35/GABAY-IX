<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Itinerary extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_claim_id',
        'date',
        'place_visited',
        'departure_time',
        'arrival_time',
        'means_of_transport',
        'transport_cost',
        'per_diem',
        'other_expenses'
    ];

    protected $casts = [
        'date' => 'date',
        // 'departure_time' and 'arrival_time' are typically strings (H:i) or Carbon instances
        'transport_cost' => 'decimal:2',
        'per_diem' => 'decimal:2',
        'other_expenses' => 'decimal:2',
    ];

    public function travelClaim()
    {
        return $this->belongsTo(TravelClaim::class);
    }

    /**
     * Get the items for the itinerary.
     */
    public function items()
    {
        return $this->hasMany(ItineraryItem::class);
    }
}