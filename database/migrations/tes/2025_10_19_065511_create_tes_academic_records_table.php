<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tes_academic_records', function (Blueprint $table) {
            $table->id();

            // --- THE FIX ---
            // We define the columns and constraints manually to ensure a perfect match.

            // 1. Foreign Key for TesScholar (standard unsigned big integer)
            $table->unsignedBigInteger('tes_scholar_id');
            $table->foreign('tes_scholar_id')->references('id')->on('tes_scholars')->onDelete('cascade');

            // 2. Foreign Key for HEI (assumes standard unsigned big integer)
            $table->unsignedBigInteger('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');

            // 3. Foreign Key for Course (assumes standard unsigned big integer)
            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            
            $table->integer('seq')->nullable();
            $table->string('app_no')->nullable();
            $table->string('award_no')->nullable();
            $table->string('year_level')->nullable();
            $table->integer('total_units_enrolled')->nullable();
            $table->string('grant_amount')->nullable();
            $table->string('batch_no')->nullable();
            $table->string('validation_status')->nullable();
            $table->string('payment_status')->nullable();
            $table->text('remarks')->nullable();
            $table->string('endorsed_by')->nullable();
            $table->string('semester')->nullable();
            $table->string('academic_year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tes_academic_records');
    }
};