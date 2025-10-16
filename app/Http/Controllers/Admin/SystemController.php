<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SystemController extends Controller
{
    /**
     * Display the maintenance mode status and controls.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Maintenance/Index', [
            'isDown' => app()->isDownForMaintenance(),
            'maintenance_secret' => session('maintenance_secret'),
        ]);
    }

    /**
     * Put the application into maintenance mode.
     */
    public function maintenanceDown(): RedirectResponse
    {
        // Generate a secret bypass URL so you don't lock yourself out.
        $secret = Str::random(24);
        Artisan::call('down', ['--secret' => $secret]);

        // Flash the secret to the session so we can display it to the admin once.
        return redirect()->route('admin.maintenance.index')->with('maintenance_secret', $secret);
    }

    /**
     * Bring the application out of maintenance mode.
     */
    public function maintenanceUp(): RedirectResponse
    {
        Artisan::call('up');
        return redirect()->route('admin.maintenance.index');
    }
}