<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Region;
use App\Models\Province;

class RegionProvinceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or Find Regions
        // We force specific IDs or names based on your requirement
        $region9 = Region::updateOrCreate(
            ['name' => 'Region IX'], 
            ['long_name' => 'Zamboanga Peninsula']
        );

        $region15a = Region::updateOrCreate(
            ['name' => 'BARMM'], 
            ['long_name' => 'Bangsamoro Autonomous Region in Muslim Mindanao']
        );

        // 2. Map Provinces to Region 9 (Zamboanga Peninsula)
        $region9Provinces = [
            'ZAMBOANGA DEL NORTE',
            'ZAMBOANGA DEL SUR',
            'ZAMBOANGA SIBUGAY',
            'ZAMBOANGA CITY', // Often treated as independent, but geographically Reg 9
            'ISABELA CITY'    // Politically Reg 9, geographically Basilan
        ];

        foreach ($region9Provinces as $provName) {
            Province::updateOrCreate(
                ['name' => $provName],
                ['region_id' => $region9->id]
            );
        }

        // 3. Map Provinces to Region 15a (BARMM)
        $region15aProvinces = [
            'BASILAN',
            'SULU',
            'TAWI-TAWI',
            'LANAO DEL SUR',
            'MAGUINDANAO'
        ];

        foreach ($region15aProvinces as $provName) {
            Province::updateOrCreate(
                ['name' => $provName],
                ['region_id' => $region15a->id]
            );
        }
    }
}