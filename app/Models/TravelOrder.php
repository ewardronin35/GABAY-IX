<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelOrder extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'date_from' => 'date',
        'date_to'   => 'date',
        'approved_at' => 'datetime',
        'est_airfare' => 'decimal:2',
        'est_registration' => 'decimal:2',
        'est_per_diem' => 'decimal:2',
        'est_terminal' => 'decimal:2',
        'total_estimated_cost' => 'decimal:2',
    ];

    /**
     * The employee who requested the travel.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The Regional Director (RD) who approved it.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * ✨ FIX: Renamed from 'fundSource' to 'subAllotment' 
     * to match the Controller's "with('subAllotment')" call.
     */
    public function subAllotment()
    {
        // Note: Check your database column. 
        // If your column in 'travel_orders' table is 'sub_allotment_id', use that.
        // If it is 'fund_source_id', change the second argument below.
        return $this->belongsTo(SubAllotment::class, 'sub_allotment_id');
    }
    
    /**
     * Helper: Get the formatted travel duration string.
     */
    public function getDurationAttribute()
    {
        if ($this->date_from->format('Y-m') === $this->date_to->format('Y-m')) {
            return $this->date_from->format('F d') . '-' . $this->date_to->format('d, Y');
        }
        return $this->date_from->format('M d') . ' - ' . $this->date_to->format('M d, Y');
    }
}