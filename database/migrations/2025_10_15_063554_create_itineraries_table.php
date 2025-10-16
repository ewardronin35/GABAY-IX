<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('official_station');
            $table->string('fund_cluster')->nullable();
            $table->string('itinerary_no')->nullable();
            $table->string('date_of_travel');
            $table->text('purpose');
            $table->decimal('total_fare', 8, 2)->default(0);
            $table->decimal('total_per_diem', 8, 2)->default(0);
            $table->decimal('total_others', 8, 2)->default(0);
            $table->decimal('grand_total', 8, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itineraries');
    }
};