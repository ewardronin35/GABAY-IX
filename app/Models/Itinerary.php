<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Itinerary extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // ⬇️ **REPLACE THIS**
    // protected $fillable = [
    //     'travel_claim_id',
    //     'total_amount',
    // ];
    
    // ⬇️ **WITH THIS**
    protected $fillable = [
        'travel_claim_id',
        'name',
        'position',
        'official_station',
        'fund_cluster',
        'itinerary_no',
        'date_of_travel',
        'purpose',
        // 'total_amount' // You can add this back if you calculate it in the controller
    ];

    /**
     * Get the travel claim that this itinerary belongs to.
     */
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