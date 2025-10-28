<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CsmpScholar;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule; // ⬅️ **ADD THIS IMPORT**

class CsmpAdminController extends Controller
{
    /**
     * Display the admin management page for CSMP applications.
     * (This index method you provided is already correct)
     */
    public function index(Request $request)
    {
        // Start with a query
        $query = CsmpScholar::with('user:id,name,email'); // Eager load user info

        // Example of filtering (you can add this to your React page later)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Example of search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('family_name', 'like', "%{$search}%")
                  ->orWhere('given_name', 'like', "%{$search}%")
                  ->orWhere('application_no', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        // Paginate the results
        $applications = $query->orderBy('created_at', 'desc')
                              ->paginate(15)
                              ->withQueryString(); // ⬅️ **ADD withQueryString()**

        // Render the Inertia page and pass the data as props
        return Inertia::render('Admin/Csmp/Application', [
            'applications' => $applications,
            'filters' => $request->only(['status', 'search']), // Send back filters
        ]);
    }
    
    // ⬇️ **ADD THIS ENTIRE NEW METHOD**
    /**
     * Update the specified application's status.
     */
    public function update(Request $request, CsmpScholar $csmpScholar)
    {
        // 1. Validate the new status
        $data = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(['Approved', 'Rejected', 'Incomplete', 'Pending'])
            ]
        ]);
        
        // 2. Update the application
        $csmpScholar->update([
            'status' => $data['status']
        ]);
        
        // 3. Redirect back to the index page with a success message
        return back()->with('success', 'Application status updated successfully.');
    }
}