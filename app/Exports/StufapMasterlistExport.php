<?php
namespace App\Exports;

use App\Models\StufapAcademicRecord;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
// ... import other necessary concerns like WithStyles, WithEvents
use Illuminate\Http\Request;

class StufapMasterlistExport implements FromView /*, WithStyles, WithEvents */ {
    protected $request;
    public function __construct(Request $request) { $this->request = $request; }

    public function view(): View {
        $query = StufapAcademicRecord::with(['scholar', 'hei', 'course']);
        $query->when($this->request->input('search'), function ($q, $search) { /* ... search logic ... */ });
        $records = $query->latest()->get();
        return view('exports.stufap-masterlist-excel', ['records' => $records]);
    }
    // Add styles() and registerEvents() methods here for styling
}