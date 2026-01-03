<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DistrictsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CLEAR OLD DATA
        Schema::disableForeignKeyConstraints();
        DB::table('districts')->truncate();
        Schema::enableForeignKeyConstraints();

        $this->command->info('🧹 Districts wiped. Seeding Official 19th Congress Districts & Representatives...');

        // 2. REAL DATA (Province/City => [District Name, Representative])
        $data = [
            // --- REGION IX (ZAMBOANGA PENINSULA) ---
            
            'Zamboanga del Norte' => [
                ['1st District', 'Rep. Roberto "Pinpin" T. Uy Jr.'],
                ['2nd District', 'Rep. Glona G. Labadlabad'],
                ['3rd District', 'Rep. Adrian Michael A. Amatong'], // Specific match to your SQL
            ],
            'Zamboanga del Sur' => [
                ['1st District', 'Rep. Divina Grace C. Yu'],
                ['2nd District', 'Rep. Jeyzel Victoria C. Yu'],
            ],
            'Zamboanga Sibugay' => [
                ['1st District', 'Rep. Wilter Y. Palma'],
                ['2nd District', 'Rep. Antonieta R. Eudela'],
            ],
            // Zamboanga City is independent but often grouped under Zamboanga del Sur in older DBs. 
            // Since we treated it as a City inside Zamboanga del Sur in the previous seeder, 
            // we link these districts to the Province "Zamboanga del Sur" but label them explicitly.
            'Zamboanga City' => [ 
                ['1st District (Zamboanga City)', 'Rep. Khymer Adan T. Olaso'],
                ['2nd District (Zamboanga City)', 'Rep. Manuel Jose "Mannix" M. Dalipe'],
            ],
            
            'Isabela City' => [
                // Isabela City votes for the Basilan Lone District Rep, but if you treat it as a separate unit:
                ['Lone District (Isabela)', 'Rep. Mujiv S. Hataman'] 
            ],

            // --- BARMM (BANGSAMORO) ---

            'Basilan' => [
                ['Lone District', 'Rep. Mujiv S. Hataman']
            ],
            'Sulu' => [
                ['1st District', 'Rep. Samier A. Tan'], // Specific match to your SQL
                ['2nd District', 'Rep. Abdulmunir M. Arbison Jr.'],
            ],
            'Tawi-Tawi' => [
                ['Lone District', 'Rep. Dimszar M. Sali']
            ],
            'Maguindanao del Norte' => [
                ['Lone District', 'Rep. Bai Dimple I. Mastura'] // Historically Maguindanao 1st
            ],
            'Maguindanao del Sur' => [
                ['Lone District', 'Rep. Mohamad Tong A. Paglas'] // Historically Maguindanao 2nd
            ],
            'Lanao del Sur' => [
                ['1st District', 'Rep. Zia Alonto Adiong'],
                ['2nd District', 'Rep. Yasser Alonto Balindong'],
            ],
            
            // Special case for Cotabato City (Independent Component City)
            // They vote for Maguindanao del Norte Rep mostly, or treated separately in some systems.
            'Cotabato City' => [
                 ['Lone District (Cotabato City)', 'Rep. Bai Dimple I. Mastura']
            ]
        ];

        // 3. EXECUTE INSERTION
        foreach ($data as $locationName => $districts) {
            
            // Try to find as Province first
            $parentId = DB::table('provinces')->where('name', $locationName)->value('id');

            // If not a province, it might be a special City we want to create districts for
            // BUT: The 'districts' table usually links to 'province_id'. 
            // Only if your schema allows linking Cities to districts directly should we switch logic.
            // Assuming your schema is `province_id`, we must map Cities (like ZC) to their parent Province ID.
            
            if (!$parentId) {
                // SPECIAL LOGIC: 
                // If "Zamboanga City", find "Zamboanga del Sur" ID
                if ($locationName === 'Zamboanga City') {
                    $parentId = DB::table('provinces')->where('name', 'Zamboanga del Sur')->value('id');
                }
                // If "Cotabato City", find "Maguindanao del Norte" ID
                elseif ($locationName === 'Cotabato City') {
                    $parentId = DB::table('provinces')->where('name', 'Maguindanao del Norte')->value('id');
                }
            }

            if ($parentId) {
                $payload = [];
                foreach ($districts as $d) {
                    $payload[] = [
                        'province_id'    => $parentId,
                        'name'           => $d[0],
                        'representative' => $d[1],
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ];
                }
                DB::table('districts')->insert($payload);
                $this->command->info("✅ Seeded districts for $locationName");
            } else {
                $this->command->warn("⚠️ Could not find parent province for: $locationName");
            }
        }
    }
}