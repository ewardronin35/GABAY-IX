<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubAllotment extends Model
{
    protected $fillable = [
        'saa_number', 'date_received', 'program_id', 'total_amount', 'description', 'status'
    ];

    // Relation to Program
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    // Relation to Obligations (Transactions)
    public function obligations()
    {
        return $this->hasMany(Obligation::class);
    }

    // Helper: Calculate Remaining Balance
    public function getBalanceAttribute()
    {
        $utilized = $this->obligations()->sum('amount');
        return $this->total_amount - $utilized;
    }
}