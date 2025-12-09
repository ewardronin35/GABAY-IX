<?php

namespace App\Imports;

use App\Models\AcademicRecord;
use App\Models\BillingRecord;
use App\Models\User;
use App\Models\Program; // Import Program
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;

class TesFinancialImport implements OnEachRow, WithHeadingRow, SkipsEmptyRows
{
    private $programId;
    private $allowedProgramIds = [];

    public function __construct($programId)
    {
        $this->programId = $programId;

        // ✅ FIX: Only check program_name
        $this->allowedProgramIds = Program::where('program_name', 'like', '%TES%')
            ->orWhere('program_name', 'like', '%TDP%')
            ->pluck('id')
            ->toArray();
    }

    public function headingRow(): int
    {
        return 1; 
    }

    public function onRow(Row $row)
    {
        $data = $row->toArray();
        $seq = isset($data['seq']) ? trim((string)$data['seq']) : null;
        
        if (!$seq) return; 

        // 1. FIND THE RECORD (Created by Sheet 1)
        // We look for the SEQ, allowing ANY valid program (TES or TDP)
        $record = AcademicRecord::where('seq', $seq)
            ->whereHas('enrollment', function($q) {
                $q->whereIn('program_id', $this->allowedProgramIds);
            })
            ->first();

        if ($record) {
            $billingData = [];

            // Validator User
            if (!empty($data['validated_by'])) {
                $user = User::where('name', 'like', '%' . $data['validated_by'] . '%')->first();
                if ($user) $billingData['validated_by_user_id'] = $user->id;
            }

            // Map Dates
            $datesToMap = [
                'date_fund_request' => 'date_of_fund_request',
                'date_sub_aro'      => 'date_of_sub_aro',
                'date_nta'          => 'date_of_nta',
                'date_disbursed_hei'=> 'date_disbursed_to_heis',
                'date_disbursed_grantee' => 'date_disbursed_to_grantees'
            ];

            foreach ($datesToMap as $dbCol => $excelCol) {
                if (!empty($data[$excelCol])) {
                    $billingData[$dbCol] = $this->transformDate($data[$excelCol]);
                }
            }

            // Update Billing
            if (!empty($billingData) || !empty($data['billing_ammount'])) {
                BillingRecord::updateOrCreate(
                    ['academic_record_id' => $record->id],
                    array_merge($billingData, [
                        'billing_amount' => $data['billing_ammount'] ?? null,
                        'status' => $data['status'] ?? 'Processed',
                        'remarks' => $data['remarks'] ?? null,
                    ])
                );
            }
        }
    }

    private function transformDate($value)
    {
        if (!$value || $value == '-') return null;
        try {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
        } catch (\Exception $e) {
            return null;
        }
    }
}