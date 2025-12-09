<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubAllotment;
use App\Models\Program;

class SubAllotmentSeeder extends Seeder
{
    public function run()
    {
        $tdp = Program::where('program_name', 'like', '%TDP%')->first();
        $tes = Program::where('program_name', 'like', '%TES%')->first();

        SubAllotment::firstOrCreate(
            ['saa_number' => 'SAA-2025-01'],
            [
                'program_id' => $tdp ? $tdp->id : null,
                'date_received' => now(),
                'total_amount' => 1000000.00,
                'description' => 'Regular TDP Funds',
                'status' => 'Active'
            ]
        );

        SubAllotment::firstOrCreate(
            ['saa_number' => 'SAA-2025-02'],
            [
                'program_id' => $tes ? $tes->id : null,
                'date_received' => now(),
                'total_amount' => 500000.00,
                'description' => 'Monitoring Funds',
                'status' => 'Active'
            ]
        );
    }
}