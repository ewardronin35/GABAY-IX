<?php

namespace App\Http\Controllers;

use App\Models\GlobalAcademicPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalAcademicPeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Periods/Index', [
            'periods' => GlobalAcademicPeriod::latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'academic_year' => 'required|string|max:255',
            'semester' => 'required|integer|in:1,2',
            'name' => 'required|string|max:255',
        ]);

        GlobalAcademicPeriod::create($request->all());

        return redirect()->route('admin.periods.index')->with('success', 'Academic Period created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GlobalAcademicPeriod $period)
    {
        $request->validate([
            'academic_year' => 'required|string|max:255',
            'semester' => 'required|integer|in:1,2',
            'name' => 'required|string|max:255',
        ]);

        $period->update($request->all());

        return redirect()->route('admin.periods.index')->with('success', 'Academic Period updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GlobalAcademicPeriod $period)
    {
        // Add logic here to check if the period is in use by a batch
        // if ($period->batches()->count() > 0) {
        //     return redirect()->route('admin.periods.index')->with('error', 'Cannot delete period, it is in use by a batch.');
        // }

        $period->delete();

        return redirect()->route('admin.periods.index')->with('success', 'Academic Period deleted.');
    }
}