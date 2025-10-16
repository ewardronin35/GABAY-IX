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
        Schema::table('stufaps', function (Blueprint $table) {
            // ✨ FIX: Modify each boolean column to have a default value of 0 (false)
            $table->boolean('is_solo_parent')->default(0)->change();
            $table->boolean('is_senior_citizen')->default(0)->change();
            $table->boolean('is_pwd')->default(0)->change();
            $table->boolean('is_ip')->default(0)->change();
            $table->boolean('is_first_generation')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stufaps', function (Blueprint $table) {
            // This allows the migration to be reversible
            $table->boolean('is_solo_parent')->default(null)->change();
            $table->boolean('is_senior_citizen')->default(null)->change();
            $table->boolean('is_pwd')->default(null)->change();
            $table->boolean('is_ip')->default(null)->change();
            $table->boolean('is_first_generation')->default(null)->change();
        });
    }
};