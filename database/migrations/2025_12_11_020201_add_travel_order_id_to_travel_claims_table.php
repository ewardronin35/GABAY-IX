<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('travel_claims', function (Blueprint $table) {
            // This links the claim to the specific Travel Order
            $table->foreignId('travel_order_id')
                  ->nullable()
                  ->after('id') // Place it at the top
                  ->constrained('travel_orders')
                  ->onDelete('cascade');
                  
            // Also ensure user_id exists if it doesn't already
            if (!Schema::hasColumn('travel_claims', 'user_id')) {
                $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('travel_claims', function (Blueprint $table) {
            $table->dropForeign(['travel_order_id']);
            $table->dropColumn('travel_order_id');
        });
    }
};