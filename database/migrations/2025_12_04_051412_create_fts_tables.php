<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. The Fund Source (SAA / Sub-ARO)
        Schema::create('sub_allotments', function (Blueprint $table) {
            $table->id();
            $table->string('saa_number')->unique(); // e.g., "SAA-2025-01"
            $table->date('date_received');
            
            // Link to your existing Programs table (TES, TDP, etc.)
            $table->foreignId('program_id')->nullable()->constrained('programs')->onDelete('set null');
            
            $table->decimal('total_amount', 15, 2); // Total Budget
            $table->text('description')->nullable(); // e.g., "For 1st Sem AY 2024-2025"
            $table->string('status')->default('Active'); // Active, Fully Utilized, Expired
            $table->timestamps();
        });

        // 2. The Transactions (Obligations / ORS)
        Schema::create('obligations', function (Blueprint $table) {
            $table->id();
            
            // The Link: Connects this expense to a specific SAA
            $table->foreignId('sub_allotment_id')->constrained('sub_allotments')->onDelete('cascade');
            
            $table->string('ors_number'); // Obligation Request Status No.
            $table->date('date_processed');
            
            // Particulars
            $table->text('particulars')->nullable();
            $table->string('uacs_code')->nullable(); // Expense Class Code
            $table->decimal('amount', 15, 2);
            
            // Dynamic Payee (Polymorphic)
            // Allows linking to a Scholar, HEI, or just a name
            $table->nullableMorphs('payee'); // Creates payee_type and payee_id
            $table->string('payee_name')->nullable(); // Fallback if no specific ID exists (e.g., "PLDT")

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('obligations');
        Schema::dropIfExists('sub_allotments');
    }
};