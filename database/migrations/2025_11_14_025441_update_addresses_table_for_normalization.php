<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            // 1. Rename 'brgy_street' to 'specific_address'
            $table->renameColumn('brgy_street', 'specific_address');

            // 2. Add all the new ID columns.
            // We make them nullable so they don't crash if a link is missing.
            $table->unsignedBigInteger('region_id')->nullable()->after('zip_code');
            $table->unsignedBigInteger('province_id')->nullable()->after('region_id');
            $table->unsignedBigInteger('city_id')->nullable()->after('province_id');
            $table->unsignedBigInteger('district_id')->nullable()->after('city_id');
            
            // This one is INT(11) to match your 'barangayID' column
            $table->integer('barangay_id')->unsigned()->nullable()->after('district_id'); 

            // 3. Add the Foreign Key constraints (the "links")
            // Note: We use onDelete('set null') so that deleting a province
            // doesn't accidentally delete the scholar's address.
            
            // This one fails because 'regions' table wasn't in your SQL. 
            // We'll create it now.
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('set null');
            
            $table->foreign('province_id')->references('id')->on('provinces')->onDelete('set null');
            $table->foreign('city_id')->references('id')->on('cities')->onDelete('set null');
            $table->foreign('district_id')->references('id')->on('districts')->onDelete('set null');
            
            // This one fails because of the mismatch we found earlier.
            // $table->foreign('barangay_id')->references('barangayID')->on('barangay')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['region_id']);
            $table->dropForeign(['province_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['district_id']);
            // $table->dropForeign(['barangay_id']);

            // Drop the columns
            $table->dropColumn([
                'region_id', 
                'province_id', 
                'city_id', 
                'district_id', 
                'barangay_id'
            ]);

            // Revert renaming
            $table->renameColumn('specific_address', 'brgy_street');
        });
    }
};