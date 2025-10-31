<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class FinancialRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'amount',
        'status',
        'remarks',
        'budget_approver_id',
        'budget_approved_at',
        'accounting_approver_id',
        'accounting_approved_at',
        'cashier_processor_id',
        'cashier_paid_at',
        'request_type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'budget_approved_at' => 'datetime',
        'accounting_approved_at' => 'datetime',
        'cashier_paid_at' => 'datetime',
        
    ];

    // The 'USER' who submitted
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // The polymorphic relationship to your existing 'attachments' table
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // --- Approver Relationships ---
    public function budgetApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'budget_approver_id');
    }

    public function accountingApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accounting_approver_id');
    }

    public function cashierProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_processor_id');
    }
}