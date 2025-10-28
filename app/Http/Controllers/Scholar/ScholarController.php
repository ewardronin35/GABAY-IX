<?php

namespace App\Http\Controllers\Scholar;

use App\Http\Controllers\Controller;
use App\Models\CsmpScholar; // <-- Add this
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Add this
use Inertia\Inertia;

class ScholarController extends Controller
{
    /**
     * Show the form for creating a new CSMP application.
     */
    public function createCsmpApplication()
    {
        return Inertia::render('Student/Csmp/Apply');
    }

    /**
     * Show a page listing all the scholar's own applications.
     */
    public function showMyApplications()
    {
        $applications = CsmpScholar::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Scholar/Csmp/Application', [
            'applications' => $applications,
        ]);
    }
}