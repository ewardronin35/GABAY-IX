<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // These two columns allow us to link files to ANY table (HEIs, Scholars, etc.)
            if (!Schema::hasColumn('attachments', 'reference_id')) {
                $table->unsignedBigInteger('reference_id')->after('user_id')->nullable();
                $table->string('reference_table')->after('reference_id')->nullable();
                
                // Optional: Index for faster searching
                $table->index(['reference_id', 'reference_table']);
            }
            
            // Ensure disk column exists for 'google' vs 'public'
            if (!Schema::hasColumn('attachments', 'disk')) {
                $table->string('disk')->default('public')->after('file_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropColumn(['reference_id', 'reference_table', 'disk']);
        });
    }
};