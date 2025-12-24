<?php

namespace App\Http\Controllers;

use App\Models\LeaveApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveFormController extends Controller
{
    public function index()
    {
        return Inertia::render('PersonnelLocator/LeaveForm');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'office_department' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:100',
                'first_name' => 'required|string|max:100',
                'middle_name' => 'nullable|string|max:100',
                'date_of_filing' => 'required|date',
                'position' => 'nullable|string|max:100',
                'salary' => 'nullable|numeric',
                'leave_type' => 'required|string|max:100',
                'leave_type_others' => 'nullable|string|max:255',
                'working_days' => 'nullable|integer',
                'inclusive_date_start' => 'nullable|date',
                'inclusive_date_end' => 'nullable|date|after_or_equal:inclusive_date_start',
                'commutation_requested' => 'nullable|boolean',
                // Detail fields
                'vacation_location_ph' => 'nullable|string',
                'vacation_location_abroad' => 'nullable|string',
                'sick_in_hospital' => 'nullable|string',
                'sick_out_patient' => 'nullable|string',
                'special_women_illness' => 'nullable|string',
                'study_masters' => 'nullable|boolean',
                'study_bar' => 'nullable|boolean',
                'study_other' => 'nullable|string',
                'monetization' => 'nullable|boolean',
                'terminal_leave' => 'nullable|boolean',
            ]);

            // Collect all detail fields into a JSON object
            $leaveDetails = [
                'vacation_location_ph' => $request->vacation_location_ph,
                'vacation_location_abroad' => $request->vacation_location_abroad,
                'sick_in_hospital' => $request->sick_in_hospital,
                'sick_out_patient' => $request->sick_out_patient,
                'special_women_illness' => $request->special_women_illness,
                'study_masters' => $request->study_masters ?? false,
                'study_bar' => $request->study_bar ?? false,
                'study_other' => $request->study_other,
                'monetization' => $request->monetization ?? false,
                'terminal_leave' => $request->terminal_leave ?? false,
            ];

            $leaveApplication = LeaveApplication::create([
                'user_id' => auth()->id(),
                'office_department' => $validated['office_department'],
                'last_name' => $validated['last_name'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'date_of_filing' => $validated['date_of_filing'],
                'position' => $validated['position'],
                'salary' => $validated['salary'],
                'leave_type' => $validated['leave_type'],
                'leave_type_others' => $validated['leave_type_others'],
                'leave_details' => $leaveDetails,
                'working_days' => $validated['working_days'],
                'inclusive_date_start' => $validated['inclusive_date_start'],
                'inclusive_date_end' => $validated['inclusive_date_end'],
                'commutation_requested' => $validated['commutation_requested'] ?? false,
                'status' => 'pending',
            ]);

            \Log::info('Leave application created successfully', ['id' => $leaveApplication->id]);

            return redirect()->back()->with('success', 'Leave application submitted successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Leave application validation failed', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Leave application submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to submit leave application. Please try again.');
        }
    }
}
