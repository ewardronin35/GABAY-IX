<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Requirement;
use App\Models\Program;
use Illuminate\Support\Facades\DB;

class RobustRequirementSeeder extends Seeder
{
    public function run()
    {
        // 1. Create the Documents (if they don't exist)
        $coe = Requirement::firstOrCreate(['code' => 'COE'], ['name' => 'Certificate of Enrollment']);
        $id  = Requirement::firstOrCreate(['code' => 'ID'],  ['name' => 'School ID']);
        $rog = Requirement::firstOrCreate(['code' => 'ROG'], ['name' => 'Report of Grades']);
        $cor = Requirement::firstOrCreate(['code' => 'COR'], ['name' => 'Certificate of Registration']);

        $this->command->info('Requirements ensured: COE, ID, ROG, COR.');

        // 2. Link to TDP (Try multiple variations of the name)
        $tdpPrograms = Program::where('program_name', 'LIKE', '%TDP%')
                            ->orWhere('program_name', 'LIKE', '%Tulong%')
                            ->orWhere('program_name', 'LIKE', '%Dunong%')
                            ->get();

        if ($tdpPrograms->isEmpty()) {
            $this->command->warn('No TDP Program found. Creating one...');
            $tdpPrograms = collect([Program::create(['program_name' => 'TDP - Tulong Dunong Program'])]);
        }

        foreach ($tdpPrograms as $tdp) {
            // Attach COE, ID, ROG to TDP
            $tdp->requirements()->syncWithoutDetaching([$coe->id, $id->id, $rog->id]);
            $this->command->info("Linked requirements to TDP Program: {$tdp->program_name}");
        }

        // 3. Link to TES (Try multiple variations)
        $tesPrograms = Program::where('program_name', 'LIKE', '%TES%')
                            ->orWhere('program_name', 'LIKE', '%Tertiary%')
                            ->orWhere('program_name', 'LIKE', '%Subsidy%')
                            ->get();

        if ($tesPrograms->isEmpty()) {
            $this->command->warn('No TES Program found. Creating one...');
            $tesPrograms = collect([Program::create(['program_name' => 'TES - Tertiary Education Subsidy'])]);
        }

        foreach ($tesPrograms as $tes) {
            // Attach COE and COR to TES
            $tes->requirements()->syncWithoutDetaching([$coe->id, $cor->id]);
            $this->command->info("Linked requirements to TES Program: {$tes->program_name}");
        }
    }
}