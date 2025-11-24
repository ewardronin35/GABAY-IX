<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_records', function (Blueprint $table) {
            // Add the new foreign key column
            $table->unsignedBigInteger('semester_id')->nullable()->after('semester');

            // Add the link
            $table->foreign('semester_id')->references('id')->on('semesters')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('academic_records', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn('semester_id');
        });
    }
};