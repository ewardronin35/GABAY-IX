<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scholar_enrollments', function (Blueprint $table) {
            // Add the new foreign key column
            $table->unsignedBigInteger('academic_year_applied_id')->nullable()->after('program_id');

            // Add the foreign key constraint
            $table->foreign('academic_year_applied_id')
                  ->references('id')
                  ->on('academic_years')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('scholar_enrollments', function (Blueprint $table) {
            $table->dropForeign(['academic_year_applied_id']);
            $table->dropColumn('academic_year_applied_id');
        });
    }
};