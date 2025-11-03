<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // ✨ 1. ADD THIS

class FinancialRequestLog extends Model
{
    use HasFactory;

    // ✨ 2. ADD $fillable
    protected $fillable = [
        'financial_request_id',
        'user_id',
        'action',
        'remarks',
    ];

    // ✨ 3. ADD RELATIONSHIPS
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function financialRequest(): BelongsTo
    {
        return $this->belongsTo(FinancialRequest::class);
    }
}