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
    Schema::table('heis', function (Blueprint $table) {
        $table->string('city')->nullable()->after('type_of_heis');
        $table->string('province')->nullable()->after('city');
        $table->string('district')->nullable()->after('province');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('heis', function (Blueprint $table) {
            //
        });
    }
};
