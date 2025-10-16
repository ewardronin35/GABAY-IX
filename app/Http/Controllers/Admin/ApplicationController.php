<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the scholarship applications.
     */
    public function index(Request $request): Response
    {
        $applications = ScholarshipApplication::with('user') // Eager load the user details
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
        ]);
    }
    public function reject(ScholarshipApplication $application): RedirectResponse
{
    $application->update(['status' => 'rejected']);

    // You can also add logic here to notify the user via email.

    return back()->with('success', 'Application has been rejected.');
}
}