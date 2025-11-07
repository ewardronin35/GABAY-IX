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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();

            // Relationship to the period this batch is for
            $table->foreignId('global_academic_period_id')->constrained('global_academic_periods');

            $table->string('program_type')->default('TES')->comment('e.g., TES, TDP');
            $table->enum('batch_type', ['NOA', 'PAYROLL']);
            $table->enum('batch_status', ['pending_chief', 'pending_rd', 'approved', 'paid', 'returned'])
                  ->default('pending_chief');
            
            $table->decimal('total_amount', 10, 2)->nullable()->comment('For payroll batches');
            $table->text('remarks')->nullable()->comment('For "returned" batches');

            // --- The Approval Chain ---
            // Uses foreign keys to your existing 'users' table
            
            // The Admin who created the batch
            $table->foreignId('created_by_user_id')->constrained('users');
            
            // The Chief who endorsed the batch
            $table->foreignId('chief_approver_id')->nullable()->constrained('users')->nullOnDelete();
            
            // The RD who approved the batch
            $table->foreignId('rd_approver_id')->nullable()->constrained('users')->nullOnDelete();

            // The Cashier who paid the batch
            $table->foreignId('cashier_processor_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};