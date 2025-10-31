<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_requests', function (Blueprint $table) {
            $table->id();

            // The 'USER' who submitted it
            $table->foreignId('user_id')->constrained('users');

            $table->string('title'); // The "name" you mentioned
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2);

            // --- The Workflow Chain ---
            $table->enum('status', [
                'draft',
                'pending_budget',
                'pending_accounting',
                'pending_cashier',
                'completed',
                'rejected'
            ])->default('pending_budget');

            $table->text('remarks')->nullable(); // For rejections

            // --- Approver Timestamps and IDs ---
            $table->foreignId('budget_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('budget_approved_at')->nullable();

            $table->foreignId('accounting_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accounting_approved_at')->nullable();

            $table->foreignId('cashier_processor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cashier_paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_requests');
    }
};