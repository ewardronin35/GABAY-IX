<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('place');
            $table->time('departure_time')->nullable();
            $table->time('arrival_time')->nullable();
            $table->string('transport_means');
            $table->decimal('fare', 8, 2)->default(0);
            $table->decimal('per_diem', 8, 2)->default(0);
            $table->decimal('others', 8, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerary_items');
    }
};