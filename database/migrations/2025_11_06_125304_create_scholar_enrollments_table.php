<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholar_enrollments', function (Blueprint $table) {
            $table->id();

            // The "Person"
            $table->foreignId('scholar_id')->constrained('scholars')->onDelete('cascade');

            // The "Program" (Uses your existing 'programs' table)
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');

            // Data specific to this enrollment/role
            $table->foreignId('hei_id')->nullable()->constrained('heis')->onDelete('set null');
            $table->string('status')->default('active'); // e.g., active, inactive, graduated
            $table->string('award_number')->nullable();
            $table->string('academic_year_applied')->nullable();

            $table->timestamps();

            // Make sure a scholar can only be in a program once
            $table->unique(['scholar_id', 'program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholar_enrollments');
    }
};