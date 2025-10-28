<?php

namespace App\Providers;

use App\Models\CsmpScholar; // <-- Add this
use App\Policies\CsmpScholarPolicy; // <-- Add this
use Illuminate\Support\Facades\Gate; // <-- Add this
use Illuminate\Support\ServiceProvider;

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
        // Add this line to register your policy
        Gate::policy(CsmpScholar::class, CsmpScholarPolicy::class);
    }
}