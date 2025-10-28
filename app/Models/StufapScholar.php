<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StufapScholar extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Using guarded = [] is a convenient way to allow all fields to be filled.
     */
    protected $fillable = [
        'family_name', 'given_name', 'middle_name', 'extension_name', 'sex',
        'barangay', 'city', 'province', 'congressional_district', 'region',
    ];

    /**
     * The attributes that should be cast to native types.
     * This is useful for converting data types from the database.
     */
    protected $casts = [
        'barangay' => 'string',
        'city' => 'string',
        'province' => 'string',
        'congressional_district' => 'string',
        'region' => 'string',
    ];

    /**
     * Get all of the academic records for the scholar.
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(StufapAcademicRecord::class);
    }
}