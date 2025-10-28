<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// In the new migration file
public function up(): void
{
    Schema::table('academic_years', function (Blueprint $table) {
        $table->string('processor_name')->nullable()->after('financial_benefit_amount');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_years', function (Blueprint $table) {
            //
        });
    }
};
