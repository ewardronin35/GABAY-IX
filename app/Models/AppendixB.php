<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppendixB extends Model
{
    use HasFactory;

    // This ensures it uses the 'appendix_b_s' table
    protected $table = 'appendix_b_s';

    protected $fillable = [
        'travel_claim_id',
        'narration',
        'observations_recommendations',
        'submitted_at',
        'noted_by',
    ];

    /**
     * Get the travel claim that this report belongs to.
     */
    public function travelClaim()
    {
        return $this->belongsTo(TravelClaim::class);
    }
}