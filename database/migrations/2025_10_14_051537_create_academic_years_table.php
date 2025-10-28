<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scholar_id')->constrained()->onDelete('cascade');
            $table->string('year'); // e.g., "2023-2024"
            
            $table->string('academic_year')->comment('e.g., 2024-2025');
            $table->string('semester')->comment('e.g., 1st Semester, 2nd Semester');
            $table->integer('year_level');
            $table->integer('units_enrolled')->nullable();
            $table->string('validation_status')->default('pending');
            $table->string('app_no')->unique()->nullable()->comment('Application Number for this specific period');
            
            $table->string('cy')->nullable(); // Column 'cy_2023_2024' becomes 'cy'
            $table->date('osds_date_processed')->nullable();
            $table->string('transferred_to_chedros')->nullable();
            $table->decimal('nta_financial_benefits', 10, 2)->nullable();
            $table->string('fund_source')->nullable();
            
            // First Semester
            $table->decimal('payment_first_sem', 10, 2)->nullable();
            $table->date('first_sem_disbursement_date')->nullable();
            $table->string('first_sem_status')->nullable();
            $table->text('first_sem_remarks')->nullable();
            
            // Second Semester
            $table->decimal('payment_second_sem', 10, 2)->nullable();
            $table->date('second_sem_disbursement_date')->nullable();
            $table->string('second_sem_status')->nullable();
            $table->string('second_sem_fund_source')->nullable(); // Note: this was only in 2023 fields
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
