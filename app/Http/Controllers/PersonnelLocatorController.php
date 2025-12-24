<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\UserPersonalLocatorTime;
use App\Mail\PersonalTravelOvertimeWarning;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelLocatorController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $currentMonth = now()->format('Y-m');

        // Get current month's consumed time for this user
        $timeRecord = UserPersonalLocatorTime::where('user_id', $user->id)
            ->where('month', $currentMonth)
            ->first();

        $consumedSeconds = $timeRecord ? $timeRecord->time_consumed_seconds : 0;
        $remainingSeconds = 14400 - $consumedSeconds; // 4 hours = 14400 seconds

        return Inertia::render('PersonnelLocator/Form', [
            'consumedSeconds' => $consumedSeconds,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'name_of_personnel' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'purpose' => 'required|string',
            'destination' => 'required|string|max:255',
            'nature_of_travel' => 'required|in:Official,Personal',
            'time_departure' => 'required',
            'time_arrival' => 'required',
            'representative_signature' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();

        // Save the locator slip
        DB::table('personnel_locator_slips')->insert([
            'date' => $validated['date'],
            'name_of_personnel' => $validated['name_of_personnel'],
            'designation' => $validated['designation'],
            'purpose' => $validated['purpose'],
            'destination' => $validated['destination'],
            'nature_of_travel' => $validated['nature_of_travel'],
            'time_departure' => $validated['time_departure'],
            'time_arrival' => $validated['time_arrival'],
            'representative_signature' => $validated['representative_signature'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Only track time if this is a Personal trip
        if ($validated['nature_of_travel'] === 'Personal') {
            $timeRecord = $this->trackPersonalTime($validated['time_departure'], $validated['time_arrival']);

            // Check if user is now in overtime and send email
            if ($timeRecord->isOvertime()) {
                Mail::to($user->email)->queue(new PersonalTravelOvertimeWarning($timeRecord, $user));

                // Format overtime message
                $overtimeSeconds = $timeRecord->getOvertimeSeconds();
                $hours = floor($overtimeSeconds / 3600);
                $minutes = floor(($overtimeSeconds % 3600) / 60);
                $overtimeMessage = "You are now {$hours}h {$minutes}m over your monthly personal travel limit.";

                return redirect()->route('personnel-locator.index')
                    ->with('success', 'Personnel Locator Slip submitted successfully!')
                    ->with('warning', $overtimeMessage);
            }
        }

        return redirect()->route('personnel-locator.index')
            ->with('success', 'Personnel Locator Slip submitted successfully!');
    }

    /**
     * Calculate and track personal travel time
     */
    private function trackPersonalTime(string $departure, string $arrival): UserPersonalLocatorTime
    {
        $user = Auth::user();
        $currentMonth = now()->format('Y-m');

        // Parse times
        $departureTime = Carbon::createFromFormat('H:i', $departure);
        $arrivalTime = Carbon::createFromFormat('H:i', $arrival);

        // Handle cross-midnight trips
        if ($arrivalTime->lessThanOrEqualTo($departureTime)) {
            $arrivalTime->addDay();
        }

        // Calculate duration in seconds (absolute value to ensure positive)
        $durationSeconds = abs($departureTime->diffInSeconds($arrivalTime, false));

        // Get or create time record for this month
        $timeRecord = UserPersonalLocatorTime::getOrCreateForMonth($user->id, $currentMonth);

        // Add the time consumed
        $timeRecord->addTime($durationSeconds);

        // Refresh to get updated values
        $timeRecord->refresh();

        return $timeRecord;
    }
}
