<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'global_academic_period_id',
        'program_type',
        'batch_type',
        'batch_status',
        'total_amount',
        'remarks',
        'created_by_user_id',
        'chief_approver_id',
        'rd_approver_id',
        'cashier_processor_id',
    ];

    /**
     * Get the academic period this batch belongs to.
     */
    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(GlobalAcademicPeriod::class, 'global_academic_period_id');
    }

    /**
     * Get the admin who created this batch.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the chief who approved this batch.
     */
    public function chiefApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chief_approver_id');
    }

    /**
     * Get the RD who approved this batch.
     */
    public function rdApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rd_approver_id');
    }

    /**
     * Get the cashier who paid this batch.
     */
    public function cashierProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_processor_id');
    }

    /**
     * Get all the scholar records associated with this batch.
     */
    public function batchScholars(): HasMany
    {
        return $this->hasMany(BatchScholar::class);
    }
}