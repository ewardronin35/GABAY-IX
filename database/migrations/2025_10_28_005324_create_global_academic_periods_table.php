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
        Schema::create('global_academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year')->comment('e.g., 2025-2026');
            $table->integer('semester')->comment('1 for 1st, 2 for 2nd');
            $table->string('name')->comment('e.g., "AY 2025-2026 - 1st Semester"');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('global_academic_periods');
    }
};