<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class MasterlistProgramSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CONFIGURATION
        $csvFile = database_path('data/masterlist.csv'); 

        if (!file_exists($csvFile)) {
            $this->command->error("❌ File not found: $csvFile");
            return;
        }

        // 2. WIPE TABLES
        Schema::disableForeignKeyConstraints();
        DB::table('course_major')->truncate();
        DB::table('majors')->truncate();
        DB::table('courses')->truncate();
        DB::table('course_classifications')->truncate();
        Schema::enableForeignKeyConstraints();

        $this->command->info('🧹 Tables wiped. Reading CHED Masterlist...');

        // 3. READ CSV
        $file = fopen($csvFile, 'r');
        $header = fgetcsv($file); // Skip Header

        $classificationsCache = [];
        $coursesCache = [];
        $majorsCache = [];
        
        $count = 0;

        while (($row = fgetcsv($file)) !== false) {
            $disc   = strtoupper(trim($row[4] ?? ''));
            $degree = trim($row[6] ?? '');
            $prog   = trim($row[7] ?? '');
            $major  = trim($row[9] ?? '');

            if (empty($disc) || empty($prog)) continue;

            $fullCourseName = trim(str_replace('  ', ' ', $degree . ' ' . $prog));

            // -------------------------------------------------------
            // A. CLASSIFICATION
            // -------------------------------------------------------
            if (!isset($classificationsCache[$disc])) {
                $existing = DB::table('course_classifications')->where('type', $disc)->value('id');
                if (!$existing) {
                    $existing = DB::table('course_classifications')->insertGetId([
                        'type' => $disc, 
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                }
                $classificationsCache[$disc] = $existing;
            }
            $classId = $classificationsCache[$disc];

            // -------------------------------------------------------
            // B. COURSE (Fixing the Duplicate Entry Error)
            // -------------------------------------------------------
            // We use the NAME ONLY for the key, not the classId, to enforce global uniqueness
            $courseKey = $fullCourseName;

            if (!isset($coursesCache[$courseKey])) {
                // FIX 1: Check globally for the name, ignoring classification
                $existingCourse = DB::table('courses')
                    ->where('course_name', $fullCourseName) 
                    ->value('id');

                if (!$existingCourse) {
                    $abbr = $this->generateAbbreviation($fullCourseName);
                    
                    // FIX 2: Try-Catch block to safely handle any race conditions
                    try {
                        $existingCourse = DB::table('courses')->insertGetId([
                            'classification_id' => $classId,
                            'course_name' => $fullCourseName,
                            'abbreviation' => $abbr,
                            'created_at' => now(), 'updated_at' => now()
                        ]);
                    } catch (\Exception $e) {
                        // If it fails (duplicate), just find the existing ID again
                         $existingCourse = DB::table('courses')
                            ->where('course_name', $fullCourseName)
                            ->value('id');
                    }
                }
                $coursesCache[$courseKey] = $existingCourse;
            }
            $courseId = $coursesCache[$courseKey];

            // -------------------------------------------------------
            // C. MAJOR
            // -------------------------------------------------------
            if (!empty($major) && strtolower($major) !== 'none' && strtolower($major) !== 'n/a') {
                if (!isset($majorsCache[$major])) {
                    $existingMajor = DB::table('majors')->where('major_name', $major)->value('id');
                    if (!$existingMajor) {
                        $existingMajor = DB::table('majors')->insertGetId([
                            'major_name' => $major,
                            'created_at' => now(), 'updated_at' => now()
                        ]);
                    }
                    $majorsCache[$major] = $existingMajor;
                }
                $majorId = $majorsCache[$major];

                // Link Course -> Major
                $exists = DB::table('course_major')
                    ->where('course_id', $courseId)
                    ->where('major_id', $majorId)
                    ->exists();

                if (!$exists) {
                    DB::table('course_major')->insert([
                        'course_id' => $courseId,
                        'major_id'  => $majorId,
                    ]);
                }
            }
            $count++;
        }

        fclose($file);
        $this->command->info("✅ Successfully processed $count rows.");
    }

       private function generateAbbreviation($name)
    {
        if (str_contains($name, 'Information Technology')) return 'BSIT';
        if (str_contains($name, 'Computer Science')) return 'BSCS';
        if (str_contains($name, 'Elementary Education')) return 'BEED';
        if (str_contains($name, 'Secondary Education')) return 'BSED';
        if (str_contains($name, 'Business Administration')) return 'BSBA';
        if (str_contains($name, 'Criminology')) return 'BSCRIM';
        if (str_contains($name, 'Civil Engineering')) return 'BSCE';
        if (str_contains($name, 'Nursing')) return 'BSN';
        if (str_contains($name, 'Accountancy')) return 'BSA';
            if (str_contains($name, 'Psychology')) return 'BSPSY';
            if (str_contains($name, 'Sociology')) return 'BSSOC';
            if (str_contains($name, 'Political Science')) return 'BSPSC';
            if (str_contains($name, 'Law')) return 'BSLAW';
            if (str_contains($name, 'Economics')) return 'BSECO';
                if (str_contains($name, 'Business Management')) return 'BSBM';
                if (str_contains($name, 'Marketing')) return 'BSMKT';
                if (str_contains($name, 'Finance')) return 'BSFIN';
                    if (str_contains($name, 'Accounting')) return 'BSACC';
                    if (str_contains($name, 'Human Resources')) return 'BSHR';
                    
        
        $words = explode(' ', $name);
        $abbr = '';
        foreach ($words as $word) {
            if (ctype_upper($word[0])) $abbr .= $word[0];
        }
        return substr($abbr, 0, 8);
    }
}