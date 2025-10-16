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
       Schema::create('travel_reports', function (Blueprint $table) {
    $table->id();
    $table->foreignId('travel_claim_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->string('activity_title');
    $table->string('date_of_activity');
    $table->string('venue')->nullable();
    $table->string('sponsoring_agency')->nullable();
    $table->text('background')->nullable();
    $table->text('summary')->nullable();
    $table->text('takeaways')->nullable();
    $table->text('recommendations')->nullable();
    $table->string('noted_by');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_reports');
    }
};
