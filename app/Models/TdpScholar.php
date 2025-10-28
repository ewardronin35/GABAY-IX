<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TdpScholar extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get all of the academic records for the scholar.
     * A single scholar can have many records over different years.
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(TdpAcademicRecord::class);
    }
}