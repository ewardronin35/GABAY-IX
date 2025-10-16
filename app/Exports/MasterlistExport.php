<?php
// in app/Exports/MasterlistExport.php

namespace App\Exports;

use App\Models\Scholar;
use Illuminate\Contracts\View\View; // Import View
use Maatwebsite\Excel\Concerns\FromView; // Use FromView

class MasterlistExport implements FromView // Implement FromView
{
    public function view(): View
    {
        // This tells Laravel Excel to render a Blade view for the sheet
        return view('exports.masterlist-excel', [
            'scholars' => Scholar::with('education')->orderBy('family_name', 'asc')->get()
        ]);
    }
}