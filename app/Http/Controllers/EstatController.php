<?php

namespace App\Http\Controllers;

use App\Models\Estatskolar;
use App\Models\EstatskolarMonitoring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Jobs\ProcessEstatskolarImport; // The background job
use App\Exports\EstatskolarMasterlistExport; // The export class
use Illuminate\Http\JsonResponse; // ✅ ADD THIS LINE
class EstatController extends Controller
{
    /**
     * Display the main E-STAT management page.
     */
    public function index(Request $request): Response
    {
        // For performance, we only load monitorings when absolutely needed.
        $query = Estatskolar::query();

        $query->when($request->input('search'), function ($q, $search) {
            return $q->where('award_number', 'like', "%{$search}%")
                     ->orWhere('last_name', 'like', "%{$search}%")
                     ->orWhere('first_name', 'like', "%{$search}%");
        });
        
        // Eager load monitorings only for the monitoring grid's data source if needed
        $beneficiaries = (clone $query)->with('monitorings')->orderBy('last_name', 'asc')->paginate(50)->withQueryString();

        return Inertia::render('Admin/Estat/Index', [
            'beneficiaries' => $beneficiaries,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Handle bulk updates from the main Database Grid.
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // Skip if the main identifier is missing
                if (empty($row['award_number'])) {
                    continue;
                }

                // Use updateOrCreate to either update an existing scholar or create a new one.
                // It finds the scholar by 'award_number'.
                Estatskolar::updateOrCreate(
                    ['award_number' => $row['award_number']], // Key to find the record
                    [
                        'scholarship_type' => $row['scholarship_type'] ?? null,
                        'region' => $row['region'] ?? null,
                        'lrn' => $row['lrn'] ?? null,
                        'last_name' => $row['last_name'] ?? null,
                        'first_name' => $row['first_name'] ?? null,
                        'middle_name' => $row['middle_name'] ?? null,
                        'extension_name' => $row['extension_name'] ?? null,
                        'birthdate' => $row['birthdate'] ?? null,
                        'sex' => $row['sex'] ?? null,
                        'civil_status' => $row['civil_status'] ?? null,
                        'brgy_psgc_code' => $row['brgy_psgc_code'] ?? null,
                        'city_psgc_code' => $row['city_psgc_code'] ?? null,
                        'province_psgc_code' => $row['province_psgc_code'] ?? null,
                        'uii_code' => $row['uii_code'] ?? null,
                        'hei_name' => $row['hei_name'] ?? null,
                        'priority_program_code' => $row['priority_program_code'] ?? null,
                        'program_name' => $row['program_name'] ?? null,
                        'special_equity_group' => $row['special_equity_group'] ?? null,
                        'special_equity_group_type' => $row['special_equity_group_type'] ?? null,
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Database updated successfully!');
    }

    /**
     * Handle bulk updates from the Monitoring Grid.
     */
    public function monitoringBulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate(['data' => 'required|array']);

        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // We use 'id' from the monitoring table (mapped to 'NO' in the grid)
                if (empty($row['id'])) continue; 

                // Find the record by its 'id' and update it
                EstatskolarMonitoring::where('id', $row['id'])->update([
                    'current_year_level_1st_sem' => $row['current_year_level_1st_sem'] ?? null,
                    'status_1st_semester' => $row['status_1st_semester'] ?? null,
                    'osds_fund_release_amount_1st_semester' => $row['osds_fund_release_amount_1st_semester'] ?? null,
                    'osds_fund_release_date_1st_semester' => $row['osds_fund_release_date_1st_semester'] ?? null,
                    'chedro_payment_amount_1st_semester' => $row['chedro_payment_amount_1st_semester'] ?? null,
                    'chedro_payment_date_1st_semester' => $row['chedro_payment_date_1st_semester'] ?? null,
                    'mode_of_payment_1st_semester' => $row['mode_of_payment_1st_semester'] ?? null,
                    'current_year_level_2nd_sem' => $row['current_year_level_2nd_sem'] ?? null,
                    'status_2nd_semester' => $row['status_2nd_semester'] ?? null,
                    'osds_fund_release_amount_2nd_semester' => $row['osds_fund_release_amount_2nd_semester'] ?? null,
                    'osds_fund_release_date_2nd_semester' => $row['osds_fund_release_date_2nd_semester'] ?? null,
                    'chedro_payment_amount_2nd_semester' => $row['chedro_payment_amount_2nd_semester'] ?? null,
                    'chedro_payment_date_2nd_semester' => $row['chedro_payment_date_2nd_semester'] ?? null,
                    'mode_of_payment_2nd_semester' => $row['mode_of_payment_2nd_semester'] ?? null,
                    'remarks' => $row['remarks'] ?? null,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Monitoring data updated successfully!');
    }

    /**
     * Handle the import request by dispatching a background job.
     */
public function import(Request $request): JsonResponse // ✅ Change this from RedirectResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $filePath = $validated['file']->store('imports');

        ProcessEstatskolarImport::dispatch($filePath);

        // ✅ Return a JSON response
        return response()->json([
            'message' => 'File received! The import is now processing in the background.'
        ]);
    }

    /**
     * Fetch aggregated data for the report generator.
     */
public function fetchStatisticsData()
    {
        $stats = [
            'by_region' => Estatskolar::select('region', DB::raw('count(*) as count'))
                ->whereNotNull('region')
                ->groupBy('region')->orderBy('count', 'desc')->pluck('count', 'region'),
            'by_sex' => Estatskolar::select('sex', DB::raw('count(*) as count'))
                ->whereNotNull('sex')
                ->groupBy('sex')->pluck('count', 'sex'),
        ];
        return response()->json($stats);
    }
    
    /**
     * Generate Excel and PDF reports.
     */
    public function generateMasterlistExcel()
    {
        return Excel::download(new EstatskolarMasterlistExport, 'Estatskolar-Masterlist.xlsx');
    }

    public function generateMasterlistPdf()
    {
        $beneficiaries = Estatskolar::orderBy('last_name', 'asc')->get();
        $pdf = Pdf::loadView('reports.estatskolar-masterlist', ['beneficiaries' => $beneficiaries]);
        return $pdf->setPaper('legal', 'landscape')->stream('Estatskolar-Masterlist.pdf');
    }
    
    public function generateStatisticsPdf()
    {
        $stats = $this->fetchStatisticsData()->getData(true);
        $pdf = Pdf::loadView('reports.estatskolar-statistics', ['stats' => $stats]);
        return $pdf->stream('Estatskolar-Statistics.pdf');
    }
}