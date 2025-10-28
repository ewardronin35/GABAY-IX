<?php

namespace App\Http\Controllers;

use App\Exports\MasterlistExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Scholar;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Program;
use Illuminate\Support\Facades\DB;
use App\Models\Address;
class ReportController extends Controller
{
    /**
     * Builds the base query and applies search filters.
     */
    public function fetchStatisticsData()
    {
        // Example: Scholars per Region
        $scholarsPerRegion = Address::select('region', DB::raw('count(*) as total'))
            ->whereNotNull('region')
            ->groupBy('region')
            ->orderBy('total', 'desc')
            ->get();
            
        // You can add more stats here, e.g., scholars by gender
        // $scholarsBySex = Scholar::select('sex', DB::raw('count(*) as total'))->groupBy('sex')->get();

        return response()->json([
            'scholarsPerRegion' => $scholarsPerRegion,
            // 'scholarsBySex' => $scholarsBySex,
        ]);
    }

    /**
     * ✅ NEW: Generates a PDF report with embedded chart image and stats.
     */
    public function generateStatisticsPdf(Request $request)
    {
        $request->validate([
            'chartImage' => 'required|string', // Expects a Base64 string
        ]);

        // Fetch the same data again to display in the PDF tables
        $stats = $this->fetchStatisticsData()->getData(true);

        $pdf = Pdf::loadView('exports.statistics-report', [
            'stats' => $stats,
            'chartImage' => $request->input('chartImage'),
        ]);

        return $pdf->setPaper('a4', 'portrait')->download('Scholarship-Statistics-Report.pdf');
    }

    private function getMasterlistQuery(Request $request)
    {
        $coschoProgram = Program::where('program_name', 'COSCHO')->first();
        $query = Scholar::where('program_id', $coschoProgram?->id)
            ->with(['address', 'education.hei', 'education.course', 'academicYears']);

        $query->when($request->input('search'), function ($q, $search) {
            // ... (your existing search logic is correct and remains here)
            return $q->where(function($subQ) use ($search) {
                $subQ->where('family_name', 'LIKE', "%{$search}%")
                     ->orWhere('given_name', 'LIKE', "%{$search}%")
                     ->orWhereHas('academicYears', function ($ayQuery) use ($search) {
                         $ayQuery->where('award_number', 'LIKE', "%{$search}%");
                     })
                     ->orWhereHas('education.hei', function ($heiQuery) use ($search) {
                         $heiQuery->where('hei_name', 'LIKE', "%{$search}%");
                     });
            });
        });

        return $query->orderBy('family_name', 'asc');
    }

    /**
     * ✅ NEW: Centralized helper to format Eloquent data into a simple array.
     * This is the logic you correctly identified from CoschoController.
     */
// In ReportController.php

private function formatDataForView($scholars)
{
    return $scholars->map(function ($scholar, $key) {
        $latestAcademicYear = $scholar->academicYears->sortByDesc('academic_year')->first();
        return [
            'no' => $key + 1,
            'award_no' => $latestAcademicYear->award_number ?? 'N/A',
            'last_name' => $scholar->family_name,
            'first_name' => $scholar->given_name,
            'middle_name' => $scholar->middle_name, // ✅ ADD THIS
            'sex' => $scholar->sex,                 // ✅ ADD THIS
            'hei' => $scholar->education->hei->hei_name ?? 'N/A',
            'course' => $scholar->education->course->course_name ?? 'N/A',
            'region' => $scholar->address->region ?? 'N/A',
            'status' => $latestAcademicYear->status_type ?? 'N/A',
        ];
    });
}

    public function generateMasterlistExcel(Request $request)
    {
        $query = $this->getMasterlistQuery($request);
        $filename = 'CHED-STUFAPs-Masterlist-' . now()->format('Y-m-d') . '.xlsx';
        
        // The MasterlistExport class will now handle its own formatting.
        return Excel::download(new MasterlistExport($query), $filename);
    }

    public function generateMasterlistPdf(Request $request)
    {
        $scholarsCollection = $this->getMasterlistQuery($request)->get();
        // ✅ FIX: Use the new helper to format the data before passing it to the view.
        $formattedScholars = $this->formatDataForView($scholarsCollection);

        // ✅ FIX: Correct the view path to match your file structure.
        $pdf = Pdf::loadView('reports.masterlist-pdf', ['scholars' => $formattedScholars]);
        
        return $pdf->setPaper('a4', 'landscape')->download('masterlist.pdf');
    }
}