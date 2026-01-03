<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Change GWA to DECIMAL(8,2) to allow values like "94.50" or "100.00"
        DB::statement("ALTER TABLE scholar_enrollments MODIFY gwa DECIMAL(8, 2) NULL");
        
        // We do the same for academic_records to be safe
        DB::statement("ALTER TABLE academic_records MODIFY gwa DECIMAL(8, 2) NULL");
    }

    public function down()
    {
        // Revert (Optional)
        DB::statement("ALTER TABLE scholar_enrollments MODIFY gwa DECIMAL(5, 2) NULL");
        DB::statement("ALTER TABLE academic_records MODIFY gwa DECIMAL(5, 2) NULL");
    }
};