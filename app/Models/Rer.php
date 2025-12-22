<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rer extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_claim_id',
        'or_date',
        'or_number',
        'description', // The item purchased (e.g. "Bus Ticket")
        'amount',      // The cost
        'expense_type' // Optional category
    ];

    protected $casts = [
        'or_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Link back to the parent Claim.
     */
    public function travelClaim()
    {
        return $this->belongsTo(TravelClaim::class);
    }

}