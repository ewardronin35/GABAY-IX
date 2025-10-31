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
        Schema::table('attachments', function (Blueprint $table) {
            // ✨ ADD THESE TWO LINES
            // We make user_id nullable just in case an attachment isn't tied to a user
            $table->foreignId('user_id')->nullable()->after('attachable_type')->constrained()->onDelete('set null');
            $table->string('disk')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // ✨ ADD THESE TWO LINES
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'disk']);
        });
    }
};