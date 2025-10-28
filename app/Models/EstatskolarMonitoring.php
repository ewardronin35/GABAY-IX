<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstatskolarMonitoring extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get the scholar that this monitoring record belongs to.
     * This defines the inverse of the one-to-many relationship.
     */
    public function estatskolar(): BelongsTo
    {
        return $this->belongsTo(Estatskolar::class);
    }
}