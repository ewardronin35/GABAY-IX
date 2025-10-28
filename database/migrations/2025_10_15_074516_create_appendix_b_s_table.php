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
        Schema::create('appendix_b_s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_claim_id')->constrained('travel_claims')->onDelete('cascade');
            $table->text('narration')->nullable();
            $table->text('observations_recommendations')->nullable();
            $table->date('submitted_at')->nullable();
            $table->string('noted_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appendix_b_s');
    }
};