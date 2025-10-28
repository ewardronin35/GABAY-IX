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
    Schema::table('academic_years', function (Blueprint $table) {
        // This assumes you've already added 'app_no' from our previous steps
        $table->string('award_number')->nullable()->after('app_no');
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
