<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarship_applications', function (Blueprint $table) {
            // --- Core Fields ---
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('draft');
            $table->timestamps();
            $table->unique('user_id');

            // --- APPLICANT'S PROFILE ---
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birthdate');
            $table->string('place_of_birth');
            $table->string('sex');
            $table->string('civil_status');
            $table->string('citizenship');
            $table->string('mobile_number');
            $table->string('email_address');
            $table->text('permanent_address');
            $table->string('zip_code');
            $table->string('distinctive_marks')->nullable();

            // --- FAMILY BACKGROUND ---
            $table->string('father_status')->nullable(); // Living or Deceased
            $table->string('father_name')->nullable();
            $table->text('father_address')->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('father_educational_attainment')->nullable();

            $table->string('mother_status')->nullable(); // Living or Deceased
            $table->string('mother_name')->nullable();
            $table->text('mother_address')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('mother_educational_attainment')->nullable();

            $table->decimal('parents_combined_income', 12, 2)->nullable();
            $table->integer('siblings_above_18')->nullable();
            $table->integer('siblings_below_18')->nullable();
            $table->string('spouse_name')->nullable();

            // --- EDUCATIONAL BACKGROUND ---
            $table->string('shs_name');
            $table->text('shs_address');
            $table->string('shs_track');
            $table->string('shs_strand');
            $table->decimal('shs_gwa', 5, 2);

            $table->string('college_name')->nullable(); // For incoming college students
            $table->text('college_address')->nullable();
            $table->string('college_course')->nullable();

            // --- OTHER FINANCIAL ASSISTANCE ---
            $table->string('other_scholarship_name')->nullable();
            $table->string('other_scholarship_year')->nullable();

            // --- CHECKLIST OF REQUIREMENTS (File Paths) ---
            $table->string('doc_birth_certificate')->nullable();
            $table->string('doc_good_moral')->nullable();
            $table->string('doc_report_card')->nullable();
            $table->string('doc_school_registration')->nullable();
            $table->string('doc_voters_certificate')->nullable();
            $table->string('doc_parent_voters_certificate')->nullable();
            $table->string('doc_proof_of_income')->nullable();
            $table->string('doc_certificate_of_indigency')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarship_applications');
    }
};