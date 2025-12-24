<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'office_department',
        'last_name',
        'first_name',
        'middle_name',
        'date_of_filing',
        'position',
        'salary',
        'leave_type',
        'leave_type_others',
        'leave_details',
        'working_days',
        'inclusive_date_start',
        'inclusive_date_end',
        'commutation_requested',
        'status',
    ];

    protected $casts = [
        'date_of_filing' => 'date',
        'inclusive_date_start' => 'date',
        'inclusive_date_end' => 'date',
        'salary' => 'decimal:2',
        'leave_details' => 'array',
        'commutation_requested' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
