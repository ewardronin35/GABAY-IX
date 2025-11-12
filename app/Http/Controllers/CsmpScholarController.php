<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCsmpScholarRequest;
use App\Models\CsmpScholar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests; // Add this if you need request validation in other methods
use Illuminate\Routing\Controller as BaseController; // Add this line
use Inertia\Inertia; // ⬅️ **ADD THIS IMPORT**
class CsmpScholarController extends BaseController // Change to extend BaseController
{
    use AuthorizesRequests; // You already have this
    use ValidatesRequests; // Add this if needed for validation in controller methods

    public function __construct()
    {
        // Apply authorization policy to all methods
        // This links the controller to CsmpScholarPolicy
        $this->authorizeResource(CsmpScholar::class, 'csmp_scholar');
    }

    /**
     * Display a listing of the logged-in user's applications.
     */
 public function index(Request $request)
{
    // 2. Get sort parameters from the request
    $sortBy = $request->query('sort_by', 'created_at');
    $sortDirection = $request->query('sort_direction', 'desc');

    // 3. Whitelist valid sort columns to prevent bad queries
    $validColumns = [
        'application_no',
        'academic_year',
        'created_at',
        'status'
    ];

    if (!in_array($sortBy, $validColumns)) {
        $sortBy = 'created_at'; // Default to 'created_at' if invalid
    }

    // 4. Build the query
    $applications = CsmpScholar::query()
        ->where('user_id', $request->user()->id)
        ->orderBy($sortBy, $sortDirection)
        ->select([ // Only select what's needed for the list
            'id',
            'application_no',
            'academic_year',
            'semester',
            'status',
            'created_at'
        ])
        // 5. Use paginate() instead of get()
        ->paginate(10) // Show 10 per page (you can change this)
        ->withQueryString(); // 6. IMPORTANT: This appends all query params (like sorting) to pagination links

    return Inertia::render('Scholar/MySubmissions', [
        'applications' => $applications,
        // 7. Pass the query params back to the view
        'queryParams' => $request->query(),
    ]);
}

    /**
     * Store a new scholarship application.
     * We type-hint 'StoreCsmpScholarRequest' to automatically validate the data.
     */
    public function store(StoreCsmpScholarRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        // Check if user already applied for this academic year
        $existing = CsmpScholar::where('user_id', $user->id)
            ->where('academic_year', $data['academic_year'])
            ->where('semester', $data['semester'])
            ->first();

        // ⬆️ **REMOVED DUPLICATE QUERY BLOCK THAT WAS HERE**

        if ($existing) {
            return back()->withErrors([
                'duplicate' => 'You have already submitted an application for this period.'
            ])->withInput();
        }

        // Generate a unique application number
        $appNo = "CSMP-{$data['academic_year']}-" . str_pad($user->id, 6, '0', STR_PAD_LEFT);

        $data['user_id'] = $user->id;
        $data['application_no'] = $appNo;
        $data['status'] = 'Pending';

        $scholarApplication = CsmpScholar::create($data);

        return redirect()->route('scholar.csmp.my-applications')
                         ->with('success', 'Application submitted successfully!');
    }
   
    /**
     * ⬆️ **ADD THIS ENTIRE NEW METHOD**
     * Show the form for creating a new application.
     * This is the method that will render your Application.tsx component.
     */
 public function create(Request $request)
    {
        // Define the current application period (you can make this dynamic later)
        $currentAcademicYear = '2025-2026';
        $currentSemester = '1st';

        // Check if an application already exists for this period
        $existing = CsmpScholar::where('user_id', $request->user()->id)
            ->where('academic_year', $currentAcademicYear)
            ->where('semester', $currentSemester)
            ->first();

        if ($existing) {
            // If they already applied, DON'T show the form.
            // Redirect them straight to their submissions list with a message.
            return redirect()->route('scholar.csmp.my-applications')
                             ->with('info', 'You have already submitted an application for this period.');
        }

       return Inertia::render('Scholar/Csmp/Application', [
            // --- THIS IS THE FIX ---
            // We changed profile_photo_url to 'avatar' to match your users table
            'profilePhotoUrl' => $request->user()->avatar_url
        ]);
    }

    /**
     * Display the specified application.
     * The policy automatically ensures the user owns this application.
     */
    public function show(CsmpScholar $csmpScholar)
    {
        return response()->json($csmpScholar);
    }

    /**
     * Update the specified application.
     * (Admin Only - Policy will block students)
     */
    public function update(Request $request, CsmpScholar $csmpScholar)
    {
        // Example: Admin updating status
        // You would create a separate Form Request for this
        $data = $request->validate([
            'status' => 'required|string|in:Pending,Approved,Rejected,Incomplete',
        ]);

        $csmpScholar->update($data);
        return response()->json($csmpScholar);
    }

    /**
     * Remove the specified application.
     * (Admin Only - Policy will block students)
     */
    public function destroy(CsmpScholar $csmpScholar)
    {
        $csmpScholar->delete();
        return response()->json(null, 204); // 204 No Content
    }
    public function edit(CsmpScholar $csmpScholar)
{
    // The 'authorize' method will automatically use the 'update'
    // rule from your CsmpScholarPolicy.
    // This stops users from editing applications that aren't 'Incomplete'.
    $this->authorize('update', $csmpScholar);

    // Render the same application form, but pass the
    // existing application data as a prop.
    return Inertia::render('Scholar/Apply', [
        'applicationData' => $csmpScholar
    ]);
}
}