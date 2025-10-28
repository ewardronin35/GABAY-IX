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
        Schema::create('heis', function (Blueprint $table) {
            $table->id();
            $table->string('hei_name')->unique()->comment('Full name of the institution');
            $table->string('hei_code')->unique()->nullable()->comment('Official code for the HEI');
            $table->string('type_of_heis')->comment('e.g., Public, Private');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('heis');
    }
};