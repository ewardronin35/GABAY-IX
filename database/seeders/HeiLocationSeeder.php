<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HeiLocationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔄 Updating HEI Locations (Province, City, District)...');

        $heis = DB::table('heis')->get();
        $updatedCount = 0;

        foreach ($heis as $hei) {
            $name = $hei->hei_name;
            
            // 1. DETERMINE CITY based on Name Keywords
            $cityName = $this->guessCity($name);
            
            if ($cityName) {
                // 2. FIND LOCATION IDs
                $city = DB::table('cities')->where('name', $cityName)->first();
                
                if ($city) {
                    $provinceId = $city->province_id;
                    $cityId = $city->id;
                    
                    // 3. DETERMINE DISTRICT
                    $districtId = $this->getDistrict($provinceId, $cityName, $name);

                    // 4. UPDATE HEI
                    DB::table('heis')->where('id', $hei->id)->update([
                        'province_id' => $provinceId,
                        'city_id'     => $cityId,
                        'district_id' => $districtId,
                        'updated_at'  => now()
                    ]);
                    $updatedCount++;
                }
            } else {
                // Optional: Log warnings for schools that didn't match any keyword
                // $this->command->warn("⚠️ Could not guess location for: $name");
            }
        }

        $this->command->info("✅ Successfully updated locations for $updatedCount HEIs.");
    }

    /**
     * Logic to guess the City based on the HEI Name
     */
    private function guessCity($name)
    {
        $n = Str::lower($name);

        // --- ZAMBOANGA CITY ---
        if (Str::contains($n, ['zamboanga city', 'western mindanao state', 'ateneo de zamboanga', 'pilar college', 'zamboanga state college', 'southern city', 'universidad de zamboanga', 'brent hospital', 'zamboanga peninsula polytechnic'])) return 'Zamboanga City';
        
        // --- PAGADIAN ---
        if (Str::contains($n, ['pagadian', 'southern mindanao colleges', 'columban', 'mendero', 'medina', 'eastern mindanao'])) return 'Pagadian City';
        
        // --- DIPOLOG ---
        if (Str::contains($n, ['dipolog', 'andres bonifacio', 'saint vincent', 'dipolog medical'])) return 'Dipolog City';
        
        // --- DAPITAN ---
        if (Str::contains($n, ['dapitan', 'rizal memorial state', 'jrmsu'])) return 'Dapitan City'; // Default JRMSU to Dapitan if main campus

        // --- IPIL ---
        if (Str::contains($n, ['ipil', 'sibugay', 'marian college', 'dr. aurelio'])) return 'Ipil';

        // --- BASILAN / ISABELA ---
        if (Str::contains($n, ['basilan state', 'claret', 'isabela city', 'juan s. alano', 'furigay'])) return 'Isabela City';
        if (Str::contains($n, ['lamitan'])) return 'Lamitan City';

        // --- SULU ---
        if (Str::contains($n, ['sulu state', 'notre dame of jolo', 'hadji butu', 'sulu college'])) return 'Jolo';

        // --- TAWI-TAWI ---
        if (Str::contains($n, ['tawi-tawi', 'mindanao state university-tawi-tawi', 'mahardika', 'abubakar'])) return 'Bongao';

        // --- COTABATO ---
        if (Str::contains($n, ['cotabato city', 'cotabato state', 'notre dame university', 'kutawato', 'headstart', 'doctor p. ocampo'])) return 'Cotabato City';

        // --- MARAWI ---
        if (Str::contains($n, ['marawi', 'mindanao state university-main', 'lanao del sur', 'pacasum', 'ibn sienor', 'jamiatu marawi'])) return 'Marawi City';

        // --- SPECIFIC MUNICIPALITIES (JHCSC & Others) ---
        // JHCSC Campuses
        if (Str::contains($n, ['jhcsc', 'josefina h. cerilles'])) {
            if (Str::contains($n, ['dumingag'])) return 'Dumingag';
            if (Str::contains($n, ['molave'])) return 'Molave'; // Main?
            if (Str::contains($n, ['aurora'])) return 'Aurora';
            if (Str::contains($n, ['tambulig'])) return 'Tambulig';
            if (Str::contains($n, ['mahayag'])) return 'Mahayag';
            // Default/Main Campus is usually San Miguel or Mati, but let's default to San Miguel if generic
            if (Str::contains($n, ['san miguel'])) return 'San Miguel';
        }

        // JRMSU Campuses
        if (Str::contains($n, ['tampilisan'])) return 'Tampilisan';
        if (Str::contains($n, ['katipunan'])) return 'Katipunan';
        if (Str::contains($n, ['siocon'])) return 'Siocon';
        if (Str::contains($n, ['sindangan'])) return 'Sindangan';
        
        // Others
        if (Str::contains($n, ['buug'])) return 'Buug';
        if (Str::contains($n, ['margosatubig', 'pajo'])) return 'Margosatubig';
        if (Str::contains($n, ['kabasalan'])) return 'Kabasalan';
        if (Str::contains($n, ['malangas'])) return 'Malangas';
        if (Str::contains($n, ['liloy'])) return 'Liloy';
        
        return null; // Could not guess
    }

    /**
     * Logic to assign the correct Legislative District
     */
    private function getDistrict($provinceId, $cityName, $heiName)
    {
        // 1. Check for "Lone District" (Basilan, Tawi-Tawi, etc.)
        $lone = DB::table('districts')
            ->where('province_id', $provinceId)
            ->where('name', 'like', '%Lone%')
            ->value('id');
        if ($lone) return $lone;

        // 2. Zamboanga City (Split into 1st and 2nd)
        if ($cityName === 'Zamboanga City') {
            // District 2 (East Coast): ZSCMST, Mercedes, Sangali area
            if (Str::contains(Str::lower($heiName), ['marine', 'technology', 'zscmst', 'mercedes', 'manicahan'])) {
                return DB::table('districts')->where('name', 'like', '%2nd District (Zamboanga City)%')->value('id');
            }
            // District 1 (West Coast/City Proper): WMSU, AdZU, Pilar, Southern City, ZPPSU
            return DB::table('districts')->where('name', 'like', '%1st District (Zamboanga City)%')->value('id');
        }

        // 3. Zamboanga del Sur (Pagadian is District 1)
        if ($cityName === 'Pagadian City') {
            return DB::table('districts')->where('province_id', $provinceId)->where('name', 'like', '%1st%')->value('id');
        }

        // 4. Zamboanga del Norte (Dapitan is 1, Dipolog is 2)
        if ($cityName === 'Dapitan City') {
             return DB::table('districts')->where('province_id', $provinceId)->where('name', 'like', '%1st%')->value('id');
        }
        if ($cityName === 'Dipolog City') {
             return DB::table('districts')->where('province_id', $provinceId)->where('name', 'like', '%2nd%')->value('id');
        }

        // Default: Just grab the first district found for the province
        return DB::table('districts')->where('province_id', $provinceId)->value('id');
    }
}