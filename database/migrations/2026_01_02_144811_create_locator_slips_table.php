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
        Schema::create('locator_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->date('date');
            $table->dateTime('time_departure');
            $table->dateTime('time_arrival')->nullable(); // Nullable because trip starts without arrival time
            
            $table->string('destination');
            $table->string('purpose');
            
            // 'official' or 'personal'
            $table->string('type'); 
            
            // 'pending', 'approved', 'rejected'
            $table->string('status')->default('pending'); 
            
            // For Official Business signature
            $table->string('representative')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locator_slips');
    }
};