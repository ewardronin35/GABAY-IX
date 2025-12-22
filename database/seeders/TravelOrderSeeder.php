<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TravelOrder;
use App\Models\SubAllotment;
use Carbon\Carbon;

class TravelOrderSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        $fund = SubAllotment::first() ?? SubAllotment::create([
            'saa_number' => 'SUB-AA-TEST', 
            'total_amount' => 1000000, 
            'balance' => 1000000, 
            'date_received' => now(),
            'status' => 'Active'
        ]);

        // TEST CASE 1: NEEDS CHIEF (ID 101)
        TravelOrder::updateOrCreate(['id' => 101], [
            'user_id' => $user->id,
            'sub_allotment_id' => $fund->id,
            'destination' => 'TEST: Pending for Chief',
            'date_from' => now()->addDays(5),
            'date_to' => now()->addDays(6),
            'purpose' => 'Testing Chief Approval Flow',
            'status' => 'Pending', // <--- Chief must see "Endorse"
            'total_estimated_cost' => 5000,
           
        ]);

        // TEST CASE 2: NEEDS RD (ID 102)
        TravelOrder::updateOrCreate(['id' => 102], [
            'user_id' => $user->id,
            'sub_allotment_id' => $fund->id,
            'destination' => 'TEST: Approved by Chief',
            'date_from' => now()->addDays(10),
            'date_to' => now()->addDays(12),
            'purpose' => 'Testing RD Final Approval Flow',
            'status' => 'Chief Approved', // <--- RD must see "Final Approve"
            'total_estimated_cost' => 12000,
        
        ]);

        $this->command->info('Test Data Created!');
        $this->command->info('For Chief Test: /travel-orders/101?role=chief');
        $this->command->info('For RD Test:    /travel-orders/102?role=rd');
    }
}