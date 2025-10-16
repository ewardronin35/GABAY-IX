<?php

namespace App\Http\Controllers;

use App\Models\Scholar;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\StufapDataUpdated;

class StufapController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Eager loads all related data for performance.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Stufaps/Index', [
            'stufaps' => Scholar::with([
                'address',
                'education',
                'academicYears.thesisGrant' // Eager load nested relationships
            ])->orderBy('family_name', 'asc')->paginate(50),
        ]);
    }

    /**
     * Update or create records in bulk based on the new normalized structure.
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        // Basic validation for the incoming flat data structure
        $validated = $request->validate([
            'data' => 'required|array',
       
    ]);

            

            // Add other key validation rules as needed


        DB::transaction(function () use ($validated) {
            foreach ($validated['data'] as $row) {
                // Skip empty rows from the spreadsheet
                if (empty(array_filter($row))) {
                    continue;
                }

                // 1. Update or Create the Scholar
                $scholar = Scholar::updateOrCreate(
                    ['award_number' => $row['award_number']],
                    [
                        'award_year' => $row['award_year'] ?? null,
                        'program_name' => $row['program_name'] ?? null,
                        'status_type' => $row['status_type'] ?? null,
                        'region' => $row['region'] ?? null,
                        'family_name' => $row['family_name'] ?? null,
                        'given_name' => $row['given_name'] ?? null,
                        'middle_name' => $row['middle_name'] ?? null,
                        'extension_name' => $row['extension_name'] ?? null,
                        'sex' => $row['sex'] ?? null,
                        'date_of_birth' => $row['date_of_birth'] ?? null,
                        'registered_coconut_farmer' => $row['registered_coconut_farmer'] ?? null,
                        'farmer_registry_no' => $row['farmer_registry_no'] ?? null,
                        'special_group' => $row['special_group'] ?? null,
                        'is_solo_parent' => $row['is_solo_parent'] ?? 'NO',
        'is_senior_citizen' => $row['is_senior_citizen'] ?? 'NO',
        'is_pwd' => $row['is_pwd'] ?? 'NO',
        'is_ip' => $row['is_ip'] ?? 'NO',
        'is_first_generation' => $row['is_first_generation'] ?? 'NO',
                        'contact_no' => $row['contact_no'] ?? null,
                        'email_address' => $row['email_address'] ?? null,
                    ]
                );

                // 2. Update or Create the related Address
                $scholar->address()->updateOrCreate([], [
                    'brgy_street' => $row['address_brgy_street'] ?? null,
                    'town_city' => $row['address_town_city'] ?? null,
                    'province' => $row['address_province'] ?? null,
                    'congressional_district' => $row['address_congressional_district'] ?? null,
                ]);

                // 3. Update or Create the related Education record
                $scholar->education()->updateOrCreate([], [
                    'hei_name' => $row['education_hei_name'] ?? null,
                    'type_of_heis' => $row['education_type_of_heis'] ?? null,
                    'hei_code' => $row['education_hei_code'] ?? null,
                    'program' => $row['education_program'] ?? null,
                    'priority_program_tagging' => $row['education_priority_program_tagging'] ?? null,
                    'course_code' => $row['education_course_code'] ?? null,
                ]);

                // 4. Update or Create Academic Year 2023-2024
                $ay2023 = $scholar->academicYears()->updateOrCreate(['year' => '2023-2024'], [
                    'cy' => $row['ay_2023_cy'] ?? null,
                    'osds_date_processed' => $row['ay_2023_osds_date_processed'] ?? null,
                    'transferred_to_chedros' => $row['ay_2023_transferred_to_chedros'] ?? null,
                    'nta_financial_benefits' => $row['ay_2023_nta_financial_benefits'] ?? null,
                    'fund_source' => $row['ay_2023_fund_source'] ?? null,
                    'payment_first_sem' => $row['ay_2023_payment_first_sem'] ?? null,
                    'first_sem_disbursement_date' => $row['ay_2023_first_sem_disbursement_date'] ?? null,
                    'first_sem_status' => $row['ay_2023_first_sem_status'] ?? null,
                    'first_sem_remarks' => $row['ay_2023_first_sem_remarks'] ?? null,
                    'payment_second_sem' => $row['ay_2023_payment_second_sem'] ?? null,
                    'second_sem_disbursement_date' => $row['ay_2023_second_sem_disbursement_date'] ?? null,
                    'second_sem_status' => $row['ay_2023_second_sem_status'] ?? null,
                    'second_sem_fund_source' => $row['ay_2023_second_sem_fund_source'] ?? null,
                ]);

                // 5. Update or Create Thesis Grant for 2023-2024
                $ay2023->thesisGrant()->updateOrCreate([], [
                    'processed_date' => $row['thesis_2023_processed_date'] ?? null,
                    'details' => $row['thesis_2023_details'] ?? null,
                    'transferred_to_chedros' => $row['thesis_2023_transferred_to_chedros'] ?? null,
                    'nta' => $row['thesis_2023_nta'] ?? null,
                    'amount' => $row['thesis_2023_amount'] ?? null,
                    'disbursement_date' => $row['thesis_2023_disbursement_date'] ?? null,
                    'remarks' => $row['thesis_2023_remarks'] ?? null,
                ]);

                 // 6. Update or Create Academic Year 2024-2025
                 $ay2024 = $scholar->academicYears()->updateOrCreate(['year' => '2024-2025'], [
                    'cy' => $row['ay_2024_cy'] ?? null,
                    'osds_date_processed' => $row['ay_2024_osds_date_processed'] ?? null,
                    'transferred_to_chedros' => $row['ay_2024_transferred_to_chedros'] ?? null,
                    'nta_financial_benefits' => $row['ay_2024_nta_financial_benefits'] ?? null,
                    'fund_source' => $row['ay_2024_fund_source'] ?? null,
                    'payment_first_sem' => $row['ay_2024_payment_first_sem'] ?? null,
                    'first_sem_disbursement_date' => $row['ay_2024_first_sem_disbursement_date'] ?? null,
                    'first_sem_status' => $row['ay_2024_first_sem_status'] ?? null,
                    'first_sem_remarks' => $row['ay_2024_first_sem_remarks'] ?? null,
                    'payment_second_sem' => $row['ay_2024_payment_second_sem'] ?? null,
                    'second_sem_disbursement_date' => $row['ay_2024_second_sem_disbursement_date'] ?? null,
                    'second_sem_status' => $row['ay_2024_second_sem_status'] ?? null,
                    'second_sem_fund_source' => $row['ay_2024_second_sem_fund_source'] ?? null,
                ]);

                // 7. Update or Create Thesis Grant for 2024-2025
                $ay2024->thesisGrant()->updateOrCreate([], [
                    'processed_date' => $row['thesis_2024_processed_date'] ?? null,
                    'details' => $row['thesis_2024_details'] ?? null,
                    'transferred_to_chedros' => $row['thesis_2024_transferred_to_chedros'] ?? null,
                    'nta' => $row['thesis_2024_nta'] ?? null,
                    'amount' => $row['thesis_2024_amount'] ?? null,
                    'disbursement_date' => $row['thesis_2024_disbursement_date'] ?? null,
                    'final_disbursement_date' => $row['thesis_2024_final_disbursement_date'] ?? null,
                    'remarks' => $row['thesis_2024_remarks'] ?? null,
                ]);
            }
        });

        broadcast(new StufapDataUpdated())->toOthers();

        return back()->with('success', 'Database updated successfully.');
    }
}
