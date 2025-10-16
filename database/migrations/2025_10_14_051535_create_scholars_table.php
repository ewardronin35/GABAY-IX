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
        Schema::create('scholars', function (Blueprint $table) {
            $table->id();
            $table->string('award_year');
            $table->string('program_name');
            $table->string('status_type');
            $table->string('region');
            $table->string('award_number')->unique();
            
            // Personal Information
            $table->string('family_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->enum('sex', ['M', 'F']);
            $table->date('date_of_birth');
            
            // Farmer Information
            $table->boolean('registered_coconut_farmer')->default(false);
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
            $table->string('email_address')->unique()->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholars');
    }
};
