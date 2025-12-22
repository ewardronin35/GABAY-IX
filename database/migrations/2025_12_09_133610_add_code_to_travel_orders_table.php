<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('travel_orders', function (Blueprint $table) {
        // The code given by the RD (e.g., "TO-2025-08-099")
        $table->string('travel_order_code')->nullable()->after('status');
        
        // Ensure you have these financial columns if they were missing
        // $table->decimal('est_airfare', 10, 2)->default(0); 
        // $table->decimal('est_registration', 10, 2)->default(0);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('travel_orders', function (Blueprint $table) {
            //
        });
    }
};
