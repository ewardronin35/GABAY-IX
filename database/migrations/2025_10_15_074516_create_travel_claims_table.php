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
        Schema::create('travel_claims', function (Blueprint $table) {
            $table->id();
            
            // Link to the user
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // --- MOED Details (from Form KD) ---
            $table->string('moed_no')->unique(); // "MOED NO"
            $table->date('date_filed'); // "Date"

            // --- Employee Details (from Form KD) ---
            // 'Name' is on the user table
            $table->string('position')->nullable();
            $table->string('official_station')->nullable();

            // --- Travel Details (from Form KD) ---
            $table->text('purpose');
            $table->string('places_to_be_visited')->nullable();
            $table->date('date_of_travel')->nullable();
            $table->unsignedSmallInteger('duration_days')->nullable(); // "Duration (No. of Days)"
            $table->string('source_of_fund')->nullable();

            // --- Financials (from Form KD) ---
            $table->decimal('per_diems', 10, 2)->nullable();
            $table->decimal('transportation', 10, 2)->nullable();
            $table->decimal('others_amount', 10, 2)->nullable();
            $table->string('others_specify')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable(); // "Total"
            $table->decimal('cash_advance', 10, 2)->nullable();

            // --- Signatories (from Form KD) ---
            $table->string('recommending_approval_name')->nullable();
            $table->string('recommending_approval_designation')->nullable();
            $table->string('approved_by_name')->nullable();
            $table->string('approved_by_designation')->nullable();
            
            // --- System Status ---
            $table->string('status')->default('Pending'); // e.g., Pending, Approved, Liquidated

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_claims');
    }
};