<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TesScholar extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    /**
     * Get all of the academic records for the TesScholar.
     * A scholar can have many records over different years/semesters.
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(TesAcademicRecord::class);
    }
}