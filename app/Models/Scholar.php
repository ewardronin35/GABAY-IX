<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scholar extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * These fields represent the core, stable information about the scholar.
     */
    protected $fillable = [
        'program_id', // e.g., "Tertiary Education Subsidy"
        'family_name',
        'given_name',
        'middle_name',
        'extension_name',
        'sex',
        'date_of_birth',
        'registered_coconut_farmer',
        'farmer_registry_no',
        'special_group',
        'is_solo_parent',
        'is_senior_citizen',
        'is_pwd',
        'is_ip',
        'is_first_generation',
        'contact_no',
        'email_address',
        'seq',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_solo_parent' => 'boolean',
        'is_senior_citizen' => 'boolean',
        'is_pwd' => 'boolean',
        'is_ip' => 'boolean',
        'is_first_generation' => 'boolean',
    ];

    public function address(): HasOne
    {
        return $this->hasOne(Address::class);
    }

    public function education(): HasOne
    {
        return $this->hasOne(Education::class);
    }

    public function academicYears(): HasMany
    {
        return $this->hasMany(AcademicYear::class);
    }
    public function program(): BelongsTo
{
    return $this->belongsTo(Program::class);
}

    // The tes() relationship is no longer needed.
}