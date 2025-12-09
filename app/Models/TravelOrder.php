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
        'date_to' => 'date',
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
     * The SAA (Budget Source) this is charged against.
     */
    public function fundSource()
    {
        return $this->belongsTo(SubAllotment::class, 'fund_source_id');
    }
    
    /**
     * Helper: Get the formatted travel duration string.
     * e.g. "November 12-13, 2025"
     */
    public function getDurationAttribute()
    {
        if ($this->date_from->format('Y-m') === $this->date_to->format('Y-m')) {
            // Same month: "November 12-13, 2025"
            return $this->date_from->format('F d') . '-' . $this->date_to->format('d, Y');
        }
        // Different months: "Nov 30 - Dec 02, 2025"
        return $this->date_from->format('M d') . ' - ' . $this->date_to->format('M d, Y');
    }
}