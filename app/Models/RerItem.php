<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RerItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'rer_id',
        'date',
        'or_no',
        'nature_of_expense',
        'amount',
    ];

    /**
     * Get the RER that this item belongs to.
     */
    public function rer()
    {
        return $this->belongsTo(Rer::class);
    }
}