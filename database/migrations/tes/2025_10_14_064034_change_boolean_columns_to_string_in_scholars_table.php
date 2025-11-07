<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This changes the boolean columns to strings with a default of 'No'.
     */
    public function up(): void
    {
        Schema::table('scholars', function (Blueprint $table) {
            $table->string('is_solo_parent')->default('No')->change();
            $table->string('is_senior_citizen')->default('No')->change();
            $table->string('is_pwd')->default('No')->change();
            $table->string('is_ip')->default('No')->change();
            $table->string('is_first_generation')->default('No')->change();
        });
    }

    /**
     * Reverse the migrations.
     * This changes the columns back to booleans with a default of false.
     */
    public function down(): void
    {
        Schema::table('scholars', function (Blueprint $table) {
            $table->boolean('is_solo_parent')->default(false)->change();
            $table->boolean('is_senior_citizen')->default(false)->change();
            $table->boolean('is_pwd')->default(false)->change();
            $table->boolean('is_ip')->default(false)->change();
            $table->boolean('is_first_generation')->default(false)->change();
        });
    }
};