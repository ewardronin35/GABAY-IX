<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // Make these nullable so they don't block the insert
            if (Schema::hasColumn('attachments', 'attachable_type')) {
                $table->string('attachable_type')->nullable()->change();
            }
            if (Schema::hasColumn('attachments', 'attachable_id')) {
                $table->unsignedBigInteger('attachable_id')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        // No down action needed for safety
    }
};