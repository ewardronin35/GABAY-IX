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
        Schema::create('csmp_scholars', function (Blueprint $table) {
            $table->id();
            
            // Link to the main users table
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // --- Application Details ---
            $table->string('application_no')->unique();
            $table->string('academic_year')->nullable();
            $table->string('semester')->nullable();
            $table->string('assistance_type')->nullable(); // e.g., "Scholarship", "Grant-in-Aid"
            $table->boolean('is_priority_course')->default(false);
            $table->string('status')->default('Pending'); // e.g., Pending, Approved, Rejected

            // --- Personal Information (from Annex A Front) ---
            $table->string('family_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            
            $table->string('street')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city_municipality')->nullable();
            $table->string('province')->nullable();
            $table->string('district')->nullable();
            $table->string('zip_code')->nullable();
            
            $table->string('sex')->nullable();
            $table->string('civil_status')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->string('citizenship')->nullable();
            $table->string('mobile_no')->nullable();
            $table->string('email_address')->nullable(); // The main email is on the user table
            
            $table->string('disability')->nullable();
            $table->boolean('is_indigenous')->default(false);
            $table->string('indigenous_group')->nullable(); // If is_indigenous is true

            // --- Family Background (from Annex A Back) ---
            $table->string('father_name')->nullable();
            $table->string('father_status')->nullable(); // e.g., 'Living', 'Deceased'
            $table->string('father_address')->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('father_education')->nullable();

            $table->string('mother_name')->nullable();
            $table->string('mother_status')->nullable();
            $table->string('mother_address')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('mother_education')->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_address')->nullable();
            $table->string('guardian_occupation')->nullable();
            $table->string('guardian_education')->nullable();

            $table->string('spouse_name')->nullable();
            $table->string('spouse_address')->nullable();
            $table->string('spouse_occupation')->nullable();
            $table->string('spouse_education')->nullable();

            $table->unsignedSmallInteger('siblings_count')->nullable();
            $table->decimal('family_income', 10, 2)->nullable(); // Gross Annual Income
            $table->boolean('is_4ps_beneficiary')->default(false);

            // --- Academic Information (from Annex A Back) ---
            $table->string('last_school_name')->nullable();
            $table->string('last_school_address')->nullable();
            $table->string('last_school_type')->nullable(); // 'Public', 'Private'
            $table->string('school_level')->nullable(); // 'High School', 'SHS', 'College'
            $table->string('course')->nullable(); // If College
            $table->string('year_level')->nullable(); // If College
            $table->decimal('gwa', 4, 2)->nullable(); // General Weighted Average

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('csmp_scholars');
    }
};