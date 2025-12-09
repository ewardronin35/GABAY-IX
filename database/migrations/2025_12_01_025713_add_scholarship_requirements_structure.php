<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Requirements Table (Normalized Definition)
        // Stores "Certificate of Enrollment", "ID", etc. ONCE.
        if (!Schema::hasTable('requirements')) {
            Schema::create('requirements', function (Blueprint $table) {
                $table->id();
                $table->string('name')->index(); // Index for faster search
                $table->string('code', 20)->unique(); // e.g. 'COE', 'ID'
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Program Requirements (The Rules Engine)
        // Links Programs (TES/TDP) to Requirements. 
        if (!Schema::hasTable('program_requirements')) {
            Schema::create('program_requirements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
                $table->foreignId('requirement_id')->constrained('requirements')->onDelete('cascade');
                
                $table->boolean('is_required')->default(true);
                $table->timestamps();

                // Composite Index for Speed: 
                // faster queries when fetching checklist for a specific program
                $table->index(['program_id', 'requirement_id']); 
            });
        }

        // 3. Modify Existing Attachments Table
        // We add a Foreign Key to link a file to a requirement definition.
        Schema::table('attachments', function (Blueprint $table) {
            if (!Schema::hasColumn('attachments', 'requirement_id')) {
                $table->foreignId('requirement_id')
                      ->nullable() // Nullable because a Travel Claim attachment isn't a "Requirement"
                      ->after('attachable_id') 
                      ->constrained('requirements')
                      ->onDelete('set null'); // If requirement type is deleted, keep the file but remove the tag
            }
        });
    }

    public function down()
    {
        Schema::table('attachments', function (Blueprint $table) {
            if (Schema::hasColumn('attachments', 'requirement_id')) {
                $table->dropForeign(['requirement_id']);
                $table->dropColumn('requirement_id');
            }
        });
        Schema::dropIfExists('program_requirements');
        Schema::dropIfExists('requirements');
    }
};