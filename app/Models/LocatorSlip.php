<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocatorSlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'time_departure',
        'time_arrival',
        'purpose',
        'destination',
        'type', // 'official' or 'personal'
        'status', // 'pending', 'approved', 'rejected'
        'representative'
    ];

    protected $casts = [
        'time_departure' => 'datetime',
        'time_arrival' => 'datetime',
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}