<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_requests', function (Blueprint $table) {
            // Add the new column after 'amount'
            $table->string('request_type')->after('amount')->nullable(); 
        });
    }

    public function down(): void
    {
        Schema::table('financial_requests', function (Blueprint $table) {
            $table->dropColumn('request_type');
        });
    }
};