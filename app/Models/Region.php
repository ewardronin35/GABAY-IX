<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use HasFactory;
    
    // We only need to fill the name
    protected $fillable = ['name'];

    // A region can have many provinces
    public function provinces(): HasMany
    {
        return $this->hasMany(Province::class);
    }

    // A region can be linked to many addresses
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}