<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tdp_academic_records', function (Blueprint $table) {
            $table->id();
            // Foreign keys linking to other tables
            $table->foreignId('tdp_scholar_id')->constrained('tdp_scholars')->onDelete('cascade');
            $table->foreignId('hei_id')->constrained('heis')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            
            $table->integer('seq')->nullable();
            $table->string('app_no')->nullable();
            $table->string('award_no')->nullable()->unique();
            $table->string('year_level')->nullable();
            $table->string('batch')->nullable();
            $table->string('validation_status')->nullable();
            $table->string('semester')->nullable();
            $table->string('academic_year')->nullable(); // Corresponds to 'YEAR'
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tdp_academic_records');
    }
};