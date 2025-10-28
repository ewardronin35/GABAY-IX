<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estatskolar extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get all of the monitoring records for the Estatskolar.
     * This defines the one-to-many relationship.
     */
    public function monitorings(): HasMany
    {
        return $this->hasMany(EstatskolarMonitoring::class);
    }
}