<?php
// database/migrations/..._create_academic_records_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();

            // This is the key: It links to the new enrollment table
            $table->foreignId('scholar_enrollment_id')->constrained('scholar_enrollments')->onDelete('cascade');

            // We still link these for easy reporting
            $table->foreignId('hei_id')->nullable()->constrained('heis')->onDelete('set null');
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('set null');

            // === All Merged Fields ===

            // From all tables
            $table->string('academic_year');
            $table->string('semester');
            $table->string('year_level')->nullable();
            $table->string('total_units_enrolled')->nullable();
            $table->string('grant_amount')->nullable();
            $table->string('validation_status')->nullable();
            $table->string('payment_status')->nullable();
            $table->text('remarks')->nullable();

            // From tes_academic_records
            $table->string('app_no')->nullable();
            $table->string('seq')->nullable();
            $table->string('batch_no')->nullable();
            $table->string('endorsed_by')->nullable();

            // From tdp/stufap_academic_records
            $table->string('gwa')->nullable();

            // From estatskolar_monitorings / academic_years
            $table->date('disbursement_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_records');
    }
};