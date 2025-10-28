<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tdp_scholars', function (Blueprint $table) {
            $table->id();
            $table->string('family_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->char('sex', 1)->nullable();
            
            // Address & Contact Info
            $table->string('street')->nullable();
            $table->string('town_city')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('email_address')->nullable()->unique();
            
            $table->timestamps();

            // Prevent duplicate entries
            $table->unique(['family_name', 'given_name', 'middle_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tdp_scholars');
    }
};