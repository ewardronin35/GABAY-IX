<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('travel_orders', function (Blueprint $table) {
            // Path to the uploaded memo file
            $table->string('memo_path')->nullable()->after('purpose');

            // Fields to be filled by the Approving Authority (RD)
            // These match the checkboxes in your second screenshot
            $table->string('travel_type')->nullable()->after('memo_path'); // 'Official Business' or 'Official Time'
            $table->boolean('is_salary_deduction')->default(false);
            $table->boolean('is_no_per_diem')->default(false);
            $table->boolean('is_vehicle_provided')->default(false);
        });
    }

    public function down()
    {
        Schema::table('travel_orders', function (Blueprint $table) {
            $table->dropColumn([
                'memo_path', 
                'travel_type', 
                'is_salary_deduction', 
                'is_no_per_diem', 
                'is_vehicle_provided'
            ]);
        });
    }
};