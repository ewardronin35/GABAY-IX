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
        Schema::create('rer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rer_id')->constrained('rers')->onDelete('cascade');
            $table->date('date')->nullable();
            $table->string('or_no')->nullable();
            $table->string('nature_of_expense')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rer_items');
    }
};