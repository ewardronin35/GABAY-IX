<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  // database/migrations/xxxx_xx_xx_create_vehicle_trip_tickets_table.php
public function up(): void
{
    Schema::create('vehicle_trip_tickets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('driver_name');
        $table->string('vehicle_plate')->nullable(); // e.g., "Toyota Hiace - SAA 1234"
        $table->date('date_of_travel');
        $table->string('destination');
        $table->text('purpose');
        $table->text('passengers'); // Store as comma-separated or JSON
        $table->time('departure_time');
        $table->time('return_time')->nullable();
        $table->string('status')->default('pending'); // pending, approved
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_trip_tickets');
    }
};
