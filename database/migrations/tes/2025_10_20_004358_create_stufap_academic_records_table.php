<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stufap_academic_records', function (Blueprint $table) {
            $table->id();

            // Foreign Keys for relationships
            $table->foreignId('stufap_scholar_id')->constrained('stufap_scholars')->onDelete('cascade');
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->foreignId('hei_id')->constrained('heis')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');

            // Data fields from the spreadsheet
            $table->integer('seq')->nullable();
            $table->string('award_year')->nullable();
            $table->string('award_number')->nullable()->unique(); // Award numbers should be unique
            $table->string('priority_cluster')->nullable();
            $table->string('1st_payment_sem')->nullable();
            $table->string('2nd_payment_sem')->nullable();
            $table->string('curriculum_year')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status_type')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stufap_academic_records');
    }
};