<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        // Links
        'user_id',
        'travel_order_id',
        
        // Claim Info
        'claim_code',
        'actual_total_amount',
        'cash_advance', // Kept this if you need to compute refunds
        
        // Workflow / Approval
        'status', // 'Submitted', 'Verified', 'Paid'
        'remarks',
        'recommending_officer_id',
        'approving_officer_id',
        
        // Timestamps
        'submitted_at',
        'processed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
        'actual_total_amount' => 'decimal:2',
        'cash_advance' => 'decimal:2',
    ];

    /**
     * The employee who filed the claim.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The approved Travel Order this claim is based on.
     */
    public function travelOrder()
    {
        return $this->belongsTo(TravelOrder::class);
    }

    /**
     * The Chief/Officer who recommends approval.
     */
    public function recommendingOfficer()
    {
        return $this->belongsTo(User::class, 'recommending_officer_id');
    }

    /**
     * The RD who gives final approval for payment.
     */
    public function approvingOfficer()
    {
        return $this->belongsTo(User::class, 'approving_officer_id');
    }

    /**
     * The list of itinerary stops (Normalized).
     * Note: Changed to hasMany because a claim has multiple stops.
     */
    public function itineraries()
    {
        return $this->hasMany(Itinerary::class);
    }

    /**
     * The list of expense receipts (Normalized).
     * Note: Changed to hasMany because a claim has multiple receipts.
     */
    public function rers()
    {
        return $this->hasMany(Rer::class);
    }

    /**
     * Polymorphic attachments (Receipt images, certificates).
     */
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}