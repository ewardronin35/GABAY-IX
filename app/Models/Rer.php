<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rer extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_claim_id',
        'sheet_no',
        'total_amount',
        'cash_advance',
        'amount_reimbursed',
        'amount_refunded',
    ];

    /**
     * Get the travel claim that this RER belongs to.
     */
    public function travelClaim()
    {
        return $this->belongsTo(TravelClaim::class);
    }

    /**
     * Get the items for the RER.
     */
    public function items()
    {
        return $this->hasMany(RerItem::class);
    }
}