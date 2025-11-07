<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = ['program_name', 'description'];

   // In app/Models/Program.php

/**
 * Get all the enrollments for this program.
 */
public function enrollments()
{
    return $this->hasMany(ScholarEnrollment::class);
}

/**
 * Get all the scholars enrolled in this program.
 */
public function scholars()
{
    return $this->belongsToMany(Scholar::class, 'scholar_enrollments');
}
}