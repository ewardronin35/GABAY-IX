<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Barangay extends Model
{
    use HasFactory;

    // Tell Laravel the table name is 'barangay' (not 'barangays')
    protected $table = 'barangay';

    // Tell Laravel the primary key is 'barangayID' (not 'id')
    protected $primaryKey = 'barangayID';

    // Define fillable fields based on your SQL
    protected $fillable = ['barangay', 'cityID'];
    
    // A barangay belongs to one city
    public function city(): BelongsTo
    {
        // Link our 'cityID' to the 'id' column on the 'cities' table
        return $this->belongsTo(City::class, 'cityID', 'id');
    }
}