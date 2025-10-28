<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CsmpScholar extends Model
{
    use HasFactory;

    /**
     * We use $guarded = [] for simplicity to allow mass assignment.
     * You can switch to $fillable if you prefer.
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'birth_date' => 'date',
        'is_indigenous' => 'boolean',
        'is_4ps_beneficiary' => 'boolean',
        'is_priority_course' => 'boolean',
        'family_income' => 'decimal:2',
        'gwa' => 'decimal:2',
    ];

    /**
     * Get the user that this scholarship application belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}