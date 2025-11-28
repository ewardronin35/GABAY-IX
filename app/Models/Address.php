<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    /**
     * These are the fields the importer will fill.
     */
    protected $fillable = [
        'scholar_id', 
        'specific_address',  // This is for the street/house no.
        'zip_code',
        
        // These are the new "links" (Foreign Keys)
        'region_id',
        'province_id',
        'city_id',
        'district_id',
        'barangay_id',

        // We can keep these for easy display, but the _id fields are for linking
        'region',
        'province',
        'town_city',
        'congressional_district',
    ];

    /**
     * Get the scholar that this address belongs to.
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }
    
    // NEW: Define the relationships
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
    
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function barangay(): BelongsTo
    {
        // CRITICAL FIX: Specify 'barangay_id' (local key) and 'barangayID' (parent key on barangay table)
        return $this->belongsTo(Barangay::class, 'barangay_id', 'barangayID');
    }
}