<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'moed_no',
        'date_filed',
        'position',
        'official_station',
        'purpose',
        'places_to_be_visited',
        'date_of_travel',
        'duration_days',
        'source_of_fund',
        'per_diems',
        'transportation',
        'others_amount',
        'others_specify',
        'total_amount',
        'cash_advance',
        'recommending_approval_name',
        'recommending_approval_designation',
        'approved_by_name',
        'approved_by_designation',
        'status',
    ];

    /**
     * Get the user who owns the travel claim.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the itinerary for the travel claim.
     */
    public function itinerary()
    {
        return $this->hasOne(Itinerary::class);
    }

    /**
     * Get the Appendix B (travel report) for the travel claim.
     */
    public function appendixB()
    {
        return $this->hasOne(AppendixB::class);
    }

    /**
     * Get the RER (expense receipt) for the travel claim.
     */
    public function rer()
    {
        return $this->hasOne(Rer::class);
    }

    /**
     * Get all of the attachments for the travel claim.
     */
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}