<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SystemController; // ✨ ADD THIS
use App\Http\Controllers\DashboardController; // ✨ ADD THIS
use App\Http\Controllers\Admin\ApplicationController; // ✨ ADD THIS
use App\Http\Controllers\StufapController; // ✨ ADD THIS
use App\Http\Controllers\ReportController; // <-- ADD THIS LINE
use App\Http\Controllers\ScholarController; // <-- ADD THIS LINE
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\ItineraryController; // Make sure this is imported
use App\Http\Controllers\TravelClaimController; // 👈 1. Import the controller
use App\Http\Controllers\TesController; // <-- ADD THIS LINE
// All your other routes are here...
Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');



/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ... your public, auth, and applicant routes remain the same ...


// --- ADMIN PANEL ROUTES ---
// All routes in this group will have the '/admin' prefix and require login.
Route::middleware(['auth', 'verified'])->prefix('superadmin')->name('superadmin.')->group(function () {

    // --- USER & ROLE MANAGEMENT ---
    // Requires 'manage users' OR 'manage roles' permission.
    Route::middleware('permission:manage users|manage roles')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::post('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/status', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        Route::post('/permissions', [RoleController::class, 'storePermission'])->name('permissions.store');
        Route::delete('/permissions/{permission}', [RoleController::class, 'destroyPermission'])->name('permissions.destroy');
    });

    // --- SYSTEM MAINTENANCE ---
    // Requires 'manage maintenance' permission.
    Route::middleware('permission:manage maintenance')->group(function () {
        Route::get('/maintenance', [SystemController::class, 'index'])->name('maintenance.index');
        Route::post('/maintenance/down', [SystemController::class, 'maintenanceDown'])->name('maintenance.down');
        Route::post('/maintenance/up', [SystemController::class, 'maintenanceUp'])->name('maintenance.up');
    });

    // --- SCHOLARSHIP APPLICATIONS ---
    // Requires 'manage applications' permission.
    Route::middleware('permission:manage applications')->group(function () {
        Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
        Route::post('/applications/{application}/approve', [ApplicationController::class, 'approve'])->name('applications.approve');
        Route::post('/applications/{application}/reject', [ApplicationController::class, 'reject'])->name('applications.reject');
    });

    // --- STUFAPS DATABASE ---
    // Requires 'manage stufaps database' permission.
    Route::middleware('permission:manage stufaps database')->group(function () {
        Route::get('/stufaps-database', [StufapController::class, 'index'])->name('stufaps.index');
        Route::post('/stufaps-database/bulk-update', [StufapController::class, 'bulkUpdate'])->name('stufaps.bulkUpdate');
        Route::delete('/stufaps-database/{stufap}', [StufapController::class, 'destroy'])->name('stufaps.destroy');
        
        // Reports
    Route::get('/reports/generate-masterlist', [ReportController::class, 'generateMasterlist'])
        ->name('reports.masterlist');
            Route::get('/reports/masterlist-data', [ReportController::class, 'fetchMasterlistData'])
        ->name('reports.masterlistData');
        // in routes/web.php
Route::get('/reports/generate-masterlist-pdf', [ReportController::class, 'generateMasterlistPdf'])
    ->name('reports.masterlist.pdf');

    // Master List
    Route::put('/scholars/{scholar}', [ScholarController::class, 'update'])
    ->name('scholars.update');

    Route::get('/stufaps/tes-data', [TesController::class, 'getTesData'])->name('stufaps.tes-data');
Route::post('/stufaps/update-tes-data', [TesController::class, 'updateTesData'])->name('stufaps.update-tes-data');
    });


    Route::middleware('permission:create travel claims')->group(function () {

    Route::get('/travel-claims', [TravelClaimController::class, 'create'])
    ->name('travel-claims.create');
    });
});
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::post('/itineraries', [ItineraryController::class, 'store']);
    Route::post('/uploads/process', [UploadController::class, 'process']);
Route::delete('/uploads/revert', [UploadController::class, 'revert']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// --- PASTE YOUR CUSTOM VERIFICATION ROUTES HERE ---

