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
use App\Http\Controllers\StuFapsController; // <-- ADD THIS LINE
use App\Http\Controllers\TdpController; // <-- ADD THIS LINE
use App\Http\Controllers\EstatistikolarController; // <-- ADD THIS LINE
use App\Http\Controllers\Scholar\ScholarController as ScholarScholarController;
use App\Http\Controllers\Admin\CsmpAdminController; // <-- Add this
use App\Http\Controllers\CsmpScholarController; // <-- Add this
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\GlobalAcademicPeriodController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\ChatbotController; // <-- Add this
use App\Http\Controllers\FinancialRequestController;
use App\Http\Controllers\UnifastRc\ValidationController;
use App\Http\Controllers\BillingRecordController; // <-- Add this at the top
use App\Http\Controllers\TravelOrderController; // <-- ADD THIS LINE
use App\Http\Controllers\MsrsController; // <-- ADD THIS LINE
use App\Http\Controllers\CmspController; // <-- ADD THIS LINE
use App\Http\Controllers\PersonnelLocatorController; // <-- ADD THIS LINE
use App\Http\Controllers\LeaveFormController; // <-- ADD THIS LINE
use App\Http\Controllers\AdminApprovalController; // 👈 2. Import the controller


Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');






Route::middleware(['auth', 'verified'])->group(function () {
    
Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- Utilities ---
    Route::post('/itineraries', [ItineraryController::class, 'store']);
    Route::post('/uploads/process', [UploadController::class, 'process']);
    Route::delete('/uploads/revert', [UploadController::class, 'revert']);

    // --- Financial Requests ---
    Route::post('/financial-request', [FinancialRequestController::class, 'store'])->name('financial.store');
    Route::get('/financial-requests', [FinancialRequestController::class, 'index'])->name('financial.index');
    Route::get('/financial-requests/{financialRequest}', [FinancialRequestController::class, 'show'])->name('financial.show');
    Route::patch('/billing-records/{billingRecord}', [BillingRecordController::class, 'update'])->name('billing-records.update');

    // ==============================================================================
    //  TRAVEL MANAGEMENT ROUTES
    // ==============================================================================

    // 2. Leave

    Route::get('/personnel-locator', [PersonnelLocatorController::class, 'index'])->name('personnel-locator.index');
    Route::post('/personnel-locator', [PersonnelLocatorController::class, 'store'])->name('locator.store');
Route::put('/locator/{id}/arrived', [PersonnelLocatorController::class, 'markArrived'])->name('locator.arrived');
    Route::post('/personnel-locator/print-ticket', [PersonnelLocatorController::class, 'printTripTicket'])->name('locator.print-ticket');


Route::post('/trip-ticket', [PersonnelLocatorController::class, 'storeTripTicket'])->name('trip-ticket.store');
Route::get('/trip-ticket/{id}/print', [PersonnelLocatorController::class, 'printTripTicket'])->name('trip-ticket.print');

    Route::get('/leave-form', [LeaveFormController::class, 'index'])->name('leave-form.index');
    Route::post('/leave-form', [LeaveFormController::class, 'store'])->name('leave-form.store');



    // 1. GENERAL ROUTES (Accessible by Staff, Chief, RD)
    // ------------------------------------------------------------------------------
    
    // My Requests List
    Route::get('/travel-orders', [TravelOrderController::class, 'index'])->name('travel-orders.index');
    
    // ✨ APPROVALS QUEUE (Moved here to fix 404)
    // The Controller handles logic: "If Chief, show pending. If Staff, show empty."
Route::get('/travel-orders/approvals', [TravelOrderController::class, 'approvals'])->name('travel-orders.approvals');
    // Creation
    Route::get('/travel/request', [TravelOrderController::class, 'create'])->name('travel-orders.create');
    Route::post('/travel/request', [TravelOrderController::class, 'store'])->name('travel-orders.store');

    // Viewing Details (Required for Approvers to see the doc)
    Route::get('/travel-orders/{id}', [TravelOrderController::class, 'show'])->name('travel-orders.show');

    // Printing
    Route::get('/travel-orders/{id}/print-memo', [TravelOrderController::class, 'printMemo'])->name('travel-orders.print-memo');
    Route::get('/travel-orders/{id}/print-authority', [TravelOrderController::class, 'printAuthority'])->name('travel-orders.print-authority');
Route::post('/api/travel-claims/verify', [TravelClaimController::class, 'verifyCode']);
    
    // 2. CHIEF EPS ACTIONS (Protected Actions Only)
    // ------------------------------------------------------------------------------
    Route::middleware(['role:Chief Education Program Specialist'])->group(function () {
        // ✨ FIXED NAME: 'chief-endorse' to match React
        Route::post('/travel-orders/{id}/endorse', [TravelOrderController::class, 'endorse'])
            ->name('travel-orders.chief-endorse'); 
            
        Route::post('/travel-orders/{id}/reject-chief', [TravelOrderController::class, 'reject'])
            ->name('travel-orders.chief-reject');
    });


    // --- 3. REGIONAL DIRECTOR ACTIONS (Protected) ---
    Route::middleware(['role:RD|Regional Director'])->group(function () {
        // ✨ FIXED NAME: 'rd-approve'
        Route::post('/travel-orders/{id}/final-approve', [TravelOrderController::class, 'finalApprove'])
            ->name('travel-orders.rd-approve');
            
        Route::post('/travel-orders/{id}/reject-rd', [TravelOrderController::class, 'reject'])
            ->name('travel-orders.rd-reject');
    });

    // --- Travel Claims / Reimbursements ---
    Route::get('/travel-claims/create', [TravelClaimController::class, 'create'])->name('travel-claims.create'); 
    Route::resource('travel-claims', TravelClaimController::class)->except(['create']);

});


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


        // Reports
    Route::get('/reports/generate-masterlist', [ReportController::class, 'generateMasterlist'])
        ->name('reports.masterlist');
            Route::get('/reports/masterlist-data', [ReportController::class, 'fetchMasterlistData'])
        ->name('reports.masterlistData');
        Route::get('/reports/masterlist/excel', [ReportController::class, 'generateMasterlistExcel'])
        ->name('reports.masterlist.excel');
        // In routes/web.php

// ✅ TRAVEL ORDER ROUTES
  
// ✅ ADD these two routes
Route::get('/reports/statistics-data', [ReportController::class, 'fetchStatisticsData'])->name('reports.statisticsData');
Route::post('/reports/generate-statistics-pdf', [ReportController::class, 'generateStatisticsPdf'])->name('reports.statisticsPdf');
Route::get('/reports/generate-masterlist-pdf', [ReportController::class, 'generateMasterlistPdf'])
    ->name('reports.masterlist.pdf');
// In routes/web.php
    // Master List



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
   
       
        Route::get('/export/pdf', [TdpController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/export/excel', [TdpController::class, 'exportExcel'])->name('export-excel');

       
    });
   
    // The API for the modal (fetches TES vs TDP requirements)
    Route::get('/validation/{enrollment}/checklist', [ValidationController::class, 'getChecklist'])
        ->name('validation.checklist');

    // The button action to approve
    Route::post('/validation/{enrollment}/validate', [ValidationController::class, 'validateScholar'])
        ->name('validation.approve');

    Route::middleware('permission:create travel claims')->group(function () {


    });
// ==============================================================================
// SHARED ADMIN PORTAL (TDP, TES, VALIDATION)
// Accessible by: Superadmin, UnifastRC, RD, Scholarship Supervisor, Chief Admin
// ==============================================================================
Route::middleware([
    'auth', 
    'verified', 
    // IMPORTANT: Ensure these role names match your database exactly (Case Sensitive)
    'role:Super Admin|UnifastRC|RD|Scholarship Supervisor|Chief of Administrative Officer|Coscho Coordinator|Estatskolar Coordinator|CMSP Coordinator|MSRS Coordinator|StuFaps Coordinator'
])
->prefix('admin')        // URL: /admin/tdp
->name('admin.')         // Route Name: admin.tdp.index
->group(function () {

    // --- TDP MODULE ---
    Route::prefix('tdp')->name('tdp.')->group(function () {
        Route::get('/', [TdpController::class, 'index'])->name('index');
        Route::post('/bulk-update', [TdpController::class, 'bulkUpdate'])->name('bulk-update');
        Route::post('/bulk-destroy', [TdpController::class, 'bulkDestroy'])->name('bulk-destroy');
        Route::post('/upload', [TdpController::class, 'upload'])->name('upload');
        Route::post('/import', [TdpController::class, 'import'])->name('import');
        
        // Exports
        Route::get('/export/pdf', [TdpController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/export/excel', [TdpController::class, 'exportExcel'])->name('export-excel');
        // Legacy export names (to prevent breaking changes if used elsewhere)
        Route::get('/export/statistics-pdf', [TdpController::class, 'generateStatisticsPdf'])->name('export-statistics-pdf');
        Route::get('/export/statistics-excel', [TdpController::class, 'generateStatisticsExcel'])->name('export-statistics-excel');
        // Stats
      

        // Detailed Views
        Route::get('/scholars/{scholar}', [TdpController::class, 'showScholar'])->name('scholar.show');
        Route::get('/heis/{hei}', [TdpController::class, 'showHei'])->name('hei.show');

        // NOA Generation
        Route::get('/noa/{enrollment}', [ValidationController::class, 'generateNoa'])->name('generate-noa');
        Route::get('/batch-noa', [ValidationController::class, 'generateBatchNoa'])->name('generate-batch-noa');
        
        // Validation Sub-Group (TDP Specific Defaults)
        Route::prefix('validation')->name('validation.')->group(function () {
            Route::get('/', [ValidationController::class, 'index'])->defaults('program', 'TDP')->name('index');
            Route::get('/{enrollment}/checklist', [ValidationController::class, 'getChecklist'])->name('checklist');
            Route::post('/{enrollment}/upload', [ValidationController::class, 'uploadRequirement'])->name('upload');
            Route::post('/{enrollment}/approve', [ValidationController::class, 'validateScholar'])->name('approve');
        });
    });

// --- StuFaps Module ---
    Route::prefix('stufaps')->name('stufaps.')->group(function () {
        Route::get('/', [StufapsController::class, 'index'])->name('index');
        Route::post('/bulk-update', [StufapsController::class, 'bulkUpdate'])->name('bulk-update');
        Route::post('/upload', [StufapsController::class, 'upload'])->name('upload');
        Route::post('/import', [StufapsController::class, 'import'])->name('import');
        Route::get('/export/excel', [StufapsController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [StufapsController::class, 'exportPdf'])->name('export.pdf');
        Route::get('/scholars/{scholar}', [StufapsController::class, 'showScholar'])->name('scholar.show');
        Route::get('/heis/{hei}', [StufapsController::class, 'showHei'])->name('show-hei'); 
        Route::get('/scholar/{scholar}', [StuFapsController::class, 'showScholar'])
    ->name('scholar.show');
        Route::get('/statistics', [StuFapsController::class, 'exportStatisticsExcel'])->name('export.statistics.excel');
        Route::get('/statistics/pdf', [StuFapsController::class, 'exportStatisticsPdf'])->name('export.statistics.pdf');

    });                                     
// --- MSRS MODULE ---
    Route::prefix('msrs')->name('msrs.')->group(function () {
        Route::get('/', [MsrsController::class, 'index'])->name('index');
        Route::post('/import', [MsrsController::class, 'import'])->name('import');
        Route::post('/upload', [MsrsController::class, 'upload'])->name('upload');
       Route::get('/hei/{hei}', [MsrsController::class, 'showHei'])->name('hei.show');
       Route::post('/bulk-update', [MsrsController::class, 'bulkUpdate'])->name('bulk-update'); // <--- ADD THIS
        Route::post('/bulk-destroy', [MsrsController::class, 'bulkDestroy'])->name('bulk-destroy'); // <--- ADD THIS
       Route::get('/export/excel', [MsrsController::class, 'exportExcel'])->name('export-excel');
    Route::get('/export/pdf', [MsrsController::class, 'exportPdf'])->name('export-pdf');

    // --- 📊 STATISTICS REPORT GENERATION ---
    Route::get('/export/statistics-pdf', [MsrsController::class, 'generateStatisticsPdf'])
        ->name('export-statistics-pdf');
    
    Route::get('/export/statistics-excel', [MsrsController::class, 'generateStatisticsExcel'])
        ->name('export-statistics-excel');

       
       
       Route::get('/scholars/{scholar}', [MsrsController::class, 'showScholar'])->name('scholars.show');
    });


    // --- CMSP MODULE ---
    Route::prefix('cmsp')->name('cmsp.')->group(function () {
        Route::get('/', [CmspController::class, 'index'])->name('index');
        Route::post('/bulk-update', [CmspController::class, 'bulkUpdate'])->name('bulk-update');
        Route::post('/upload', [CmspController::class, 'upload'])->name('upload');
        Route::post('/import', [CmspController::class, 'import'])->name('import');
        // Exports
        Route::get('/export/pdf', [CmspController::class, 'exportPdf'])->name('export.pdf');
        Route::get('/export/excel', [CmspController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/statistics-pdf', [CmspController::class, 'exportStatisticsPdf'])->name('export-statistics-pdf');
        Route::get('/export/statistics-excel', [CmspController::class, 'exportStatisticsExcel'])->name('export-statistics-excel');
        
        // Detailed Views
        Route::get('/scholar/{id}', [CmspController::class, 'showScholar'])->name('scholar.show');
        Route::get('/heis/{hei}', [CmspController::class, 'showHei'])->name('show-hei');
    
    });

    // --- TES MODULE ---
    Route::prefix('tes')->name('tes.')->group(function () {
        Route::get('/', [TesController::class, 'index'])->name('index');
        Route::post('/bulk-update', [TesController::class, 'bulkUpdate'])->name('bulkUpdate');
        Route::post('/upload', [TesController::class, 'upload'])->name('upload');
        Route::post('/import', [TesController::class, 'import'])->name('import');

        // Exports
        Route::get('/export/pdf', [TesController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/export/excel', [TesController::class, 'exportExcel'])->name('export-excel');
        Route::get('/export/statistics-pdf', [TesController::class, 'exportStatisticsPdf'])->name('export-statistics-pdf');
        Route::get('/export/statistics-excel', [TesController::class, 'exportStatisticsExcel'])->name('export-statistics-excel');
        
        // Detailed Views
        Route::get('/scholars/{scholar}', [TesController::class, 'showScholar'])->name('scholar.show');
        Route::get('/heis/{hei}', [TesController::class, 'showHei'])->name('hei.show');
        Route::post('/heis/{hei}/upload', [TesController::class, 'uploadHeiFile'])->name('hei.upload');

        // Validation Sub-Group (TES Specific Defaults)
        Route::prefix('validation')->name('validation.')->group(function () {
            Route::get('/', [ValidationController::class, 'index'])->defaults('program', 'TES')->name('index');
            Route::get('/{enrollment}/checklist', [ValidationController::class, 'getChecklist'])->name('checklist');
            Route::post('/{enrollment}/upload', [ValidationController::class, 'uploadRequirement'])->name('upload');
            Route::post('/{enrollment}/approve', [ValidationController::class, 'validateScholar'])->name('approve');
        });
    });


    // --- ESTATISTIKOLAR ---
   Route::prefix('estatskolar')->name('estatskolar.')->group(function () {
    // 1. Dashboard & Actions
    Route::get('/', [EstatistikolarController::class, 'index'])->name('index');
    Route::put('/bulk-update', [EstatistikolarController::class, 'bulkUpdate'])->name('bulkUpdate');
    Route::post('/import', [EstatistikolarController::class, 'import'])->name('import');

    // 2. Reports (JSON Data for Charts)
    Route::get('/statistics-data', [EstatistikolarController::class, 'fetchStatisticsData'])->name('statistics.data');

    // 3. EXPORTS (Downloads must be GET)
    Route::get('/statistics/excel', [EstatistikolarController::class, 'exportStatisticsExcel'])->name('statistics.excel');
    Route::get('/statistics/pdf', [EstatistikolarController::class, 'exportStatisticsPdf'])->name('statistics.pdf');

    Route::get('/masterlist/excel', [EstatistikolarController::class, 'generateMasterlistExcel'])->name('masterlist.excel');
    Route::get('/masterlist/pdf', [EstatistikolarController::class, 'generateMasterlistPdf'])->name('masterlist.pdf');

    // 4. Details
    Route::get('/scholars/{id}', [EstatistikolarController::class, 'showScholar'])->name('show-scholar');
    Route::get('/heis/{hei}', [EstatistikolarController::class, 'showHei'])->name('show-hei');
});


// --- COSCHO PROGRAM ROUTES ---
Route::prefix('coscho')->name('coscho.')->middleware(['auth', 'verified'])->group(function () {
    
    // 1. Main Dashboard & Grid
    Route::get('/', [CoschoController::class, 'index'])->name('index');
    
    // 2. Data Actions (Import & Update)
    Route::put('/bulk-update', [CoschoController::class, 'bulkUpdate'])->name('bulkUpdate');
    Route::post('/import', [CoschoController::class, 'import'])->name('import');

    // 3. Reports: Statistics (Downloadable)
    Route::get('/statistics/excel', [CoschoController::class, 'exportStatisticsExcel'])->name('statistics.excel');
    Route::get('/statistics/pdf', [CoschoController::class, 'exportStatisticsPdf'])->name('statistics.pdf');
    Route::get('/noa/{id}', [CoschoController::class, 'generateNoa'])->name('generate-noa');
    // 4. Reports: Masterlist (Downloadable)
    Route::get('/masterlist/excel', [CoschoController::class, 'generateMasterlistExcel'])->name('masterlist.excel');
    Route::get('/masterlist/pdf', [CoschoController::class, 'generateMasterlistPdf'])->name('masterlist.pdf');

    // 5. Detailed Views (Drill-down)
    Route::get('/scholars/{id}', [CoschoController::class, 'showScholar'])->name('show-scholar');
    Route::get('/heis/{hei}', [CoschoController::class, 'showHei'])->name('show-hei');
});


    // --- GENERAL VALIDATION (Fallback/Shared) ---
    Route::get('/validation', [ValidationController::class, 'index'])->name('validation.index');
});



















Route::middleware(['auth', 'verified', 'permission:validate submissions'])
    ->prefix('unifastrc')
    ->name('unifastrc.') // This adds the first part
    ->group(function () {
    
    Route::get('/validation', [ValidationController::class, 'index'])
        ->name('validation.index'); 
        // Result = unifastrc.validation.index

    Route::get('/validation/{enrollment}/checklist', [ValidationController::class, 'getChecklist'])
        ->name('validation.checklist');
        // Result = unifastrc.validation.checklist

    Route::post('/validation/{enrollment}/validate', [ValidationController::class, 'validateScholar'])
        ->name('validation.approve');
        // Result = unifastrc.validation.approve
});
// Chief
Route::middleware(['auth', 'role:Chief'])->group(function () {
    Route::get('/chief/dashboard', [BatchController::class, 'chiefDashboard'])->name('chief.dashboard');
    Route::post('/chief/batches/{batch}/endorse', [BatchController::class, 'endorse'])->name('chief.batches.endorse');
    Route::post('/chief/batches/{batch}/return', [BatchController::class, 'returnBatch'])->name('chief.batches.return');
});

// RD (Regional Director)
Route::middleware(['auth', 'role:RD'])->group(function () {
    Route::get('/rd/dashboard', [BatchController::class, 'rdDashboard'])->name('rd.dashboard');
    Route::post('/rd/batches/{batch}/approve', [BatchController::class, 'approve'])->name('rd.batches.approve');
    Route::post('/rd/batches/{batch}/return', [BatchController::class, 'returnBatch'])->name('rd.batches.return');
});






Route::middleware([
    'auth', 
    // FIXED: Use '|' instead of ',' to allow EITHER role
    'role:Chief of Administrative Officer|Assistant Administrative Officer' 
])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/approvals', [AdminApprovalController::class, 'index'])->name('approvals.index');
        Route::put('/approvals/{type}/{id}', [AdminApprovalController::class, 'updateStatus'])->name('approvals.update');
    });


// Cashier
Route::middleware(['auth', 'role:Cashier'])->prefix('cashier')->name('cashier.')->group(function () {

    Route::get('/dashboard', [BatchController::class, 'cashierDashboard'])->name('dashboard');
    Route::post('/batches/{batch}/pay', [BatchController::class, 'pay'])->name('batches.pay');
    Route::get('/all-requests', [FinancialRequestController::class, 'cashierAllRequests'])
        ->name('all-requests');
    Route::get('/all-requests/{financialRequest}', [FinancialRequestController::class, 'cashierAllRequests'])
        ->name('all-requests.show');

    // Action Routes
    Route::post('/pay/{request}', [FinancialRequestController::class, 'cashierPay'])
         ->name('pay'); // ✨ Renamed to 'pay'
         
    Route::post('/reject/{request}', [FinancialRequestController::class, 'reject'])
         ->name('reject'); // Points to the same 'reject' method
         
    // Report & Export Routes
    Route::get('/export/excel', [FinancialRequestController::class, 'cashierExcelExport'])
         ->name('reports.excel');
    Route::get('/export/pdf', [FinancialRequestController::class, 'cashierPdfExport'])
         ->name('reports.pdf');
});


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'role:Accounting'])->prefix('accounting')->name('accounting.')->group(function () {
    
    // Page & Modal Routes
    Route::get('/all-requests', [FinancialRequestController::class, 'accountingAllRequests'])
        ->name('all-requests');
    Route::get('/all-requests/{financialRequest}', [FinancialRequestController::class, 'accountingAllRequests'])
        ->name('all-requests.show');

    // Action Routes
    Route::post('/approve/{request}', [FinancialRequestController::class, 'accountingApprove'])
         ->name('approve');
         
    Route::post('/reject/{request}', [FinancialRequestController::class, 'reject'])
         ->name('reject'); // Points to the same 'reject' method
         
    // Report & Export Routes
    Route::get('/export/excel', [FinancialRequestController::class, 'accountingExcelExport'])
         ->name('reports.excel');
    Route::get('/export/pdf', [FinancialRequestController::class, 'accountingPdfExport'])
         ->name('reports.pdf');
});
Route::middleware(['auth', 'role:Budget'])->prefix('budget')->name('budget.')->group(function () {
    Route::get('/dashboard', [FinancialRequestController::class, 'budgetDashboard'])
        ->name('dashboard');

    // ✨ NEW: Make '/queue' just a redirect to 'all-requests' with a filter
    Route::get('/queue', function () {
        return redirect()->route('all-requests', ['status' => 'pending_budget']);
    })->name('queue');

    // ✨ This is now our MAIN page for the list
    Route::get('/all-requests', [FinancialRequestController::class, 'budgetAllRequests'])
        ->name('all-requests');
Route::post('/skip-to-cashier/{request}', [FinancialRequestController::class, 'budgetSkipToCashier'])
         ->name('skip-to-cashier');
    // ✨ This is now our MAIN route for the modal
    Route::get('/all-requests/{financialRequest}', [FinancialRequestController::class, 'budgetAllRequests'])
        ->name('all-requests.show');
        Route::post('/approve/{request}', [FinancialRequestController::class, 'budgetApprove'])
         ->name('approve'); // New name: budget.approve
         
    Route::post('/reject/{request}', [FinancialRequestController::class, 'reject'])
         ->name('reject'); // New name: budget.reject

Route::get('/reports', [FinancialRequestController::class, 'budgetReportPage'])
         ->name('reports');
    Route::get('/reports/excel', [FinancialRequestController::class, 'budgetExcelExport'])
         ->name('reports.excel');
    Route::get('/reports/pdf', [FinancialRequestController::class, 'budgetPdfExport'])
         ->name('reports.pdf');
});
Route::middleware(['auth', 'role:Chief|RD'])->prefix('management')->name('management.')->group(function () {
    
    // Page & Modal Routes
    Route::get('/financial-tracker', [FinancialRequestController::class, 'managementViewAll'])
        ->name('financial.all-requests');
    Route::get('/financial-tracker/{financialRequest}', [FinancialRequestController::class, 'managementViewAll'])
        ->name('financial.all-requests.show');
         
    // Report & Export Routes
    Route::get('/financial-tracker/export/excel', [FinancialRequestController::class, 'budgetExcelExport'])
         ->name('financial.reports.excel');
    Route::get('/financial-tracker/export/pdf', [FinancialRequestController::class, 'budgetPdfExport'])
         ->name('financial.reports.pdf');
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




Route::post('/chat', [ChatbotController::class, 'chat'])->name('chat'); // <-- 2. Add this line

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// --- PASTE YOUR CUSTOM VERIFICATION ROUTES HERE ---

