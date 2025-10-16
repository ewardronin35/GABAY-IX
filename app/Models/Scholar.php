<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Scholar extends Model
{
    use HasFactory;

    protected $fillable = [
        'award_year', 'program_name', 'status_type', 'region', 'award_number',
        'family_name', 'given_name', 'middle_name', 'extension_name', 'sex', 'date_of_birth',
        'registered_coconut_farmer', 'farmer_registry_no', 'special_group',
        'is_solo_parent', 'is_senior_citizen', 'is_pwd', 'is_ip', 'is_first_generation',
        'contact_no', 'email_address'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_solo_parent' => 'boolean',
        'is_senior_citizen' => 'boolean',
        'is_pwd' => 'boolean',
        'is_ip' => 'boolean',
        'is_first_generation' => 'boolean',
    ];

    /**
     * Get the address associated with the scholar.
     */
    public function address(): HasOne
    {
        return $this->hasOne(Address::class);
    }

    /**
     * Get the education details for the scholar.
     */
    public function education(): HasOne
    {
        return $this->hasOne(Education::class);
    }

    /**
     * Get the academic year records for the scholar.
     */
    public function academicYears(): HasMany
    {
        return $this->hasMany(AcademicYear::class);
    }
    public function tes(): HasOne
    {
        return $this->hasOne(Tes::class);
    }
}
