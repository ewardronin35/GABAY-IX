<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Capture the raw Course Name in case 'course_id' lookup fails
        Schema::table('academic_records', function (Blueprint $table) {
            $table->string('course_name')->nullable()->after('course_id');
        });

        // 2. Capture School Type (Public/Private) from Excel
        Schema::table('scholar_enrollments', function (Blueprint $table) {
            $table->string('school_type')->nullable()->after('hei_id');
        });

        // 3. Capture Region/District text if you don't have the IDs set up
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('region_name')->nullable(); // For "Region IX"
            $table->string('district_no')->nullable(); // For "1" or "2"
        });
    }

    public function down()
    {
        Schema::table('academic_records', function (Blueprint $table) {
            $table->dropColumn('course_name');
        });
        Schema::table('scholar_enrollments', function (Blueprint $table) {
            $table->dropColumn('school_type');
        });
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['region_name', 'district_no']);
        });
    }
};