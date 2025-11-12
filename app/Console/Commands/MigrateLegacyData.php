<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Scholar;
use App\Models\Program;
use App\Models\ScholarEnrollment;
use App\Models\AcademicRecord;
use Exception; // Added for throwing exception

class MigrateLegacyData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:migrate-legacy-data';

    /**
     * The console command description.
     */
    protected $description = 'Migrate all old scholar data into the new normalized tables.';

    // This will hold our Program IDs (e.g., 'TES' => 1)
    private $programMap;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting legacy data migration...');
        $this->warn('This process is NOT reversible. Make sure you have a database backup!');
        if (!$this->confirm('Do you wish to continue?')) {
            $this->error('Migration cancelled.');
            return 1;
        }

        // --- PREPARATION ---
        $this->programMap = Program::pluck('id', 'program_name');
        
        // Check for all required programs
        // Note: Your old 'estatskolars' table will map to 'E-Statskolar' program
        try {
            $this->checkProgramMap('TES');
            $this->checkProgramMap('TDP');
            $this->checkProgramMap('Stufap');
            $this->checkProgramMap('E-Statskolar');
            $this->checkProgramMap('CSMP');
            // $this->checkProgramMap('UniFast'); // Uncomment if you have this
        } catch (Exception $e) {
            $this->error($e->getMessage());
            return 1; // Stop execution
        }

        // --- MIGRATION ---
        DB::transaction(function () {
            $this->migrateTesScholars();
            $this->migrateTdpScholars();
            $this->migrateStufapScholars();
            $this->migrateEstatskolars();
            $this->migrateCsmpScholars();
            // $this->migrateLegacyAcademicYears(); // Uncomment to run this
        });

        $this->info('=============================================');
        $this->info('✅ Legacy Data Migration Complete!');
        $this->info('=============================================');
        return 0;
    }
    
    /**
     * --- HELPER ---
     * Converts "M", "F", "Male", "Female", etc., to 'M', 'F', or null.
     */
    private function mapSex($value)
    {
        if (empty($value)) return null;
        // Get the first letter and make it uppercase
        $val = strtoupper(trim($value))[0];
        
        if ($val === 'M') return 'M'; // FIX: Return 'M' string
        if ($val === 'F') return 'F'; // FIX: Return 'F' string
        
        return null; // Return null for "S" or any other value
    }

    /**
     * Helper to find or create the central Scholar (Person) record.
     */
    private function findOrCreateScholar($old, $uniqueKey = 'lrn')
    {
        // --- NEW: Handle all known name columns and TRIM them ---
        $lastName = trim(isset($old->last_name) ? $old->last_name : (isset($old->family_name) ? $old->family_name : null));
        $firstName = trim(isset($old->first_name) ? $old->first_name : (isset($old->given_name) ? $old->given_name : null));
        $middleName = trim(isset($old->middle_name) ? $old->middle_name : (isset($old->middlename) ? $old->middlename : null));
        
        // --- NEW: Handle single applicant_name column ---
        if (empty($firstName) && empty($lastName) && !empty($old->applicant_name)) {
            $parts = explode(' ', trim($old->applicant_name));
            $lastName = trim(array_pop($parts)); // Assumes last word is last name
            $firstName = trim(implode(' ', $parts));
        }

        $uniqueValue = isset($old->{$uniqueKey}) ? $old->{$uniqueKey} : null;

        $scholar = null;
        if (!empty($uniqueValue)) {
            $scholar = Scholar::where($uniqueKey, $uniqueValue)->first();
        }

        if (!$scholar && !empty($firstName) && !empty($lastName) && !empty($old->birthday)) {
            $scholar = Scholar::where('first_name', $firstName)
                ->where('last_name', $lastName)
                ->where('birthday', $old->birthday)
                ->first();
        }

        if (!$scholar) {
            // Don't create scholars with no name
            if (empty($firstName) || empty($lastName)) {
                $email = isset($old->email) ? $old->email : 'N/A';
                $lrn = isset($old->lrn) ? $old->lrn : 'N/A';
                $this->warn("Skipping record, cannot determine name. Email: {$email}, LRN: {$lrn}");
                return null;
            }

            $scholar = Scholar::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'middle_name' => $middleName,
                'birthday' => isset($old->birthday) ? $old->birthday : null,
                'sex' => $this->mapSex(isset($old->sex) ? $old->sex : null),
                'contact_number' => isset($old->contact_number) ? $old->contact_number : null,
                'email' => isset($old->email) ? $old->email : null,
                'lrn' => isset($old->lrn) ? $old->lrn : null,
                'disability' => isset($old->disability) ? $old->disability : null,
                'pwd_classification' => isset($old->pwd_classification) ? $old->pwd_classification : null,
            ]);
            $this->line(" -> Created new Scholar: {$scholar->first_name} {$scholar->last_name}");
        } else {
            // Update found scholar with any missing info
            $scholar->lrn = isset($scholar->lrn) ? $scholar->lrn : (isset($old->lrn) ? $old->lrn : null);
            $scholar->sex = isset($scholar->sex) ? $scholar->sex : $this->mapSex(isset($old->sex) ? $old->sex : null);
            $scholar->disability = isset($scholar->disability) ? $scholar->disability : (isset($old->disability) ? $old->disability : null);
            $scholar->pwd_classification = isset($scholar->pwd_classification) ? $scholar->pwd_classification : (isset($old->pwd_classification) ? $old->pwd_classification : null);
            $scholar->contact_number = isset($scholar->contact_number) ? $scholar->contact_number : (isset($old->contact_number) ? $old->contact_number : null);
            $scholar->email = isset($scholar->email) ? $scholar->email : (isset($old->email) ? $old->email : null);
            $scholar->save();
        }
        return $scholar;
    }

    /**
     * Helper to create the Enrollment (Role) record.
     */
    private function createEnrollment($scholar, $programId, $old)
    {
        if (!$scholar) {
            return null; // Don't create enrollment if scholar creation failed
        }
        
        $award = isset($old->award_no) ? $old->award_no : (isset($old->tes_award_no) ? $old->tes_award_no : (isset($old->award_number) ? $old->award_number : null));
        $ay_applied = isset($old->academic_year_applied) ? $old->academic_year_applied : (isset($old->academic_year) ? $old->academic_year : null);
        
        return ScholarEnrollment::firstOrCreate(
            [
                'scholar_id' => $scholar->id,
                'program_id' => $programId,
            ],
            [
                'hei_id' => isset($old->hei_id) ? $old->hei_id : null,
                'award_number' => $award,
                'academic_year_applied' => $ay_applied,
                'status' => isset($old->status) ? $old->status : 'active',
            ]
        );
    }

    // --- MIGRATION LOGIC FOR EACH PROGRAM (Now safer) ---

    private function migrateTesScholars()
    {
        $this->info('Migrating TES Scholars...');
        if (!isset($this->programMap['TES'])) { $this->error('TES program not found. Skipping.'); return; }
        $programId = $this->programMap['TES'];

        foreach (DB::connection('gabay_ix_old_backup')->table('tes_scholars')->cursor() as $old) {
            $scholar = $this->findOrCreateScholar($old, 'email');
            $enrollment = $this->createEnrollment($scholar, $programId, $old);
            
            if (!$enrollment) continue;

            foreach (DB::connection('gabay_ix_old_backup')->table('tes_academic_records')->where('tes_scholar_id', $old->id)->cursor() as $record) {
                AcademicRecord::create([
                    'scholar_enrollment_id' => $enrollment->id,
                    'hei_id' => $record->hei_id,
                    'course_id' => $record->course_id,
                    'academic_year' => isset($record->academic_year) ? $record->academic_year : 'UNKNOWN',
                    'semester' => isset($record->semester) ? $record->semester : 'UNKNOWN',
                    'year_level' => $record->year_level,
                    'total_units_enrolled' => $record->total_units_enrolled,
                    'grant_amount' => $record->grant_amount,
                    'validation_status' => $record->validation_status,
                    'payment_status' => $record->payment_status,
                    'remarks' => $record->remarks,
                    'app_no' => $record->app_no,
                    'seq' => $record->seq,
                    'batch_no' => $record->batch_no,
                    'endorsed_by' => $record->endorsed_by,
                ]);
            }
        }
        $this->info('TES Scholars migration complete.');
    }

    private function migrateTdpScholars()
    {
        $this->info('Migrating TDP Scholars...');
        if (!isset($this->programMap['TDP'])) { $this->error('TDP program not found. Skipping.'); return; }
        $programId = $this->programMap['TDP'];

        foreach (DB::connection('gabay_ix_old_backup')->table('tdp_scholars')->cursor() as $old) {
            $scholar = $this->findOrCreateScholar($old, 'email');
            $enrollment = $this->createEnrollment($scholar, $programId, $old);

            if (!$enrollment) continue; 

            foreach (DB::connection('gabay_ix_old_backup')->table('tdp_academic_records')->where('tdp_scholar_id', $old->id)->cursor() as $record) {
                AcademicRecord::create([
                    'scholar_enrollment_id' => $enrollment->id,
                    'hei_id' => isset($record->hei_id) ? $record->hei_id : null,
                    'course_id' => isset($record->course_id) ? $record->course_id : null,
                    'academic_year' => isset($record->academic_year) ? $record->academic_year : 'UNKNOWN',
                    'semester' => isset($record->semester) ? $record->semester : 'UNKNOWN',
                    'year_level' => isset($record->year_level) ? $record->year_level : null,
                    'total_units_enrolled' => isset($record->total_units_enrolled) ? $record->total_units_enrolled : null,
                    'grant_amount' => isset($record->grant_amount) ? $record->grant_amount : null,
                    'validation_status' => isset($record->validation_status) ? $record->validation_status : null,
                    'payment_status' => isset($record->payment_status) ? $record->payment_status : null,
                    'remarks' => isset($record->remarks) ? $record->remarks : null,
                    'gwa' => isset($record->gwa) ? $record->gwa : null,
                ]);
            }
        }
        $this->info('TDP Scholars migration complete.'); // FIX: $this.info to $this->info
    }

    private function migrateStufapScholars()
    {
        $this->info('Migrating Stufap Scholars...');
        if (!isset($this->programMap['Stufap'])) { $this->error('Stufap program not found. Skipping.'); return; }
        $programId = $this->programMap['Stufap'];

        foreach (DB::connection('gabay_ix_old_backup')->table('stufap_scholars')->cursor() as $old) {
            $scholar = $this->findOrCreateScholar($old, 'email');
            $enrollment = $this->createEnrollment($scholar, $programId, $old);
            
            if (!$enrollment) continue; 

            foreach (DB::connection('gabay_ix_old_backup')->table('stufap_academic_records')->where('stufap_scholar_id', $old->id)->cursor() as $record) {
                AcademicRecord::create([
                    'scholar_enrollment_id' => $enrollment->id,
                    'hei_id' => isset($record->hei_id) ? $record->hei_id : null,
                    'course_id' => isset($record->course_id) ? $record->course_id : null,
                    'academic_year' => isset($record->academic_year) ? $record->academic_year : 'UNKNOWN',
                    'semester' => isset($record->semester) ? $record->semester : 'UNKNOWN',
                    'year_level' => isset($record->year_level) ? $record->year_level : null,
                    'total_units_enrolled' => isset($record->total_units_enrolled) ? $record->total_units_enrolled : null,
                    'grant_amount' => isset($record->grant_amount) ? $record->grant_amount : null,
                    'validation_status' => isset($record->validation_status) ? $record->validation_status : null,
                    'payment_status' => isset($record->payment_status) ? $record->payment_status : null,
                    'remarks' => isset($record->remarks) ? $record->remarks : null,
                    'gwa' => isset($record->gwa) ? $record->gwa : null,
                ]);
            }
        }
        $this->info('Stufap Scholars migration complete.'); // FIX: $this.info to $this->info
    }

    private function migrateEstatskolars()
    {
        $this->info('Migrating E-Statskolars...');
        if (!isset($this->programMap['E-Statskolar'])) { $this->error('E-Statskolar program not found. Skipping.'); return; }
        $programId = $this->programMap['E-Statskolar'];

        foreach (DB::connection('gabay_ix_old_backup')->table('estatskolars')->cursor() as $old) {
            $scholar = $this->findOrCreateScholar($old, 'lrn');
            $enrollment = $this->createEnrollment($scholar, $programId, $old);

            if (!$enrollment) continue; 

            foreach (DB::connection('gabay_ix_old_backup')->table('estatskolar_monitorings')->where('estatskolar_id', $old->id)->cursor() as $record) {
                $ay = isset($record->academic_year) ? $record->academic_year : 'UNKNOWN';

                // Create FIRST SEMESTER record
                AcademicRecord::create([
                    'scholar_enrollment_id' => $enrollment->id,
                    'hei_id' => isset($old->hei_id) ? $old->hei_id : null,
                    'course_id' => isset($old->course_id) ? $old->course_id : null,
                    'academic_year' => $ay,
                    'semester' => '1', // Hard-coded
                   'year_level' => isset($record->year_level) ? $record->year_level : null,
                    'total_units_enrolled' => isset($record->first_sem_units) ? $record->first_sem_units : null,
                    'grant_amount' => isset($record->payment_first_sem) ? $record->payment_first_sem : null,
                    'gwa' => isset($record->first_sem_gwa) ? $record->first_sem_gwa : null,
                    'disbursement_date' => isset($record->first_sem_disbursement_date) ? $record->first_sem_disbursement_date : null,
                ]);

                // Create SECOND SEMESTER record (if data exists)
                if (!empty($record->second_sem_units) || !empty($record->payment_second_sem) || !empty($record->second_sem_gwa)) {
                    AcademicRecord::create([
                        'scholar_enrollment_id' => $enrollment->id,
                      'hei_id' => isset($old->hei_id) ? $old->hei_id : null,
                        'course_id' => isset($old->course_id) ? $old->course_id : null,
                        'academic_year' => $ay,
                        'semester' => '2', // Hard-coded
                        'year_level' => isset($record->year_level) ? $record->year_level : null,
                        'total_units_enrolled' => isset($record->second_sem_units) ? $record->second_sem_units : null,
                        'grant_amount' => isset($record->payment_second_sem) ? $record->payment_second_sem : null,
                        'gwa' => isset($record->second_sem_gwa) ? $record->second_sem_gwa : null,
                        'disbursement_date' => isset($record->second_sem_disbursement_date) ? $record->second_sem_disbursement_date : null,
                    ]);
                    
                }
            }
        }
        $this->info('E-Statskolars migration complete.'); // FIX: $this.info to $this->info
    }

    private function migrateCsmpScholars()
    {
        $this->info('Migrating CSMP Scholars...');
        if (!isset($this->programMap['CSMP'])) { $this->error('CSMP program not found. Skipping.'); return; }
        $programId = $this->programMap['CSMP'];

        foreach (DB::connection('gabay_ix_old_backup')->table('csmp_scholars')->cursor() as $old) {
            $scholar = $this->findOrCreateScholar($old, 'email');
            $this->createEnrollment($scholar, $programId, $old);
        }
        $this->info('CSMP Scholars migration complete.'); // FIX: $this.info to $this->info
    }
    
    private function migrateLegacyAcademicYears()
    {
        $this->info('Migrating legacy academic_years table...');
        
        foreach (DB::connection('gabay_ix_old_backup')->table('academic_years')->cursor() as $record) {
            $scholar = Scholar::find($record->scholar_id);
            if (!$scholar) {
                $this->warn("Skipping academic_year record {$record->id}, scholar not found.");
                continue;
            }
            
            $programName = isset($this->programMap['UniFast']) ? 'UniFast' : 'N/A';
            if (!isset($this->programMap[$programName])) {
                 $this->warn("Skipping academic_year record {$record->id}, default program '{$programName}' not found.");
                 continue;
            }
            $programId = $this->programMap[$programName];
            
            $enrollment = ScholarEnrollment::firstOrCreate(
                ['scholar_id' => $scholar->id, 'program_id' => $programId],
                ['award_number' => $record->award_year, 'status' => isset($record->status_type) ? $record->status_type : 'active']
            );
            
            $ay = isset($record->academic_year) ? $record->academic_year : 'UNKNOWN';

            // Create FIRST SEMESTER record
            if (!empty($record->payment_first_sem)) {
                AcademicRecord::firstOrCreate(
                    ['scholar_enrollment_id' => $enrollment->id, 'academic_year' => $ay, 'semester' => '1'],
                    [
                        'grant_amount' => $record->payment_first_sem,
                        'disbursement_date' => $record->first_sem_disbursement_date,
                        'validation_status' => $record->first_sem_status,
                    ]
                );
            }

            // Create SECOND SEMESTER record
            if (!empty($record->payment_second_sem)) {
                AcademicRecord::firstOrCreate(
                    ['scholar_enrollment_id' => $enrollment->id, 'academic_year' => $ay, 'semester' => '2'],
                    [
                        'grant_amount' => $record->payment_second_sem,
                        'disbursement_date' => $record->second_sem_disbursement_date,
                        'validation_status' => $record->second_sem_status,
                    ]
                );
            }
        }
        $this->info('Legacy academic_years migration complete.'); // FIX: $this.info to $this->info
    }

    /**
     * Helper to check that our Program Map is valid.
     */
    private function checkProgramMap($programName)
    {
        if (!isset($this->programMap[$programName])) {
            $this->error("Migration FAILED: Program '{$programName}' not found in your 'programs' table.");
            $this->error('Please add it and try again.');
            throw new \Exception("Missing program: {$programName}");
        }
    }
}