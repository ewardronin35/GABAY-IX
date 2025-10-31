<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GlobalAcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year',
        'semester',
        'name',
    ];

    /**
     * Get all the batches associated with this academic period.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'global_academic_period_id');
    }
}