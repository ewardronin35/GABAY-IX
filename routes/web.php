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
use App\Http\Controllers\CoschoController; // ✨ ADD THIS
use App\Http\Controllers\ReportController; // <-- ADD THIS LINE
use App\Http\Controllers\ScholarController; // <-- ADD THIS LINE
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\ItineraryController; // Make sure this is imported
use App\Http\Controllers\TravelClaimController; // 👈 1. Import the controller
use App\Http\Controllers\TesController; // <-- ADD THIS LINE
use App\Http\Controllers\StufapController; // <-- ADD THIS LINE
use App\Http\Controllers\TdpController; // <-- ADD THIS LINE
use App\Http\Controllers\EstatController; // <-- ADD THIS LINE
use App\Http\Controllers\Scholar\ScholarController as ScholarScholarController;
use App\Http\Controllers\Admin\CsmpAdminController; // <-- Add this
use App\Http\Controllers\CsmpScholarController; // <-- Add this
use App\Http\Controllers\Settings\ProfileController;

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
        Route::get('/coscho-database', [CoschoController::class, 'index'])->name('coshco.index');
Route::put('/coscho-database/bulk-update', [CoschoController::class, 'bulkUpdate'])->name('coscho.bulkUpdate');
Route::delete('/coscho-database/{stufap}', [CoschoController::class, 'destroy'])->name('coscho.destroy');    
// In routes/web.php
Route::post('/coscho/import', [CoschoController::class, 'import'])->name('coscho.import');    

        // Reports
    Route::get('/reports/generate-masterlist', [ReportController::class, 'generateMasterlist'])
        ->name('reports.masterlist');
            Route::get('/reports/masterlist-data', [ReportController::class, 'fetchMasterlistData'])
        ->name('reports.masterlistData');
        Route::get('/reports/masterlist/excel', [ReportController::class, 'generateMasterlistExcel'])
        ->name('reports.masterlist.excel');
        // In routes/web.php

// ... inside the 'superadmin.' group

// ✅ ADD these two routes
Route::get('/reports/statistics-data', [ReportController::class, 'fetchStatisticsData'])->name('reports.statisticsData');
Route::post('/reports/generate-statistics-pdf', [ReportController::class, 'generateStatisticsPdf'])->name('reports.statisticsPdf');
Route::get('/reports/generate-masterlist-pdf', [ReportController::class, 'generateMasterlistPdf'])
    ->name('reports.masterlist.pdf');
// In routes/web.php
Route::get('/reports/masterlist-data', [CoschoController::class, 'masterlistData'])->name('reports.masterlistData');
    // Master List
 

Route::get('/tes', [TesController::class, 'index'])->name('tes.index');
    Route::put('/tes/bulk-update', [TesController::class, 'bulkUpdate'])->name('tes.bulkUpdate');
    Route::get('/tes/masterlist-data', [TesController::class, 'fetchMasterlistData'])->name('tes.masterlistData');
    Route::get('/tes/statistics-data', [TesController::class, 'fetchStatisticsData'])->name('tes.statisticsData');
    Route::post('/tes/statistics-pdf', [TesController::class, 'generateStatisticsPdf'])->name('tes.statisticsPdf');
    Route::put('/tes/bulk-update', [TesController::class, 'bulkUpdate'])->name('tes.bulkUpdate');
    Route::post('/tes/upload', [TesController::class, 'upload'])->name('tes.upload');
    Route::post('/tes/import', [TesController::class, 'import'])->name('tes.import');
    Route::get('/tes/masterlist/pdf', [TesController::class, 'generateMasterlistPdf'])->name('tes.masterlist.pdf');
Route::get('/tes/masterlist/excel', [TesController::class, 'generateMasterlistExcel'])->name('tes.masterlist.excel');
Route::get('/tes/statistics-excel', [TesController::class, 'generateStatisticsExcel'])->name('tes.statisticsExcel');

Route::get('/stufaps', [StufapController::class, 'index'])->name('stufaps.index');
    Route::post('/stufap/import', [StufapController::class, 'import'])->name('stufap.import');
    Route::get('/stufap/masterlist-data', [StufapController::class, 'masterlistData'])->name('stufap.masterlistData');
    Route::get('/stufap/statistics-data', [StufapController::class, 'StatisticsData'])->name('stufap.statisticsData');
    Route::put('/stufap/bulkUpdate', [StufapController::class, 'bulkUpdate'])->name('stufap.bulkUpdate');
    Route::post('/stufap/upload', [StufapController::class, 'upload'])->name('stufap.upload');
Route::post('/stufap/statistics-pdf', [StufapController::class, 'generateStatisticsPdf'])->name('stufap.statisticsPdf');
Route::get('/stufap/masterlist/pdf', [StufapController::class, 'generateMasterlistPdf'])->name('stufap.masterlist.pdf');
Route::get('/stufap/masterlist/excel', [StufapController::class, 'generateMasterlistExcel'])->name('stufap.masterlist.excel');


Route::get('/tdp', [TdpController::class, 'index'])->name('tdp.index');
    Route::put('/tdp/bulk-update', [TdpController::class, 'bulkUpdate'])->name('tdp.bulkUpdate');
    Route::post('/tdp/upload', [TdpController::class, 'upload'])->name('tdp.upload');
    Route::post('/tdp/import', [TdpController::class, 'import'])->name('tdp.import');
    Route::get('/tdp/statistics-data', [TdpController::class, 'fetchStatisticsData'])->name('tdp.statisticsData');
   Route::post('/tdp/statistics-pdf', [TdpController::class, 'generateStatisticsPdf'])->name('tdp.statisticsPdf');
    // ▼▼▼ JUST REMOVE THE DOTS IN THE NAME ▼▼▼
    Route::get('/tdp/masterlist/excel', [TdpController::class, 'generateMasterlistExcel'])->name('tdp.masterlistExcel'); // ✅ Fixed
    Route::get('/tdp/masterlist/pdf', [TdpController::class, 'generateMasterlistPdf'])->name('tdp.masterlistPdf'); // ✅ Fixed


Route::get('/estatskolar', [EstatController::class, 'index'])->name('estatskolar.index');
Route::put('/estatskolar/bulk-update', [EstatController::class, 'bulkUpdate'])->name('estatskolar.bulkUpdate');
Route::put('/estatskolar/monitoring-bulk-update', [EstatController::class, 'monitoringBulkUpdate'])->name('estatskolar.monitoringBulkUpdate');
Route::post('/estatskolar/import', [EstatController::class, 'import'])->name('estatskolar.import');

// Reports
Route::get('/estatskolar/statistics-data', [EstatController::class, 'fetchStatisticsData'])->name('estatskolar.statisticsData');
Route::post('/estatskolar/statistics-pdf', [EstatController::class, 'generateStatisticsPdf'])->name('estatskolar.statisticsPdf');
Route::get('/estatskolar/masterlist/excel', [EstatController::class, 'generateMasterlistExcel'])->name('estatskolar.masterlist.excel');
Route::get('/estat/masterlist/pdf', [EstatController::class, 'generateMasterlistPdf'])->name('estatskolar.masterlist.pdf');

});
        Route::middleware('permission:view applications')->group(function () {
    Route::get('/csmp-applications', [CsmpAdminController::class, 'index'])
         ->name('csmp-applications.index');
         Route::post('/csmp-scholars', [CsmpScholarController::class, 'store'])
         ->name('csmp-scholars.store');
         Route::get('/applications', [CsmpAdminController::class, 'index'])
             ->name('applications.index');
             
        // This new route will handle the approve/reject/incomplete actions
        Route::patch('/applications/{csmp_scholar}', [CsmpAdminController::class, 'update'])
             ->name('applications.update');
         });


    Route::middleware('permission:create travel claims')->group(function () {

    Route::get('/travel-claims', [TravelClaimController::class, 'create'])
    ->name('travel-claims.create');
    Route::resource('travel-claims', TravelClaimController::class);
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





Route::middleware(['auth', 'verified'])->prefix('scholar')->name('scholar.')->group(function () {
    Route::middleware('permission:view applications')->group(function () {

    Route::get('/my-applications', [ScholarScholarController::class, 'showMyApplications'])
         ->name('csmp.my-applications');
           Route::post('/csmp-scholars', [CsmpScholarController::class, 'store'])
         ->name('csmp-scholars.store');
         Route::get('/my-applications', [CsmpScholarController::class, 'index'])
         ->name('csmp.my-applications');
         Route::get('/apply-csmp', [CsmpScholarController::class, 'create'])
         ->name('csmp.create');
         Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])
     ->name('profile.photo.update');
     Route::get('/my-applications/{csmp_scholar}/edit', [CsmpScholarController::class, 'edit'])
     ->name('scholar.csmp.edit');
     
// 2. This route handles the submission of the edit form
Route::put('/my-applications/{csmp_scholar}', [CsmpScholarController::class, 'update'])
     ->name('scholar.csmp.update');
     Route::delete('/profile/photo/revert', [ProfileController::class, 'revertPhoto'])
         ->name('profile.photo.revert');
});
});






require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// --- PASTE YOUR CUSTOM VERIFICATION ROUTES HERE ---

