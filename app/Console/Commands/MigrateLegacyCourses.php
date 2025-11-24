<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Course; // You must create this file: app/Models/Course.php
use App\Models\Major;  // You must create this file: app/Models/Major.php
use App\Models\CourseClassification; // Create app/Models/CourseClassification.php

class MigrateLegacyCourses extends Command
{
    protected $signature = 'migrate:legacy-courses';
    protected $description = 'Migrates data from the legacy_courses table to the new normalized tables.';

    // This map links keywords to the IDs from your classifications.sql
    // We preload this to avoid thousands of DB queries
    private $classificationMap = [];

    public function __construct()
    {
        parent::__construct();
        
        // Pre-load the classifications
        $this->classificationMap = [
            'BAC' => 1,  // For "BACHELOR", "BACCALAUREATE"
            'ASS' => 2,  // For "ASSOCIATE"
            'DIP' => 3,  // For "DIPLOMA", "CERTIFICATE"
            'MAS' => 4,  // For "MASTER", "MASTERAL"
            'DOC' => 5   // For "DOCTOR", "DOCTORATE"
        ];
    }

    public function handle()
    {
        $this->info('Starting legacy course migration...');

        // Get all data from your old table
        $legacyCourses = DB::table('legacy_courses')->get();
        $total = $legacyCourses->count();
        
        if ($total == 0) {
            $this->error('The `legacy_courses` table is empty. Please import your `courses.sql` data into it first.');
            return 1;
        }

        $this->info("Found {$total} legacy course/major records to process.");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($legacyCourses as $legacy) {
            $courseNameStr = trim(preg_replace('/\s+/', ' ', $legacy->course_name));
            $majorNameStr = $legacy->major ? trim(preg_replace('/\s+/', ' ', $legacy->major)) : null;

            $parsedCourseName = null;
            $parsedMajorName = null;

            // --- Transformation Logic ---

            // Pattern 3: "BACHELOR OF... MAJOR IN..."
            // This regex is safer than a simple split
            if (preg_match('/^(.*?) MAJOR IN (.*)$/i', $courseNameStr, $matches)) {
                $parsedCourseName = trim($matches[1]);
                $parsedMajorName = trim($matches[2]);
            }
            // Pattern 2: `course_name` and `major` are in separate columns
            else if (!empty($majorNameStr)) {
                $parsedCourseName = $courseNameStr;
                $parsedMajorName = $majorNameStr;
            }
            // Pattern 1: `course_name` is the full name, `major` is NULL
            else {
                $parsedCourseName = $courseNameStr;
                $parsedMajorName = null;
            }

            // --- Classification & Load Logic ---
            if ($parsedCourseName) {
                $classificationId = $this->getClassificationId($parsedCourseName);

                // 1. Find or Create the Course
                $newCourse = Course::firstOrCreate(
                    ['course_name' => $parsedCourseName],
                    ['classification_id' => $classificationId]
                );

                // 2. Find or Create the Major (if one exists)
                if ($parsedMajorName) {
                    $newMajor = Major::firstOrCreate(
                        ['major_name' => $parsedMajorName]
                    );

                    // 3. Link them in the pivot table
                    $newCourse->majors()->syncWithoutDetaching($newMajor->id);
                }
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nMigration complete!");
        $this->info("New Courses created: " . Course::count());
        $this->info("New Majors created: " . Major::count());
        $this->info("New Course-Major links: " . DB::table('course_major')->count());

        return 0;
    }

    /**
     * Helper function to determine classification ID from a course name string.
     */
    private function getClassificationId($courseName)
    {
        $upperCourseName = strtoupper($courseName);
        
        if (str_starts_with($upperCourseName, 'BACHELOR') || str_starts_with($upperCourseName, 'BACCALAUREATE')) {
            return $this->classificationMap['BAC'];
        }
        if (str_starts_with($upperCourseName, 'ASSOCIATE')) {
            return $this->classificationMap['ASS'];
        }
        if (str_starts_with($upperCourseName, 'DIPLOMA') || str_starts_with($upperCourseName, 'CERTIFICATE')) {
            return $this->classificationMap['DIP'];
        }
        if (str_starts_with($upperCourseName, 'MASTER') || str_starts_with($upperCourseName, 'MASTERAL')) {
            return $this->classificationMap['MAS'];
        }
        if (str_starts_with($upperCourseName, 'DOCTOR') || str_starts_with($upperCourseName, 'DOCTORATE')) {
            return $this->classificationMap['DOC'];
        }

        return null; // Default if no keyword matches
    }
}