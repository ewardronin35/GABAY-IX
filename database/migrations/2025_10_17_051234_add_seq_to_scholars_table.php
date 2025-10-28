<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// In the new migration file...
public function up(): void
{
    Schema::table('scholars', function (Blueprint $table) {
        $table->integer('seq')->unique()->nullable()->after('id');
    });
}

public function down(): void
{
    Schema::table('scholars', function (Blueprint $table) {
        $table->dropColumn('seq');
    });
}
};
