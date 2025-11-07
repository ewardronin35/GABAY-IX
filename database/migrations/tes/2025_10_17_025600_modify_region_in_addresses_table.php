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
        Schema::table('addresses', function (Blueprint $table) {
            // Add a new column for region if it doesn't exist, and make it nullable
            if (!Schema::hasColumn('addresses', 'region')) {
                $table->string('region')->nullable()->after('congressional_district');
            } else {
                // Or, if it already exists, just change it to be nullable
                $table->string('region')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            // This will make it non-nullable again if you roll back
            $table->string('region')->nullable(false)->change();
        });
    }
};