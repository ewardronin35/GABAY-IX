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
        Schema::create('rers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_claim_id')->constrained('travel_claims')->onDelete('cascade');
            $table->unsignedSmallInteger('sheet_no')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('cash_advance', 10, 2)->nullable();
            $table->decimal('amount_reimbursed', 10, 2)->nullable();
            $table->decimal('amount_refunded', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rers');
    }
};