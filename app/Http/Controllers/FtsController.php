<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubAllotment;
use App\Models\Obligation;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FtsController extends Controller
{
    /**
     * Dashboard: View all SAAs and their balances
     */
    public function index()
    {
        $saas = SubAllotment::with('program')
            ->withSum('obligations', 'amount') // Efficiently sum utilization
            ->orderBy('date_received', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Fts/Index', [
            'saas' => $saas
        ]);
    }

    /**
     * Store a new SAA (Fund Source)
     */
    public function storeSaa(Request $request)
    {
        $validated = $request->validate([
            'saa_number' => 'required|unique:sub_allotments,saa_number',
            'program_id' => 'required|exists:programs,id',
            'total_amount' => 'required|numeric|min:0',
            'date_received' => 'required|date',
        ]);

        SubAllotment::create($validated);

        return back()->with('success', 'SAA created successfully.');
    }

    /**
     * Store a Transaction (Obligation)
     */
    public function storeObligation(Request $request)
    {
        $validated = $request->validate([
            'sub_allotment_id' => 'required|exists:sub_allotments,id',
            'ors_number' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'particulars' => 'required|string',
            'date_processed' => 'required|date',
        ]);

        // 1. Check Balance First (Business Logic)
        $saa = SubAllotment::find($validated['sub_allotment_id']);
        if ($validated['amount'] > $saa->balance) {
            return back()->with('error', 'Insufficient balance in this SAA!');
        }

        // 2. Create Transaction
        Obligation::create([
            'sub_allotment_id' => $validated['sub_allotment_id'],
            'ors_number' => $validated['ors_number'],
            'amount' => $validated['amount'],
            'particulars' => $validated['particulars'],
            'date_processed' => $validated['date_processed'],
            // Add logic here if you want to link to specific Scholar/HEI IDs
            'payee_name' => $request->input('payee_name'), 
        ]);

        return back()->with('success', 'Obligation recorded successfully.');
    }
}