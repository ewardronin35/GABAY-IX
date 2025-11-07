<?php
// database/migrations/..._update_scholars_table_for_consolidation.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scholars', function (Blueprint $table) {
            // From estatskolars
            if (!Schema::hasColumn('scholars', 'lrn')) {
                $table->string('lrn')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('scholars', 'disability')) {
                $table->string('disability')->nullable()->after('sex');
            }

            // From tes_scholars
            if (!Schema::hasColumn('scholars', 'pwd_classification')) {
                $table->string('pwd_classification')->nullable()->after('disability');
            }
        });
    }

    public function down(): void
    {
        Schema::table('scholars', function (Blueprint $table) {
            if (Schema::hasColumn('scholars', 'lrn')) {
                $table->dropColumn('lrn');
            }
            if (Schema::hasColumn('scholars', 'disability')) {
                $table->dropColumn('disability');
            }
            if (Schema::hasColumn('scholars', 'pwd_classification')) {
                $table->dropColumn('pwd_classification');
            }
        });
    }
};