<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule; // ✨ 1. Import Schedule

// ... (any existing code) ...

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


// ✨ 2. ADD THIS BLOCK AT THE END
Schedule::command('app:send-pending-financials-report')
    ->weeklyOn(1, '8:00'); // Runs every Monday at 8:00 AM