<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_records', function (Blueprint $table) {
            $table->id();
            
            // This is the main link. One billing record per academic record.
            $table->foreignId('academic_record_id')->constrained('academic_records')->onDelete('cascade');
            
            // --- Your Billing Columns ---
            $table->string('status')->nullable(); // On Going, Awarded, etc.
            $table->string('remarks')->nullable(); // For "Delisted"
            $table->foreignId('validated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('date_fund_request')->nullable();
            $table->date('date_sub_aro')->nullable();
            $table->date('date_nta')->nullable();
            $table->date('date_disbursed_hei')->nullable();
            $table->date('date_disbursed_grantee')->nullable();
            $table->decimal('billing_amount', 10, 2)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_records');
    }
};