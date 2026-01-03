<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class VehicleTripTicket extends Model
{
    // Fix: The Trait must be used INSIDE the class
    use HasFactory; 

    protected $fillable = [
        'user_id',
        'driver_name',
        'vehicle_plate',
        'date_of_travel',
        'destination',
        'purpose',
        'passengers',
        'departure_time',
        'return_time',
        'status',
    ];

    protected $casts = [
        'date_of_travel' => 'date',
        'passengers' => 'array',
        // Optional: You might prefer 'datetime' or 'immutable_datetime' for these
        // so you can format them easily in Blade, but 'string' works too.
        'departure_time' => 'string', 
        'return_time' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}