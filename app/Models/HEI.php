<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- ADD THIS
use Illuminate\Database\Eloquent\Relations\HasMany;

class HEI extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'heis';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // --- ▼▼▼ UPDATED FILLABLE ARRAY ▼▼▼ ---
    protected $fillable = [
        'hei_name',
        'hei_code',
        'type_of_heis',
        'province_id', // Replaces 'province'
        'city_id',     // Replaces 'city'
        'district_id', // Replaces 'district'
    ];
    // --- ▲▲▲ END OF UPDATE ▲▲▲ ---

    
    // --- ▼▼▼ NEW NORMALIZED RELATIONSHIPS ▼▼▼ ---

    /**
     * Get the province that this HEI belongs to.
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * Get the city that this HEI belongs to.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get the district that this HEI belongs to.
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    // --- ▲▲▲ END OF NEW RELATIONSHIPS ▲▲▲ ---


    /**
     * Get all of the education records for the HEI.
     * This connects to your OLD schema.
     */
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class);
    }

    /**
     * Get all of the enrollments for the HEI.
     * This connects to your NEW consolidated schema.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(ScholarEnrollment::class, 'hei_id');
    }

    /**
     * Get all of the academic records for the HEI.
     * This also connects to your NEW consolidated schema.
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class, 'hei_id');
    }
}