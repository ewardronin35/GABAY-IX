<?php

namespace App\Http\Controllers;

use App\Models\Scholar;
use App\Models\Program;
use App\Models\Address;
use App\Models\Education;
use App\Models\AcademicYear;
use App\Models\HEI;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log; // ✅ ADD THIS LINE
use App\Imports\CoschoImport; // Add this
use Maatwebsite\Excel\Facades\Excel; // Add this


class CoschoController extends Controller
{
  

public function masterlistData(Request $request) // ✅ Add Request $request
    {
        $coschoProgram = Program::where('program_name', 'COSCHO')->first();

        // ▼▼▼ MODIFIED QUERY BLOCK ▼▼▼
       $query = Scholar::where('program_id', $coschoProgram?->id)
            ->with(['address', 'education.hei', 'education.course', 'academicYears']);

        // Add server-side search functionality
        $query->when($request->input('search'), function ($q, $search) {
            return $q->where(function($subQ) use ($search) {
                $subQ->where('family_name', 'LIKE', "%{$search}%")
                     ->orWhere('given_name', 'LIKE', "%{$search}%")
                     ->orWhere('award_number', 'LIKE', "%{$search}%")
                     ->orWhereHas('education.hei', function ($heiQuery) use ($search) {
                         $heiQuery->where('hei_name', 'LIKE', "%{$search}%");
                     })
                     ->orWhereHas('education.course', function ($courseQuery) use ($search) {
                         $courseQuery->where('course_name', 'LIKE', "%{$search}%");
                     });
            });
        });

        // P            aginate the results instead of getting all of them
        $paginatedScholars = $query->orderBy('family_name', 'asc')->paginate(15); // Paginate 15 per page
        // ▲▲▲ END OF MODIFIED BLOCK ▲▲▲

        // Use the paginator's `through()` method to transform the data for the current page
        $transformedPaginatedData = $paginatedScholars->through(function ($scholar, $index) use ($paginatedScholars) {
            $latestAcademicYear = $scholar->academicYears->sortByDesc('academic_year')->first();
            
            // Calculate the row number based on the current page
            $pageNumber = $paginatedScholars->currentPage();
            $perPage = $paginatedScholars->perPage();
            $rowNumber = ($pageNumber - 1) * $perPage + $index + 1;

            return [
                'id' => $scholar->id,
                'no' => $rowNumber, // Use the calculated row number
                'award_no' => $scholar->award_number,
                'last_name' => $scholar->family_name,
                'first_name' => $scholar->given_name,
                'hei' => $scholar->education->hei->hei_name ?? 'N/A',
                'course' => $scholar->education->course->course_name ?? 'N/A',
                'region' => $scholar->address->region ?? 'N/A',
                'status' => $latestAcademicYear->status_type ?? 'N/A',
            ];
        });

        return response()->json($transformedPaginatedData);
    }
public function update(Request $request, Scholar $scholar)
{
    $validated = $request->validate([
        'last_name' => 'required|string|max:255',
        'first_name' => 'required|string|max:255',
        'hei' => 'required|string|max:255',
        'course' => 'required|string|max:255',
    ]);

    DB::transaction(function () use ($validated, $scholar) {
        $scholar->update([
            'family_name' => $validated['last_name'],
            'given_name' => $validated['first_name'],
        ]);

        $hei = HEI::firstOrCreate(['hei_name' => $validated['hei']]);
        $course = Course::firstOrCreate(['course_name' => $validated['course']]);

        $scholar->education()->update([
            'hei_id' => $hei->id,
            'course_id' => $course->id,
        ]);
    });

    // Reload the relationships to return the updated, flattened data
    $scholar->load(['address', 'education.hei', 'education.course', 'academicYears']);
    $latestAcademicYear = $scholar->academicYears->sortByDesc('academic_year')->first();

    // Return the same structure as the masterlistData method
    return response()->json([
        'id' => $scholar->id,
        'award_no' => $scholar->award_number,
        'last_name' => $scholar->family_name,
        'first_name' => $scholar->given_name,
        'hei' => $scholar->education->hei->hei_name ?? 'N/A',
        'course' => $scholar->education->course->course_name ?? 'N/A',
        'region' => $scholar->address->region ?? 'N/A',
        'status' => $latestAcademicYear->status_type ?? 'N/A',
    ]);
}
public function import(Request $request) // Can return JsonResponse or RedirectResponse
{
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,xlsm'
    ]);

    try {
        Excel::import(new CoschoImport, $request->file('file'));
        
        // ✅ Return a JSON response for FilePond
        return response()->json(['message' => 'File imported successfully!']);

    } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
        $failures = $e->failures();
        Log::error('Excel import validation failed.', ['failures' => $failures]);

        // ✅ Return a JSON error response
        return response()->json(['message' => 'Validation failed for some rows.'], 422);

    } catch (\Exception $e) {
        Log::error('General Excel import failed: ' . $e->getMessage());

        // ✅ Return a JSON error response
        return response()->json(['message' => 'An unexpected error occurred.'], 500);
    }
}
   // In app/Http/Controllers/CoschoController.php

public function index(Request $request): Response
{
    // 1. Get the COSCHO Program ID
    $coschoProgram = Program::where('program_name', 'COSCHO')->first();

    // 2. FIX: Use 'whereHas' on the 'records' relationship
    // This translates to: "Give me Scholars where exists a Record with program_id = COSCHO"
    $query = Scholar::with(['program', 'address', 'education.hei', 'education.course', 'academicYears.thesisGrant'])
        ->whereHas('records', function($q) use ($coschoProgram) {
             // Make sure 'records' table has 'program_id'
            $q->where('program_id', $coschoProgram->id);
        });

    // --- Search Block (Unchanged) ---
    $query->when($request->input('search'), function ($q, $search) {
        return $q->where(function($subQ) use ($search) {
            $subQ->where('family_name', 'LIKE', "%{$search}%")
                 ->orWhere('given_name', 'LIKE', "%{$search}%")
                 // Fix: Search inside 'records' for award number if that's where it lives
                 ->orWhereHas('records', function ($recQuery) use ($search) {
                     $recQuery->where('award_number', 'LIKE', "%{$search}%");
                 })
                 ->orWhereHas('education.hei', function ($heiQuery) use ($search) {
                     $heiQuery->where('hei_name', 'LIKE', "%{$search}%");
                 });
        });
    });

    // --- Region Filter (Unchanged) ---
    $query->when($request->input('region'), function ($q, $region) {
        if ($region !== 'all') {
            return $q->whereHas('address', fn($subQ) => $subQ->where('region', 'LIKE', $region));
        }
    });

    // --- HEI Filter (Unchanged) ---
    $query->when($request->input('hei'), function ($q, $hei) {
        if ($hei !== 'all') {
            return $q->whereHas('education.hei', fn($subQ) => $subQ->where('hei_name', 'LIKE', $hei));
        }
    });

    $scholars = $query->orderBy('family_name', 'asc')
                      ->paginate(50)
                      ->withQueryString();

    $allRegions = Address::whereNotNull('region')->distinct()->orderBy('region')->pluck('region');
    $allHeis = HEI::whereNotNull('hei_name')->distinct()->orderBy('hei_name')->pluck('hei_name');

    return Inertia::render('Admin/Coshco/Index', [
        'scholars' => $scholars,
        'allRegions' => $allRegions,
        'allHeis' => $allHeis,
        'filters' => $request->only(['region', 'hei', 'search']),
    ]);
}
    /**
     * Store a new COSCHO scholar in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            // --- Scholar Fields ---
            'family_name' => 'required|string|max:255',
            'given_name' => 'required|string|max:255',
            'email_address' => 'required|email|unique:scholars,email_address',
            // ... add all other relevant validation rules
        ]);

        DB::transaction(function () use ($request) {
            $coschoProgram = Program::firstOrCreate(['program_name' => 'COSCHO']);

            // 1. Create Scholar
            $scholar = Scholar::create(array_merge($request->except(['address', 'education', 'academic_year']), [
                'program_id' => $coschoProgram->id,
            ]));

            // 2. Create Address
            if ($request->has('address')) {
                $scholar->address()->create($request->input('address'));
            }

            // 3. Create Education
            if ($request->has('education')) {
                $scholar->education()->create($request->input('education'));
            }

            // 4. Create Initial Academic Year
            if ($request->has('academic_year')) {
                $scholar->academicYears()->create($request->input('academic_year'));
            }
        });

        return redirect()->route('coscho.index')->with('success', 'New COSCHO scholar added.');
    }

    /**
     * Update or create records in bulk from the spreadsheet.
     */
   /**
 * Update or create records in bulk using a fully normalized structure.
 * This function expects a flat array of data for each row.
 */
public function bulkUpdate(Request $request): RedirectResponse
{
    $validated = $request->validate(['data' => 'required|array']);
    Log::info('Bulk update request received:', $request->all());

    DB::transaction(function () use ($validated) {
        // Find or create the main scholarship program
        $coschoProgram = Program::firstOrCreate(
            ['program_name' => 'COSCHO'],
            ['description' => 'Coconut Scholarship from CHED and PCA']
        );

        foreach ($validated['data'] as $index => $row) {
            Log::info("Processing row {$index}:", $row);

            // --- Data Integrity Check ---
            // Skip the entire row if essential information like name or school is missing
            // ✅ CORRECTED CHECK
if (empty($row['family_name']) || empty($row['education_hei_name'])) {
    Log::warning("Skipping row {$index} due to missing family_name or education_hei_name.");
    continue;
}

            // --- Data Sanitization & Preparation ---
            $email = (isset($row['email_address']) && strcasecmp($row['email_address'], 'N/A') !== 0 && !empty($row['email_address']))
                ? $row['email_address']
                : 'placeholder-' . uniqid() . '@gabay-ix.com';

            // --- Normalization: Find or Create Related Models ---
            
            // 1. Find or create the HEI (University)
           $hei = HEI::firstOrCreate(
    ['hei_name' => $row['education_hei_name']], // <-- Use the correct prefixed key
    [
        'type_of_heis' => $row['education_type_of_heis'] ?? 'Unknown',
        'city' => $row['address_town_city'] ?? null,
        'province' => $row['address_province'] ?? null,
        'district' => $row['address_congressional_district'] ?? null,
        'hei_code' => $row['education_hei_code'] ?? null, // Also good to save this
    ]
);

            // 2. Find or create the Course
        $courseName = !empty($row['education_program']) ? $row['education_program'] : 'Unknown';

// Now, safely create or find the course.
$course = Course::firstOrCreate(['course_name' => $courseName]);

            // --- Database Operations ---

            // 3. Update or Create the Scholar record with their permanent info
            $scholar = Scholar::updateOrCreate(
                ['email_address' => $email],
                [
                    'seq' => $row['seq'] ?? null,
                    'program_id' => $coschoProgram->id,
                    'family_name' => $row['family_name'] ?? null,
                    'given_name' => $row['given_name'] ?? null,
                    'middle_name' => $row['middle_name'] ?? null,
                    'extension_name' => $row['extension_name'] ?? null,
                    'sex' => $row['sex'] ?? null,
                    'date_of_birth' => $this->sanitizeDate($row['date_of_birth'] ?? null),
                    'contact_no' => $row['contact_no'] ?? null,
                    'registered_coconut_farmer' => $row['registered_coconut_farmer'] ?? null,
                    'farmer_registry_no' => $row['farmer_registry_no'] ?? null,
                    'special_group' => $row['special_group'] ?? null,
                    'is_solo_parent' => $this->convertToBoolean($row['is_solo_parent'] ?? false),
                    'is_senior_citizen' => $this->convertToBoolean($row['is_senior_citizen'] ?? false),
                    'is_pwd' => $this->convertToBoolean($row['is_pwd'] ?? false),
                    'is_ip' => $this->convertToBoolean($row['is_ip'] ?? false),
                    'is_first_generation' => $this->convertToBoolean($row['is_first_generation'] ?? false),
                ]
            );
            
            // 4. Update or Create the associated Address
            $scholar->address()->updateOrCreate(
                ['scholar_id' => $scholar->id],
                [
'brgy_street' => $row['address_brgy_street'] ?? null,
        'town_city' => $row['address_town_city'] ?? null,
        'province' => $row['address_province'] ?? null,
        'congressional_district' => $row['address_congressional_district'] ?? null,
        'zip_code' => $row['zip_code'] ?? null, // Note: zip_code is missing in your frontend map
        // ✅ Quick Fix
'region' => $row['region'] ?? 'N/A', // Provide 'N/A' if region is missing
                ]
            );

            // 5. Update or Create the Education record using the normalized IDs
            $scholar->education()->updateOrCreate(
              ['scholar_id' => $scholar->id],
    [
        'hei_id' => $hei->id,
        'course_id' => $course->id,
        // ✅ CORRECTED: Use the prefixed key
        'priority_program_tagging' => $row['education_priority_program_tagging'] ?? null,
        'course_code' => $row['education_course_code'] ?? null,
    ]
);
            
            // 6. Update or Create all relevant Academic Year records
            // This structure makes it easy to add more years from your Excel file
            $this->updateAcademicYear($scholar, $row, '2023-2024', 'ay_2023');
            $this->updateAcademicYear($scholar, $row, '2024-2025', 'ay_2024');
            // Example for another semester/year. The prefix must match your frontend data.
            // $this->updateAcademicYear($scholar, $row, '2024-2025', '1st Semester', 'ay_2024');
        }
    });

    return redirect()->back()->with('success', 'COSCHO data has been updated successfully.');
}
    /**
     * Helper function to update or create an academic year record.
     */
   /**
 * Helper function to update or create an academic year record.
 * NOTE: This version is corrected to match the keys from the CoschoGrid.tsx component.
 */
private function updateAcademicYear($scholar, $row, $year, $prefix)
{
    // Check if there is any core data for this academic year. 
    // We use 'cy' (Course Year) as it's a good indicator of an active record.
    if (empty($row[$prefix . '_cy'])) {
        return; // Silently skip if no data for this academic year exists.
    }

    $academicYear = $scholar->academicYears()->updateOrCreate(
        ['academic_year' => $year], // Assuming one record per scholar per academic year
        [
            'semester' => 'Both', // Assuming both semesters unless specified otherwise
            // General AY Info
            'award_year' => $row['award_year'] ?? null,
            'status_type' => $row['status_type'] ?? null,
            'award_number' => $row['award_number'] ?? null,
            'osds_date_processed' => $this->sanitizeDate($row[$prefix . '_osds_date_processed'] ?? null),
                        'osds_date_processed2' => $this->sanitizeDate($row[$prefix . '_osds_date_processed2'] ?? null),
'transferred_to_chedros' => $this->sanitizeCurrency($row[$prefix . '_transferred_to_chedros'] ?? null),
'transferred_to_chedros2' => $this->sanitizeCurrency($row[$prefix . '_transferred_to_chedros2'] ?? null),  
          'nta_financial_benefits' => $row[$prefix . '_nta_financial_benefits'] ?? null,
            'nta_financial_benefits2' => $row[$prefix . '_nta_financial_benefits2'] ?? null,
            'fund_source' => $row[$prefix . '_fund_source'] ?? null,

            // First Semester
          'payment_first_sem' => $this->sanitizeCurrency($row[$prefix . '_payment_first_sem'] ?? null), // ✅ USE HELPER
            'first_sem_disbursement_date' => $this->sanitizeDate($row[$prefix . '_first_sem_disbursement_date'] ?? null),
            'first_sem_status' => $row[$prefix . '_first_sem_status'] ?? null,
            'first_sem_remarks' => $row[$prefix . '_first_sem_remarks'] ?? null,
            
            // Second Semester
          'payment_second_sem' => $this->sanitizeCurrency($row[$prefix . '_payment_second_sem'] ?? null), // ✅ USE HELPER
            'second_sem_disbursement_date' => $this->sanitizeDate($row[$prefix . '_second_sem_disbursement_date'] ?? null),
            'second_sem_status' => $row[$prefix . '_second_sem_status'] ?? null,
            'second_sem_fund_source' => $row[$prefix . '_second_sem_fund_source'] ?? null,
        ]
    );

    // Update or Create Thesis Grant for this Academic Year
    // Use a key that reliably indicates a thesis grant exists, like the amount.
    if (!empty($row[$prefix . '_thesis_amount'])) {
         $academicYear->thesisGrant()->updateOrCreate([], [
            'processed_date' => $this->sanitizeDate($row[$prefix . '_thesis_processed_date'] ?? null),
            'details' => $row[$prefix . '_thesis_details'] ?? null,
            'transferred_to_chedros' => $this->sanitizeDate($row[$prefix . '_thesis_transferred_to_chedros'] ?? null),
            'nta' => $row[$prefix . '_thesis_nta'] ?? null,
            'amount' => $row[$prefix . '_thesis_amount'],
            'disbursement_date' => $this->sanitizeDate($row[$prefix . '_thesis_disbursement_date'] ?? null),
            'final_disbursement_date' => $this->sanitizeDate($row[$prefix . '_thesis_final_disbursement_date'] ?? null),
            'remarks' => $row[$prefix . '_thesis_remarks'] ?? null,
        ]);
    }
}
private function sanitizeCurrency($value): ?float
    {
        if (empty($value) || !is_string($value)) {
            return null;
        }
        // Remove commas, spaces, and any non-numeric characters except the decimal point.
        $cleanedValue = preg_replace('/[^\d.]/', '', $value);
        return is_numeric($cleanedValue) ? (float)$cleanedValue : null;
    }
    /**
     * Helper function to convert 'YES'/'NO' strings to boolean.
     */
    private function convertToBoolean($value): bool
    {
        return in_array(strtoupper($value), ['YES', 'TRUE', '1']);
    }
private function sanitizeDate($value): ?string
{
    // Return null immediately for common non-date values or empty strings
    if (empty($value) || !is_string($value) || strcasecmp(trim($value), 'N/A') === 0 || str_contains($value, '&')) {
        return null;
    }

    try {
        // Use Carbon to intelligently parse various date formats (e.g., 'm/d/Y', 'Y-m-d')
        // and format it to the standard 'Y-m-d' that the database expects.
        return \Carbon\Carbon::parse(trim($value))->format('Y-m-d');
    } catch (\Exception $e) {
        // If Carbon fails to parse the string, it's not a valid date.
        // We log the problematic value for debugging and safely return null.
        Log::warning("Could not parse date value: '{$value}'. It will be saved as NULL.");
        return null;
    }
}
}