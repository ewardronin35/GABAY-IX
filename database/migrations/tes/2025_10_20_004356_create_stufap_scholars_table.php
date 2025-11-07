<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stufap_scholars', function (Blueprint $table) {
            $table->id();
            $table->string('family_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->char('sex', 1)->nullable();

            // Address Fields
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('congressional_district')->nullable();
            $table->string('region')->nullable();
            
            $table->timestamps();

            // Prevent duplicate entries based on full name
            $table->unique(['family_name', 'given_name', 'middle_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stufap_scholars');
    }
};