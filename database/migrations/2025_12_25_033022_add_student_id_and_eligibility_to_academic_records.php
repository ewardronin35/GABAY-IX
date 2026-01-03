<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_records', function (Blueprint $table) {
            // Check if column exists before adding to prevent errors
            if (!Schema::hasColumn('academic_records', 'student_id')) {
                $table->string('student_id')->nullable()->after('batch_no');
            }
            
            if (!Schema::hasColumn('academic_records', 'eligibility_equivalent')) {
                $table->decimal('eligibility_equivalent', 3, 1)->default(0.5)->nullable()->after('grant_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('academic_records', function (Blueprint $table) {
            $table->dropColumn(['student_id', 'eligibility_equivalent']);
        });
    }
};