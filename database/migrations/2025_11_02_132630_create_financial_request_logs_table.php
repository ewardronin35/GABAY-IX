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
        Schema::create('financial_request_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_request_id')
                  ->constrained('financial_requests')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            $table->string('action'); // e.g., 'submitted', 'budget_approved'
            $table->text('remarks')->nullable(); // For rejection or comments
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_request_logs');
    }
};
