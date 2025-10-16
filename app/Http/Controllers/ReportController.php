<?php

namespace App\Http\Controllers;

use App\Exports\MasterlistExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use App\Models\Scholar;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    private function getMasterlistData()
    {
        return Scholar::with('education')->orderBy('family_name', 'asc')->get();
    }

    public function generateMasterlist(Request $request)
    {
        $filename = 'CHED-STUFAPs-Masterlist-' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new MasterlistExport(), $filename);
    }

    public function generateMasterlistPdf(Request $request)
    {
        $scholars = $this->getMasterlistData();
        $pdf = Pdf::loadView('reports.masterlist-pdf', ['scholars' => $scholars]);
        return $pdf->setPaper('a4', 'landscape')->download('masterlist.pdf');
    }

    public function fetchMasterlistData(): JsonResponse
    {
        $scholars = Scholar::with(['education:scholar_id,hei_name,program'])
            ->orderBy('family_name', 'asc')
            ->get([
                'id',
                'region',
                'award_number',
                'family_name',
                'given_name',
                'middle_name',
                'extension_name',
                'sex',
            ]);

        $formattedData = $scholars->map(function ($scholar, $key) {
            return [
                'id' => $scholar->id, // ✅ ADD THIS LINE
                'no' => $key + 1,
                'region' => $scholar->region,
                'award_no' => $scholar->award_number,
                'last_name' => $scholar->family_name,
                'first_name' => $scholar->given_name,
                'middle_name' => $scholar->middle_name,
                'extension' => $scholar->extension_name,
                'sex' => $scholar->sex,
                'hei' => $scholar->education->hei_name ?? '',
                'course' => $scholar->education->program ?? '',
            ];
        });

        return response()->json($formattedData);
    }
}