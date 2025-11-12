<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // <-- Make sure Str is imported

// Import all the models we need
use App\Models\HEI;
use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Models\AcademicRecord;
use App\Models\ScholarEnrollment;
use App\Models\Education;
use App\Models\TesAcademicRecord;
use App\Models\TdpAcademicRecord;
use App\Models\StufapAcademicRecord;

class HeiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. DISABLE FOREIGN KEY CHECKS
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 2. WIPE all tables that DEPEND ON HEIs (child tables)
        AcademicRecord::truncate();
        ScholarEnrollment::truncate();
        
        // Truncate old legacy tables
        Education::truncate();
        TesAcademicRecord::truncate();
        TdpAcademicRecord::truncate();
        StufapAcademicRecord::truncate();

        // 3. WIPE the parent tables (HEIs and new location tables)
        HEI::truncate();
        District::truncate();
        City::truncate();
        Province::truncate();

        // 4. RE-ENABLE FOREIGN KEY CHECKS
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // --- 5. POPULATE from the CSV ---
        $csvPath = database_path('seeders/heis.csv');
        $file = fopen($csvPath, 'r');
        
        if ($file === false) {
            $this->command->error("Could not open the CSV file: {$csvPath}");
            return;
        }

        $header = fgetcsv($file); // Read the header row
        $now = now();

        // Caches to hold IDs and prevent duplicate queries
        $provinceCache = [];
        $cityCache = [];
        $districtCache = [];
        $heisToInsert = [];

        // Map CSV columns based on your 'heis.csv' header
        $nameIndex = array_search('School', $header);
        $codeIndex = array_search('hei_Code', $header);
        $typeIndex = array_search('Type of heis', $header);
        $cityIndex = array_search('City/Municipality', $header);
        $provinceIndex = array_search('Province', $header);
        $districtIndex = array_search('District', $header);
        $repIndex = array_search('Representative', $header);

        while (($row = fgetcsv($file)) !== false) {
            
            // Get and trim all data
            $provinceName = trim($row[$provinceIndex] ?? 'N/A');
            $cityName = trim($row[$cityIndex] ?? 'N/A');
            $districtName = trim($row[$districtIndex] ?? 'N/A');
            $repName = trim($row[$repIndex] ?? null);
            $typeLetter = trim(Str::upper($row[$typeIndex] ?? null));

            // --- 6. GET OR CREATE LOCATIONS (Handles Duplication) ---

            // Province: Find or create if it doesn't exist
            if (!isset($provinceCache[$provinceName])) {
                $province = Province::firstOrCreate(['name' => $provinceName]);
                $provinceCache[$provinceName] = $province->id;
            }
            $provinceId = $provinceCache[$provinceName];

            // City: Find or create (scoped to the province)
            $cityKey = $provinceId . '_' . $cityName;
            if (!isset($cityCache[$cityKey])) {
                $city = City::firstOrCreate(
                    ['name' => $cityName, 'province_id' => $provinceId]
                );
                $cityCache[$cityKey] = $city->id;
            }
            $cityId = $cityCache[$cityKey];

            // District: Find or create (scoped to province), AND update the representative
            $districtKey = $provinceId . '_' . $districtName;
            if (!isset($districtCache[$districtKey])) {
                $district = District::updateOrCreate(
                    ['name' => $districtName, 'province_id' => $provinceId],
                    ['representative' => $repName] // Add/update the representative
                );
                $districtCache[$districtKey] = $district->id;
            }
            $districtId = $districtCache[$districtKey];

            // --- 7. Map P/L/S to Full Names ---
            $typeFullName = match ($typeLetter) {
                'P' => 'Private',
                'L' => 'LUC',
                'S' => 'SUC',
                default => null,
            };

            // --- 8. PREPARE THE HEI RECORD ---
            $heisToInsert[] = [
                'hei_name'    => $row[$nameIndex],
                'province_id' => $provinceId,
                'city_id'     => $cityId,
                'district_id' => $districtId,
                'hei_code'    => $row[$codeIndex],
                'type_of_heis' => $typeFullName, // Use the mapped full name
                'created_at'  => $now,
                'updated_at'  => $now,
            ];
        }

        fclose($file);

        // 9. Insert all HEIs in chunks for better performance
        foreach (array_chunk($heisToInsert, 50) as $chunk) {
            DB::table('heis')->insert($chunk);
        }

        $this->command->info('Provinces, Cities, Districts, and HEIs have been successfully reset and seeded.');
    }
}