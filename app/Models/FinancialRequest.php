<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon; // ✨ 1. Make sure Carbon is imported

class FinancialRequest extends Model
{
    use HasFactory;
   protected $appends = ['time_in_current_status', 'days_in_current_status'];
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
    
    // ⬇️ **START OF CORRECTED METHOD** ⬇️
    public function getTimeInCurrentStatusAttribute(): string
    {
        $relevantDate = match ($this->status) {
            'pending_accounting' => $this->budget_approved_at,
            'pending_cashier' => $this->accounting_approved_at,
            'completed' => $this->cashier_paid_at,
            'rejected' => $this->updated_at, // Use updated_at for rejections
            default => $this->created_at, // Default for pending_budget and others
        };

        // If for some reason a date is null, fall back to created_at
        $dateToParse = $relevantDate ?? $this->created_at;

        // ✨ **THE FIX:** If both $relevantDate and created_at are null 
        // (like on a new, unsaved model), return a default string.
        if (!$dateToParse) {
            return 'N/A';
        }

        // Now we are guaranteed to have a date to parse
        $date = Carbon::parse($dateToParse);

        // For completed/rejected requests, just show the date.
        if (in_array($this->status, ['completed', 'rejected'])) {
            return $date->isoFormat('MMM D, YYYY');
        }

        // For pending, show "for X days".
        return $date->diffForHumans(null, true); // e.g., "2 days", "5 hours"
    }
    // ⬆️ **END OF CORRECTED METHOD** ⬆️
public function getDaysInCurrentStatusAttribute(): ?int
    {
        // If it's not pending, we don't need to color-code it.
        if (in_array($this->status, ['completed', 'rejected'])) {
            return null;
        }

        // Find the date this *current* stage started
        $relevantDate = match ($this->status) {
            'pending_accounting' => $this->budget_approved_at,
            'pending_cashier' => $this->accounting_approved_at,
            default => $this->created_at, // 'pending_budget'
        };

        $dateToParse = $relevantDate ?? $this->created_at;

        if (!$dateToParse) {
            return 0;
        }

        // Calculate the difference in whole days from that date until now
        return Carbon::parse($dateToParse)->diffInDays(now());
    }

    // The 'USER' who submitted
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function logs(): HasMany
    {
        return $this->hasMany(FinancialRequestLog::class)->latest();
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