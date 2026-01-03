<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CitiesAndProvincesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. WIPE PARENT TABLES
        Schema::disableForeignKeyConstraints();
        DB::table('cities')->truncate();
        DB::table('provinces')->truncate();
        DB::table('regions')->truncate();
        // We do NOT touch barangays yet.
        Schema::enableForeignKeyConstraints();

        $this->command->info('🧹 Parent locations wiped. Seeding Region IX and BARMM...');

        $data = [
            'Region IX (Zamboanga Peninsula)' => [
                'Zamboanga del Sur' => [
                    'Zamboanga City', // Chartered City
                    'Pagadian City',  // Component City
                    'Aurora', 'Bayog', 'Dimataling', 'Dinas', 'Dumalinao', 'Dumingag', 'Guipos', 'Josefina', 
                    'Kumalarang', 'Labangan', 'Lakewood', 'Lapuyan', 'Mahayag', 'Margosatubig', 'Midsalip', 
                    'Molave', 'Pitogo', 'Ramon Magsaysay', 'San Miguel', 'San Pablo', 'Sominot', 'Tabina', 
                    'Tambulig', 'Tigbao', 'Tukuran', 'Vincenzo A. Sagun'
                ],
                'Zamboanga del Norte' => [
                    'Dipolog City', 'Dapitan City', // Cities
                    'Bacungan (Leon B. Postigo)', 'Baliguian', 'Godod', 'Gutalac', 'Jose Dalman', 'Kalawit', 
                    'Katipunan', 'La Libertad', 'Labason', 'Liloy', 'Manukan', 'Mutia', 'Piñan', 'Polanco', 
                    'Pres. Manuel A. Roxas', 'Rizal', 'Salug', 'Sergio Osmeña Sr.', 'Siayan', 'Sibuco', 
                    'Sibutad', 'Sindangan', 'Siocon', 'Sirawai', 'Tampilisan'
                ],
                'Zamboanga Sibugay' => [
                    'Ipil', // Capital
                    'Alicia', 'Buug', 'Diplahan', 'Imelda', 'Kabasalan', 'Mabuhay', 'Malangas', 'Naga', 
                    'Olutanga', 'Payao', 'Roseller Lim', 'Siay', 'Talusan', 'Titay', 'Tungawan'
                ],
                'Isabela City' => [
                    'Isabela City' // Administratively Region IX
                ]
            ],
            'BARMM (Bangsamoro)' => [
                'Basilan' => [
                    'Lamitan City',
                    'Akbar', 'Al-Barka', 'Hadji Mohammad Ajul', 'Hadji Muhtamad', 'Lantawan', 
                    'Maluso', 'Sumisip', 'Tabuan-Lasa', 'Tipaka', 'Tuburan', 'Ungkaya Pukan'
                ],
                'Sulu' => [
                    'Jolo', // Capital
                    'Banguingui (Tongkil)', 'Hadji Panglima Tahil', 'Indanan', 'Kalingalan Caluang', 'Lugus', 
                    'Luuk', 'Maimbung', 'Old Panamao', 'Omar', 'Pandami', 'Panglima Estino', 'Pangutaran', 
                    'Parang', 'Pata', 'Patikul', 'Siasi', 'Talipao', 'Tapul'
                ],
                'Tawi-Tawi' => [
                    'Bongao', // Capital
                    'Languyan', 'Mapun (Cagayan de Tawi-Tawi)', 'Panglima Sugala', 'Sapa-Sapa', 
                    'Sibutu', 'Simunol', 'Sitangkai', 'South Ubian', 'Tandu Bas', 'Turtle Islands'
                ],
                'Maguindanao del Norte' => [
                    'Cotabato City', // Independent Component City
                    'Barira', 'Buldon', 'Datu Blah T. Sinsuat', 'Datu Odin Sinsuat', 'Kabuntalan', 'Matanog', 
                    'Northern Kabuntalan', 'Parang', 'Sultan Kudarat', 'Sultan Mastura', 'Talitay', 'Upi'
                ],
                'Maguindanao del Sur' => [
                    'Ampatuan', 'Buluan', 'Datu Abdullah Sangki', 'Datu Anggal Midtimbang', 'Datu Hoffer Ampatuan', 
                    'Datu Paglas', 'Datu Piang', 'Datu Salibo', 'Datu Saudi-Ampatuan', 'Datu Unsay', 
                    'General Salipada K. Pendatun', 'Guindulungan', 'Mamasapano', 'Mangudadatu', 'Pagalungan', 
                    'Paglat', 'Pandag', 'Rajah Buayan', 'Shariff Aguak', 'Shariff Saydona Mustapha', 
                    'South Upi', 'Sultan sa Barongis', 'Talayan'
                ],
                'Lanao del Sur' => [
                    'Marawi City',
                    'Bacolod-Kalawi', 'Balabagan', 'Balindong', 'Bayang', 'Binidayan', 'Buadiposo-Buntong', 
                    'Bubong', 'Bumbaran', 'Butig', 'Calanogas', 'Ditsaan-Ramain', 'Ganassi', 'Kapai', 
                    'Kapatagan', 'Lumba-Bayabao', 'Lumbaca-Unayan', 'Lumbatan', 'Lumbayanague', 'Madalum', 
                    'Madamba', 'Maguing', 'Malabang', 'Marantao', 'Marogong', 'Masiu', 'Mulondo', 
                    'Pagayawan', 'Piagapo', 'Picong', 'Poona Bayabao', 'Pualas', 'Saguiaran', 
                    'Sultan Dumalondong', 'Tagoloan II', 'Tamparan', 'Taraka', 'Tubaran', 'Tugaya', 'Wao'
                ]
            ]
        ];

        // 3. EXECUTE INSERTION
        foreach ($data as $regionName => $provinces) {
            $regId = DB::table('regions')->insertGetId(['name' => $regionName]);
            
            foreach ($provinces as $provName => $cities) {
                $provId = DB::table('provinces')->insertGetId([
                    'name' => $provName,
                    'region_id' => $regId
                ]);

                // Prepare Bulk Insert for Cities
                $cityPayload = [];
                foreach ($cities as $cityName) {
                    $cityPayload[] = [
                        'name' => $cityName,
                        'province_id' => $provId,
                        'created_at' => now(), // Uncomment if your DB strictly requires this
                        'updated_at' => now(),
                    ];
                }
                
                DB::table('cities')->insert($cityPayload);
            }
        }
    }
}