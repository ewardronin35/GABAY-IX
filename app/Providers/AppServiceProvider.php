<?php

namespace App\Providers;

use App\Models\CsmpScholar; // <-- Add this
use App\Policies\CsmpScholarPolicy; // <-- Add this
use Illuminate\Support\Facades\Gate; // <-- Add this
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // <-- Add this
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
    try {
            Storage::extend('google', function ($app, $config) {
                $client = new \Google\Client();
                $client->setClientId($config['clientId']);
                $client->setClientSecret($config['clientSecret']);
                $client->refreshToken($config['refreshToken']);
                
                $service = new \Google\Service\Drive($client);
                
                $adapter = new \Masbug\Flysystem\GoogleDriveAdapter($service, $config['folderId'] ?? '/');
                $driver = new \League\Flysystem\Filesystem($adapter);

                return new \Illuminate\Filesystem\FilesystemAdapter($driver, $adapter);
            });
        } catch (\Exception $e) {

            // Handle the exception (e.g., log the error)
            Log::error('Failed to extend Google Drive storage: ' . $e->getMessage());
        }

}

}