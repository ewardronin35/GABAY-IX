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
        Schema::create('estatskolars', function (Blueprint $table) {
            $table->id();
            $table->string('region')->nullable();
            $table->string('lrn')->unique()->nullable()->comment('Learner Reference Number');
            $table->string('scholarship_type')->nullable();
            $table->string('award_number')->unique();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->date('birthdate')->nullable();
            $table->char('sex', 1)->nullable();
            $table->string('civil_status')->nullable();
            $table->string('brgy_psgc_code')->nullable();
            $table->string('city_psgc_code')->nullable();
            $table->string('province_psgc_code')->nullable();
            $table->string('uii_code')->unique()->nullable()->comment('Unique Identifier Code');
            $table->string('hei_name')->nullable();
            $table->string('priority_program_code')->nullable();
            $table->string('program_name')->nullable();
            $table->string('special_equity_group')->nullable();
            $table->string('special_equity_group_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estatskolars');
    }
};