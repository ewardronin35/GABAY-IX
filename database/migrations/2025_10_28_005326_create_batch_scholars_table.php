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
        Schema::create('batch_scholars', function (Blueprint $table) {
            $table->id();
            
            // Explicitly define the column as unsignedBigInteger
            $table->unsignedBigInteger('batch_id');
            $table->unsignedBigInteger('scholar_id');

            $table->timestamps();
            
            // Add the constraints *after* defining the columns
            $table->foreign('batch_id')->references('id')->on('batches')->onDelete('cascade');
            $table->foreign('scholar_id')->references('id')->on('scholars')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_scholars', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropForeign(['scholar_id']);
        });
        Schema::dropIfExists('batch_scholars');
    }
};