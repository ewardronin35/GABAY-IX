<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPersonalLocatorTime extends Model
{
    protected $table = 'user_personal_locator_time';

    protected $fillable = [
        'user_id',
        'month',
        'time_consumed_seconds',
    ];

    protected $casts = [
        'time_consumed_seconds' => 'integer',
    ];

    /**
     * Get the user that owns this time record
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create record for user and month
     */
    public static function getOrCreateForMonth(int $userId, string $month): self
    {
        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'month' => $month,
            ],
            [
                'time_consumed_seconds' => 0,
            ]
        );
    }

    /**
     * Add time consumed in seconds
     */
    public function addTime(int $seconds): void
    {
        $this->increment('time_consumed_seconds', $seconds);
    }

    /**
     * Get remaining time in seconds (4 hours = 14400 seconds)
     */
    public function getRemainingSeconds(): int
    {
        return 14400 - $this->time_consumed_seconds;
    }

    /**
     * Check if user is in overtime
     */
    public function isOvertime(): bool
    {
        return $this->time_consumed_seconds > 14400;
    }

    /**
     * Get overtime amount in seconds
     */
    public function getOvertimeSeconds(): int
    {
        $overtime = $this->time_consumed_seconds - 14400;
        return $overtime > 0 ? $overtime : 0;
    }
}
