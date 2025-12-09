<?php

namespace App\Imports;

use App\Models\AcademicRecord;
use App\Models\BillingRecord;
use App\Models\User; // For validator lookup
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;
use App\Models\Program; // Import Program
class TdpFinancialImport implements OnEachRow, WithHeadingRow, SkipsEmptyRows
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
        return 2; // Skip "Academic Year" row, headers are on Row 2
    }

    public function onRow(Row $row)
    {
        $data = $row->toArray();
        
        $seq = isset($data['seq']) ? trim((string)$data['seq']) : null;
        
        if (!$seq) return;

        // Find the record created by Sheet 1
        $record = AcademicRecord::where('seq', $seq)
            ->whereHas('enrollment', function($q) {
                $q->where('program_id', $this->programId);
            })
            ->first();

        if ($record) {
            $updateData = [];

            if (!empty($data['validation_status'])) {
                $updateData['validation_status'] = $data['validation_status'];
            }
            if (!empty($data['payment_status'])) {
                $updateData['payment_status'] = $data['payment_status'];
            }
            if (!empty($data['amount_due'])) {
                $updateData['grant_amount'] = $data['amount_due'];
            }

            if (!empty($updateData)) {
                $record->update($updateData);
            }

            // Update Billing Info
            $billingData = [];
            if (!empty($data['amount_due'])) $billingData['billing_amount'] = $data['amount_due'];
            if (!empty($data['remarks'])) $billingData['status'] = $data['remarks'];

            // Validator Logic
            if (!empty($data['validated_by']) && $data['validated_by'] !== '-') {
                $user = User::where('name', 'like', '%' . $data['validated_by'] . '%')->first();
                if ($user) {
                    $billingData['validated_by_user_id'] = $user->id;
                }
            }

            // Map Financial Dates (Ensure none are null if data exists)
            $datesToMap = [
                'date_fund_request' => 'date_of_fund_request',
                'date_sub_aro' => 'date_of_sub_aro',
                'date_nta' => 'date_of_nta',
                'date_disbursed_hei' => 'date_disbursed_to_heis',
                'date_disbursed_grantee' => 'date_disbursed_to_grantees'
            ];

            foreach ($datesToMap as $dbCol => $excelCol) {
                if (!empty($data[$excelCol])) {
                    $billingData[$dbCol] = $this->transformDate($data[$excelCol]);
                }
            }

            if (!empty($billingData)) {
                BillingRecord::updateOrCreate(
                    ['academic_record_id' => $record->id],
                    $billingData
                );
            }
            
            Log::info("TDP Financial: Updated History for SEQ {$seq}");
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