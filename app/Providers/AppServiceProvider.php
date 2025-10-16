<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // <-- Make sure this is imported

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // This is the only code needed in this file.
        // It fixes the "blank page" issue with ngrok by forcing Laravel 
        // to generate https:// links during local development.
        if (config('app.env') === 'local') {
            URL::forceScheme('https');
        }
    }
}