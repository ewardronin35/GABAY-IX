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
    Schema::create('user_personal_locator_time', function (Illuminate\Database\Schema\Blueprint $table) {
        $table->id();
        // Foreign key to users table
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        // Stores format 'YYYY-MM' (e.g., 2026-01)
        $table->string('month'); 
        // Stores consumed seconds, default to 0
        $table->integer('time_consumed_seconds')->default(0);
        $table->timestamps();

        // Optional: Ensure a user only has one record per month
        $table->unique(['user_id', 'month']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_personal_locator_time');
    }
};
