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
        Schema::create('notice_of_awards', function (Blueprint $table) {
            $table->id();
            
            // Link to the scholar
            $table->foreignId('scholar_id')->constrained('scholars')->onDelete('cascade');
            
            // Link to the NOA batch that created this
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');

            $table->enum('status', ['pending_release', 'pending_acceptance', 'accepted'])
                  ->default('pending_release');
            
            $table->string('generated_file_path')->nullable()->comment('Path to the signed PDF');
            $table->timestamp('accepted_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notice_of_awards');
    }
};