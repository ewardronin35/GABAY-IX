<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Section 1-5: Basic Info
            $table->string('office_department')->nullable();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->date('date_of_filing');
            $table->string('position')->nullable();
            $table->decimal('salary', 12, 2)->nullable();
            
            // Section 6.A: Type of Leave
            $table->string('leave_type');
            $table->string('leave_type_others')->nullable();
            
            // Section 6.B: Details of Leave (stored as JSON for flexibility)
            $table->json('leave_details')->nullable();
            
            // Section 6.C: Working Days & Dates
            $table->integer('working_days')->nullable();
            $table->date('inclusive_date_start')->nullable();
            $table->date('inclusive_date_end')->nullable();
            
            // Section 6.D: Commutation
            $table->boolean('commutation_requested')->default(false);
            
            // Status tracking
            $table->string('status')->default('pending');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_applications');
    }
};
