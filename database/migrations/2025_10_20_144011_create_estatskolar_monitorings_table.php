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
        Schema::create('estatskolar_monitorings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estatskolar_id')->constrained()->onDelete('cascade');
            $table->string('academic_year');

            // 1st Semester Columns
            $table->string('current_year_level_1st_sem')->nullable();
            $table->string('status_1st_semester')->nullable();
            $table->decimal('osds_fund_release_amount_1st_semester', 10, 2)->nullable();
            $table->date('osds_fund_release_date_1st_semester')->nullable();
            $table->decimal('chedro_payment_amount_1st_semester', 10, 2)->nullable();
            $table->date('chedro_payment_date_1st_semester')->nullable();
            $table->string('mode_of_payment_1st_semester')->nullable();

            // 2nd Semester Columns
            $table->string('current_year_level_2nd_sem')->nullable();
            $table->string('status_2nd_semester')->nullable();
            $table->decimal('osds_fund_release_amount_2nd_semester', 10, 2)->nullable();
            $table->date('osds_fund_release_date_2nd_semester')->nullable();
            $table->decimal('chedro_payment_amount_2nd_semester', 10, 2)->nullable();
            $table->date('chedro_payment_date_2nd_semester')->nullable();
            $table->string('mode_of_payment_2nd_semester')->nullable();
            
            // General Columns
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Ensure only one monitoring record per scholar per academic year
            $table->unique(['estatskolar_id', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estatskolar_monitorings');
    }
};