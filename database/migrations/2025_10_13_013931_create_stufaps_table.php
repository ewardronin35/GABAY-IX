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
        Schema::create('stufaps', function (Blueprint $table) {
          $table->id('seq');
    
    // Basic Award Information
    $table->string('award_year')->nullable();
    $table->string('program_name')->nullable();
    $table->string('status_type')->nullable(); // New/Ongoing
    $table->string('region')->nullable();
    $table->string('award_number')->nullable();
    
    // Personal Information
    $table->string('family_name')->nullable();
    $table->string('given_name')->nullable();
    $table->string('middle_name')->nullable();
    $table->string('extension_name')->nullable();
    $table->string('sex')->nullable();
    $table->date('date_of_birth')->nullable();
    
    // Farmer Information
    $table->string('registered_coconut_farmer')->nullable();
    $table->string('farmer_registry_no')->nullable();
    
    // Special Categories
    $table->string('special_group')->nullable();
    $table->boolean('is_solo_parent')->default(false);
    $table->boolean('is_senior_citizen')->default(false);
    $table->boolean('is_pwd')->default(false);
    $table->boolean('is_ip')->default(false);
    $table->boolean('is_first_generation')->default(false);
    
    // Contact Information
    $table->string('contact_no')->nullable();
    $table->string('email_address')->nullable();
    
    // Address Information
    $table->string('brgy_street')->nullable();
    $table->string('town_city')->nullable();
    $table->string('province')->nullable();
    $table->string('congressional_district')->nullable();
    
    // Educational Information
    $table->string('hei_name')->nullable();
    $table->string('type_of_heis')->nullable();
    $table->string('hei_code')->nullable();
    $table->string('program')->nullable();
    $table->string('priority_program_tagging')->nullable();
    $table->string('course_code')->nullable();
    
    // Academic Year 2023-2024
    $table->string('cy_2023_2024')->nullable();
    $table->date('osds_date_processed_2023')->nullable();
    $table->string('transferred_to_chedros_2023')->nullable();
    $table->string('nta_financial_benefits_2023')->nullable();
    $table->string('fund_source_2023')->nullable();
    
    // First Semester 2023-2024
    $table->decimal('payment_first_sem_2023', 10, 2)->nullable();
    $table->date('first_sem_2023_disbursement_date')->nullable();
    $table->string('first_sem_2023_status')->nullable();
    $table->text('first_sem_2023_remarks')->nullable();
    
    // Second Semester 2023-2024
    $table->decimal('payment_second_sem_2023', 10, 2)->nullable();
    $table->date('second_sem_2023_disbursement_date')->nullable();
    $table->string('second_sem_2023_status')->nullable();
    $table->string('second_sem_2023_fund_source')->nullable();
    
    // Thesis/OJT/Conference 2023-2024
    $table->date('thesis_processed_date_2023')->nullable();
    $table->string('thesis_details_2023')->nullable();
    $table->string('thesis_transferred_to_chedros_2023')->nullable();
    $table->string('thesis_nta_2023')->nullable();
    $table->decimal('thesis_amount_2023', 10, 2)->nullable();
    $table->date('thesis_disbursement_date_2023')->nullable();
    $table->text('thesis_remarks_2023')->nullable();
    
    // Academic Year 2024-2025
    $table->string('cy_2024_2025')->nullable();
    $table->date('osds_date_processed_2024')->nullable();
    $table->string('transferred_to_chedros_2024')->nullable();
    $table->string('nta_financial_benefits_2024')->nullable();
    $table->string('fund_source_2024')->nullable();
    
    // First Semester 2024-2025
    $table->decimal('payment_first_sem_2024', 10, 2)->nullable();
    $table->date('first_sem_2024_disbursement_date')->nullable();
    $table->string('first_sem_2024_status')->nullable();
    $table->text('first_sem_2024_remarks')->nullable();
    
    // Second Semester 2024-2025
    $table->decimal('payment_second_sem_2024', 10, 2)->nullable();
    $table->date('second_sem_2024_disbursement_date')->nullable();
    $table->string('second_sem_2024_status')->nullable();
    $table->string('second_sem_2024_fund_source')->nullable();
    
    // Thesis/OJT/Conference 2024-2025
    $table->date('thesis_processed_date_2024')->nullable();
    $table->string('thesis_details_2024')->nullable();
    $table->string('thesis_transferred_to_chedros_2024')->nullable();
    $table->string('thesis_nta_2024')->nullable();
    $table->decimal('thesis_amount_2024', 10, 2)->nullable(); // Add this line
    $table->date('thesis_disbursement_date_2024')->nullable();
    $table->date('thesis_final_disbursement_2024')->nullable();
    $table->text('thesis_remarks_2024')->nullable();
    
    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stufaps');
    }
};