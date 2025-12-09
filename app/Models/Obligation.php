<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Obligation extends Model
{
    protected $fillable = [
        'sub_allotment_id', 'ors_number', 'date_processed', 'particulars', 
        'uacs_code', 'amount', 'payee_type', 'payee_id', 'payee_name'
    ];

    public function subAllotment()
    {
        return $this->belongsTo(SubAllotment::class);
    }

    // Polymorphic relation to Scholar or HEI
    public function payee()
    {
        return $this->morphTo();
    }
}