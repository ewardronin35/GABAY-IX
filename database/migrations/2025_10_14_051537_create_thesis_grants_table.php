<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thesis_grants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            
            $table->date('processed_date')->nullable();
            $table->string('details')->nullable();
            $table->string('transferred_to_chedros')->nullable();
            $table->string('nta')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->date('disbursement_date')->nullable();
            $table->date('final_disbursement_date')->nullable(); // Note: this was only in 2024 fields
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thesis_grants');
    }
};
