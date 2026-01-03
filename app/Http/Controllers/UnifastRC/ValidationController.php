<?php

namespace App\Http\Controllers\UnifastRc;

use App\Http\Controllers\Controller;
use App\Models\ScholarEnrollment;
use App\Models\BillingRecord;
use Illuminate\Http\Request;
use App\Models\AcademicRecord;
use Inertia\Inertia;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
// Check if class exists before importing to avoid crashes
if (class_exists('Smalot\PdfParser\Parser')) {
    // use Smalot\PdfParser\Parser; // Optional: Keep dynamic usage
}

class ValidationController extends Controller
{
    public function index(Request $request, $program = 'TDP')
    {
        $status = $request->input('status', 'pending');
        $search = $request->input('search');
        
        $ayFilter = $request->input('academic_year');
        $batchFilter = $request->input('batch');
        $courseFilter = $request->input('course');

        $query = ScholarEnrollment::with([
            'scholar', 
            'program', 
            'hei',
            'academicRecords' => function($q) {
                $q->latest()->take(1)->with(['billingRecord', 'semester', 'academicYear', 'course']);
            }
        ]);

        // ✅ FIX: Filter dynamically based on the route (TES or TDP)
        $query->whereHas('program', function($q) use ($program) {
            $q->where('program_name', 'like', "%{$program}%");
        });

        // Search Logic
        $query->when($search, function ($q, $search) {
            $q->whereHas('scholar', function ($sub) use ($search) {
                $sub->where('family_name', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%");
            });
        });

        // Filters
        if ($ayFilter) $query->whereHas('academicRecords.academicYear', fn($q) => $q->where('id', $ayFilter));
        if ($batchFilter) $query->whereHas('academicRecords', fn($q) => $q->where('batch_no', $batchFilter));
        if ($courseFilter) $query->whereHas('academicRecords.course', fn($q) => $q->where('id', $courseFilter));

        // Status
        if ($status === 'validated') {
            $query->whereHas('academicRecords.billingRecord', fn($q) => $q->where('status', 'Validated'));
        } else {
            $query->whereDoesntHave('academicRecords.billingRecord', fn($q) => $q->where('status', 'Validated'));
        }

        $scholars = $query->paginate(10)->withQueryString();

        $scholars->getCollection()->transform(function ($enrollment) {
            $latest = $enrollment->academicRecords->first();
            return [
                'id' => $enrollment->id,
                'award_number' => $enrollment->award_number,
                'scholar' => $enrollment->scholar,
                'program' => $enrollment->program,
                'hei' => $enrollment->hei,
                'payment_status' => $latest?->billingRecord?->status ?? 'Pending',
            ];
        });

        // ✅ FETCH BATCHES FOR THIS SPECIFIC PROGRAM
        $batches = AcademicRecord::whereHas('enrollment.program', function($q) use ($program) {
                $q->where('program_name', 'like', "%{$program}%");
            })
            ->whereNotNull('batch_no')->where('batch_no', '!=', '')
            ->distinct()->orderBy('batch_no', 'asc')
            ->pluck('batch_no')->toArray();

        // ✅ DYNAMIC VIEW RENDER
        // Renders 'Tes/Partials/Validation' OR 'Tdp/Partials/Validation'
        $view = ($program === 'TES') ? 'Tes/Partials/Validation' : 'Tdp/Partials/Validation';

        return Inertia::render($view, [
            'scholars' => $scholars,
            'filters' => $request->all(),
            'academicYears' => AcademicYear::select('id', 'name')->orderBy('name', 'desc')->get(),
            'batches' => $batches, 
            'courses' => Course::select('id', 'course_name')->orderBy('course_name')->limit(100)->get(),
            'program' => $program // Pass program info to frontend
        ]);
    }
public function generateNoa(ScholarEnrollment $enrollment)
    {
        // 1. Security & Data Loading
        $enrollment->load(['program', 'scholar.address', 'academicRecords' => function($q) {
            $q->latest()->with(['semester', 'academicYear', 'billingRecord']);
        }]);

        if ($enrollment->program->program_name !== 'TDP' && $enrollment->program->code !== 'TDP') {
            return back()->with('error', 'NOA generation is only available for TDP scholars.');
        }

        $latestRecord = $enrollment->academicRecords->first();
        
        // Strict Check: Only Validated
        if (!$latestRecord || $latestRecord->billingRecord?->status !== 'Validated') {
            return back()->with('error', 'Cannot generate NOA. This scholar is not yet validated.');
        }

        // 2. Prepare Data for the "Loop" (Even for single, we use array to reuse the blade)
        $data = [
            [
                'scholar' => $enrollment->scholar,
                'enrollment' => $enrollment,
                'record' => $latestRecord
            ]
        ];

        $pdf = Pdf::loadView('pdfs.tdp-noa', ['scholars_data' => $data])
                  ->setPaper('a4', 'portrait');

        $filename = "NOA_{$enrollment->scholar->family_name}_{$enrollment->award_number}.pdf";
        
        return $pdf->download($filename);
    }

 public function generateBatchNoa(Request $request)
    {
        $request->validate([
            'batch_no' => 'required|string',
            'academic_year' => 'nullable|string',
        ]);

        // 1. Query Validated Scholars (Same as before)
        $query = AcademicRecord::with([
            'enrollment.scholar.address',
            'enrollment.program',
            'billingRecord',
            'academicYear',
            'semester'
        ])
        ->where('batch_no', $request->input('batch_no'))
        ->whereHas('enrollment.program', function($q) {
            $q->where('program_name', 'like', '%TDP%');
        })
        ->whereHas('billingRecord', function($q) {
            $q->where('status', 'Validated');
        })
        ->when($request->input('academic_year'), function ($q, $ay) {
            $q->whereHas('academicYear', fn($sub) => $sub->where('id', $ay));
        });

        $records = $query->get();

        if ($records->isEmpty()) {
            // Return JSON error for frontend to handle gracefully
            return response()->json(['error' => 'No validated records found for this batch selection.'], 404);
        }

        // 2. Prepare Data
        $scholarsData = $records->map(function ($record) {
            return [
                'scholar' => $record->enrollment->scholar,
                'enrollment' => $record->enrollment,
                'record' => $record
            ];
        });

        // 3. Generate PDF
        $pdf = Pdf::loadView('pdfs.tdp-noa', ['scholars_data' => $scholarsData])
                  ->setPaper('a4', 'portrait');

        // ✅ FIX: Use download() instead of stream()
        return $pdf->download("Batch_{$request->input('batch_no')}_NOAs.pdf");
    }
    public function getChecklist(ScholarEnrollment $enrollment)
    {
        $enrollment->load(['program.requirements', 'attachments', 'scholar', 'hei', 'academicRecords.semester', 'academicRecords.academicYear']);
        
        // 1. Prepare Student Info
        $latestRecord = $enrollment->academicRecords->first();
        $studentInfo = [
            'name' => $enrollment->scholar->family_name . ', ' . $enrollment->scholar->given_name,
            'award_number' => $enrollment->award_number,
            'school' => $enrollment->hei->hei_name ?? 'N/A',
            'semester' => $latestRecord->semester->name ?? 'N/A',
            'academic_year' => $latestRecord->academicYear->name ?? 'N/A',
        ];

        // 2. Prepare Checklist
        $checklist = $enrollment->program->requirements->map(function ($req) use ($enrollment) {
            $file = $enrollment->attachments->firstWhere('requirement_id', $req->id);
            return [
                'id' => $req->id,
                'name' => $req->name,
                'code' => $req->code,
                'is_required' => (bool) $req->pivot->is_required,
                'status' => $file ? 'Submitted' : 'Missing',
                'file_url' => $file ? asset('storage/' . $file->filepath) : null,
                'file_name' => $file ? $file->original_name : null,
            ];
        });

        // 3. Check Completion
        $requiredIds = $checklist->filter(fn($i) => $i['is_required'])->pluck('id');
        $submittedIds = $checklist->where('status', 'Submitted')->pluck('id');
        $isComplete = $requiredIds->diff($submittedIds)->isEmpty() && $requiredIds->isNotEmpty();

        return response()->json([
            'student' => $studentInfo, 
            'checklist' => $checklist,
            'is_complete' => $isComplete
        ]);
    }

    public function uploadRequirement(Request $request, ScholarEnrollment $enrollment)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,png|max:10240',
            'requirement_id' => 'required|exists:requirements,id',
            'requirement_code' => 'required|string',
        ]);

        $file = $request->file('file');
        $docType = $request->input('requirement_code');
        
        $record = $enrollment->academicRecords()
                    ->with(['academicYear', 'semester'])
                    ->latest()
                    ->first();

        // Perform OCR Analysis
        $ocrResult = $this->analyzeDocument(
            $file, 
            $docType, 
            $enrollment->scholar, 
            $record 
        );

        $path = $file->store('scholar_documents/' . $enrollment->id, 'public');

        // Remove old file
        $existing = $enrollment->attachments()->where('requirement_id', $request->requirement_id)->first();
        if ($existing) {
            Storage::disk('public')->delete($existing->filepath);
            $existing->delete();
        }

        $enrollment->attachments()->create([
            'user_id' => Auth::id(),
            'filepath' => $path,
            'filename' => $file->hashName(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'requirement_id' => $request->requirement_id,
            'disk' => 'public',
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'ocr_status' => $ocrResult['status'],
            'ocr_message' => $ocrResult['message']
        ]);
    }

    public function validateScholar(ScholarEnrollment $enrollment)
    {
        $enrollment->load(['program.requirements', 'attachments']);
        
        // Identify Required IDs
        $requiredIds = $enrollment->program->requirements
            ->filter(fn($req) => (bool) $req->pivot->is_required)
            ->pluck('id');

        if ($requiredIds->isEmpty()) {
            return back()->with('error', 'Configuration Error: No requirements defined for this program.');
        }

        // Identify Uploaded IDs
        $uploadedIds = $enrollment->attachments->pluck('requirement_id');

        // Calculate Missing
        $missing = $requiredIds->diff($uploadedIds);

        // BLOCK IF MISSING
        if ($missing->isNotEmpty()) {
            $missingNames = $enrollment->program->requirements
                ->whereIn('id', $missing)
                ->pluck('name')
                ->join(', ');

            return back()->with('error', "Cannot validate. Missing documents: {$missingNames}");
        }

        $record = $enrollment->academicRecords()->latest()->first();

        if (!$record) {
            return back()->with('error', 'Cannot validate: No Academic Record found.');
        }

        BillingRecord::updateOrCreate(
            ['academic_record_id' => $record->id],
            [
                'status' => 'Validated',
                'validated_by_user_id' => Auth::id(),
            ]
        );

        return back()->with('success', 'Scholar successfully validated!');
    }

    private function analyzeDocument($file, $docType, $scholar, $record)
    {
        $mime = $file->getMimeType();
        
        if ($mime !== 'application/pdf') {
            return ['status' => 'info', 'message' => 'Image uploaded. Manual check required.'];
        }

        if (!class_exists('Smalot\PdfParser\Parser')) {
            return ['status' => 'warning', 'message' => 'OCR Parser not installed. Manual check required.'];
        }

        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($file->getPathname());
            $text = strtolower($pdf->getText()); 
        } catch (\Exception $e) {
            return ['status' => 'warning', 'message' => 'Could not read PDF. Manual check required.'];
        }

        $warnings = [];

        // 1. Check Name
        $lastName = strtolower($scholar->family_name);
        if (!Str::contains($text, $lastName)) {
            $warnings[] = "Surname '{$scholar->family_name}' not found.";
        }

        // 2. Check Academic Year & Semester
        if ($record) {
            if ($record->academicYear) {
                $ay = $record->academicYear->name; 
                $parts = explode('-', $ay);
                $yearPart = $parts[0] ?? $ay;
                
                if (!Str::contains($text, $yearPart)) {
                    $warnings[] = "Year '{$yearPart}' not found.";
                }
            }

            if ($record->semester) {
                $sem = strtolower($record->semester->name); 
                $semKeyword = explode(' ', $sem)[0] ?? 'sem';
                
                if (!Str::contains($text, $semKeyword)) {
                    $warnings[] = "Semester '{$sem}' not found.";
                }
            }
        }

        // 3. Check Signature / Verification Keywords
        $sigKeywords = ['signed', 'signature', 'approved', 'certified', 'registrar', 'verified'];
        if (!Str::contains($text, $sigKeywords)) {
            $warnings[] = "No signature/certification keywords found.";
        }

        // 4. Check Document Specific Keywords
        $docKeywords = [
            'COE' => ['enrollment', 'enrolled', 'registrar', 'certificate'],
            'ROG' => ['grades', 'rating', 'unit', 'subject'],
            'ID'  => ['student', 'id number', 'signature'],
        ];

        $targetKeywords = $docKeywords[$docType] ?? [];
        $keywordMatch = false;
        
        foreach ($targetKeywords as $word) {
            if (Str::contains($text, $word)) {
                $keywordMatch = true;
                break;
            }
        }
        
        if (!empty($targetKeywords) && !$keywordMatch) {
            $warnings[] = "Document type keywords missing.";
        }

        // FINAL VERDICT
        if (count($warnings) > 0) {
            return [
                'status' => 'warning', 
                'message' => "Issues: " . implode(" ", $warnings)
            ];
        }

        return [
            'status' => 'verified', 
            'message' => "✅ Verified! Matches Name, SY, Sem, & Signature."
        ];
    }
}