<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('heis', function (Blueprint $table) {
        $table->id();
        $table->string('hei_name'); // We still store the name
        $table->string('hei_code')->nullable();
        $table->string('type_of_heis')->nullable();

        // --- NEW NORMALIZED COLUMNS ---
        // These replace the old 'city', 'province', 'district' strings
        $table->foreignId('province_id')->nullable()->constrained('provinces');
        $table->foreignId('city_id')->nullable()->constrained('cities');
        $table->foreignId('district_id')->nullable()->constrained('districts');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('heis');
    }
};