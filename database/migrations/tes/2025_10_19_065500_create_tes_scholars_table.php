<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tes_scholars', function (Blueprint $table) {
            $table->id();
            $table->string('family_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->char('sex', 1)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('street')->nullable();
            $table->string('municipality')->nullable();
            $table->string('province')->nullable();
            $table->string('pwd_classification')->nullable();
            $table->timestamps();
            
            // Ensures a person isn't added twice
            $table->unique(['family_name', 'given_name', 'birthdate']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tes_scholars');
    }
};