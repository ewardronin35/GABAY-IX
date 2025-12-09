<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('travel_orders', function (Blueprint $table) {
            $table->id();
            
            // 1. Requester Info
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // 2. Travel Details
            $table->string('destination'); // e.g. "Ilocandia Cultural Center..."
            $table->date('date_from');
            $table->date('date_to');
            $table->text('purpose'); // The paragraph text for the order
            
            // 3. Fund Source (Linked to your SAA Module)
            // Nullable because they might not know the exact SAA yet
            $table->foreignId('fund_source_id')->nullable()->constrained('sub_allotments')->onDelete('set null');

            // 4. Budget Estimates (From your Excel columns)
            $table->decimal('est_airfare', 10, 2)->default(0);
            $table->decimal('est_registration', 10, 2)->default(0);
            $table->decimal('est_per_diem', 10, 2)->default(0); // Travel Allowance
            $table->decimal('est_terminal', 10, 2)->default(0); // Misc expenses
            $table->decimal('total_estimated_cost', 12, 2)->default(0);

            // 5. Approval Workflow
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected, Cancelled
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users'); // The RD who clicked approve
            $table->text('rejection_reason')->nullable();

            // 6. Generated Document Path (Optional, if you save the PDF)
            $table->string('generated_pdf_path')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('travel_orders');
    }
};