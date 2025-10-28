<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('programs')->insert([
            [
                'program_name' => 'COSHCO',
                'description' => 'College of Science, Health, and Community Outreach program.',
            ],
            [
                'program_name' => 'MSRS',
                'description' => 'Medical Services and Research Scholarship program.',
            ],
            [
                'program_name' => 'TES',
                'description' => 'Tertiary Education Subsidy program under government assistance.',
            ],
            [
                'program_name' => 'TDP',
                'description' => 'Tulong Dunong Program for financial assistance to students.',
            ],
            [
                'program_name' => 'UniFast',
                'description' => 'Unified Student Financial Assistance System for Tertiary Education.',
            ],
            [
                'program_name' => 'CSMP',
                'description' => 'College Scholarship and Mentorship Program.',
            ],
        ]);
    }
}
