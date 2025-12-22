<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // ✨ Added User model
use App\Models\TravelOrder;
use App\Models\SubAllotment;
use App\Models\FinancialRequest; 
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first(); 

        // 1. COMMON DATA
        $myTravels = TravelOrder::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'ref_no' => 'TO-REQ-' . str_pad($t->id, 4, '0', STR_PAD_LEFT),
                'destination' => $t->destination,
                'status' => $t->status,
                'date' => $t->created_at->format('M d, Y')
            ]);

        // 2. INITIALIZE VARIABLES
        $stats = [];
        $charts = [];
        $activeUsers = [];
        $trafficData = [];

        // 3. ROLE-SPECIFIC DATA
        switch ($role) {
            case 'Super Admin':
                // ✨ A. REAL-TIME USER COUNTS
                $totalUsers = User::count();
                // Assuming 'updated_at' updates on user activity. 
                // Alternatively, use DB::table('sessions') if using database driver.
                $onlineCount = User::where('updated_at', '>=', Carbon::now()->subMinutes(15))->count();
                
                $stats = [
                    ['label' => 'Total Users', 'value' => $totalUsers, 'icon' => 'users', 'color' => '#6366f1'],
                    ['label' => 'Online Now', 'value' => $onlineCount, 'icon' => 'wifi', 'color' => '#10b981', 'trend' => 'Live'],
                    ['label' => 'System Load', 'value' => 'Normal', 'icon' => 'activity', 'color' => '#f59e0b'],
                    ['label' => 'Total Requests', 'value' => TravelOrder::count(), 'icon' => 'file', 'color' => '#ec4899'],
                ];

                // ✨ B. WHO IS LOGGED IN (Active Users List)
                $activeUsers = User::where('updated_at', '>=', Carbon::now()->subMinutes(30))
                    ->latest('updated_at')
                    ->take(8)
                    ->get()
                    ->map(fn($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'last_seen' => $u->updated_at->diffForHumans(),
                        'avatar_url' => $u->profile_photo_url, // Assuming you have this accessor
                    ]);

                // ✨ C. TRAFFIC DATA (Mocking based on recent TravelOrders for demo)
                // In production, aggregate this from an activity_logs table
                $trafficData = TravelOrder::selectRaw('DATE(created_at) as name, count(*) as requests')
                    ->where('created_at', '>=', Carbon::now()->subDays(7))
                    ->groupBy('name')
                    ->get()
                    ->map(function($item) {
                        return [
                            'name' => Carbon::parse($item->name)->format('D'),
                            'requests' => $item->requests,
                            'visits' => $item->requests * rand(2, 5), // Mock visits derived from requests
                            'errors' => rand(0, 3)
                        ];
                    });
                
                if($trafficData->isEmpty()) {
                    // Fallback if DB is empty
                    $trafficData = [
                        ['name' => 'Mon', 'visits' => 120, 'requests' => 45, 'errors' => 2],
                        ['name' => 'Tue', 'visits' => 150, 'requests' => 55, 'errors' => 1],
                        ['name' => 'Wed', 'visits' => 180, 'requests' => 70, 'errors' => 5],
                    ];
                }
                break;

            case 'Scholarship Officer':
                $stats = [
                    ['label' => 'Total Merit Scholars', 'value' => 120, 'icon' => 'users'],
                    ['label' => 'Pending Applications', 'value' => 45, 'icon' => 'file'],
                ];
                $charts = [
                    ['name' => 'Merit', 'value' => 120, 'fill' => '#4f46e5'],
                    ['name' => 'Stufap', 'value' => 80, 'fill' => '#0ea5e9'],
                    ['name' => 'Other', 'value' => 30, 'fill' => '#6366f1'],
                ];
                break;

            case 'UniFastRC':
                $stats = [
                    ['label' => 'Total TES Grantees', 'value' => 4500, 'icon' => 'users'],
                    ['label' => 'Total TDP Grantees', 'value' => 1200, 'icon' => 'users'],
                ];
                $charts = [
                    ['name' => 'TES', 'value' => 4500, 'fill' => '#dc2626'],
                    ['name' => 'TDP', 'value' => 1200, 'fill' => '#ea580c'],
                ];
                break;

            case 'Chief of Administrative Officer':
                $totalSaa = SubAllotment::sum('total_amount');
                $stats = [
                    ['label' => 'Total SAA Funds', 'value' => '₱' . number_format($totalSaa), 'icon' => 'wallet'],
                    ['label' => 'Pending Admin Requests', 'value' => 5, 'icon' => 'alert'],
                ];
                break;

            case 'Chief Education Program Specialist':
                $pendingTravel = TravelOrder::where('status', 'Pending')->count();
                $stats = [
                    ['label' => 'Pending Travel Approvals', 'value' => $pendingTravel, 'icon' => 'plane'],
                    ['label' => 'Technical Staff', 'value' => 12, 'icon' => 'users'],
                ];
                break;

            case 'Budget':
                $activeSaa = SubAllotment::where('status', 'Active')->count();
                $stats = [
                    ['label' => 'Active SAAs', 'value' => $activeSaa, 'icon' => 'file-check'],
                    ['label' => 'Pending Obligations', 'value' => 8, 'icon' => 'clock'],
                ];
                break;
                
            case 'Cashier':
                $stats = [
                    ['label' => 'Pending Checks', 'value' => 15, 'icon' => 'check-circle'],
                    ['label' => 'Disbursed Today', 'value' => '₱50,000', 'icon' => 'wallet'],
                ];
                break;

            case 'Regional Director':
            case 'RD':
                $pending_approvals = TravelOrder::where('status', 'Chief Approved')->count();
                $stats = [
                    ['label' => 'Approvals Needed', 'value' => $pending_approvals, 'icon' => 'signature'],
                    ['label' => 'Active Scholars', 'value' => 5800, 'icon' => 'users'],
                ];
                break;

            default:
                $stats = [
                    ['label' => 'My Active Requests', 'value' => $myTravels->where('status', 'Pending')->count(), 'icon' => 'file'],
                ];
                break;
        }

        return Inertia::render('Dashboard', [
            'role' => $role,
            'myTravels' => $myTravels,
            'stats' => $stats,
            'charts' => $charts,
            'activeUsers' => $activeUsers, // ✨ Passed to view
            'trafficData' => $trafficData, // ✨ Passed to view
        ]);
    }
}