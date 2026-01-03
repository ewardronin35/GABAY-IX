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
public function relatives()
    {
        return $this->hasMany(ScholarRelative::class);
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

    public function batchScholars(): HasMany
{
    return $this->hasMany(BatchScholar::class);
}
public function enrollments()
{
    return $this->hasMany(ScholarEnrollment::class);
}

/**
 * Get all the programs this scholar is enrolled in.
 */
public function programs()
{
    return $this->belongsToMany(Program::class, 'scholar_enrollments');
}

public function records()
{
    return $this->hasManyThrough(
        AcademicRecord::class,
        ScholarEnrollment::class,
        'scholar_id',           // Foreign key on scholar_enrollments table
        'scholar_enrollment_id', // Foreign key on academic_records table
        'id',                   // Local key on scholars table
        'id'                    // Local key on scholar_enrollments table
    );
}
// REMOVE or FIX the 'program()' relationship if it doesn't exist on the scholars table!
// If you want to access the program easily, you can define a "Has One Through" relationship:
public function latestProgram()
{
    return $this->hasOneThrough(
        Program::class, 
        ScholarEnrollment::class, 
        'scholar_id',    // Foreign key on scholar_enrollments table
        'id',            // Foreign key on programs table
        'id',            // Local key on scholars table
        'program_id'     // Local key on scholar_enrollments table
    );
}
}