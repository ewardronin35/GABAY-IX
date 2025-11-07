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
        Schema::table('tdp_academic_records', function (Blueprint $table) {
            // Find a good column to place them after, like 'validation_status'
            $table->date('date_paid')->nullable()->after('validation_status');
            $table->string('ada_no')->nullable()->after('date_paid');
            $table->decimal('tdp_grant', 10, 2)->nullable()->after('ada_no');
            $table->string('endorsed_by')->nullable()->after('tdp_grant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tdp_academic_records', function (Blueprint $table) {
            $table->dropColumn([
                'date_paid',
                'ada_no',
                'tdp_grant',
                'endorsed_by'
            ]);
        });
    }
};