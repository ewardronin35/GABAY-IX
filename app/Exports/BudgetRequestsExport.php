<?php

namespace App\Exports;

use App\Models\FinancialRequest;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class BudgetRequestsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $filters;

    // 1. Accept the filters from the controller
    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    // 2. Define the column headers
    public function headings(): array
    {
        return [
            'ID',
            'Submitted By',
            'Title',
            'Type',
            'Amount',
            'Status',
            'Submitted On',
            'Budget Approved',
            'Accounting Approved',
            'Cashier Paid',
        ];
    }

    // 3. This function maps each row of data
    public function map($request): array
    {
        return [
            $request->id,
            $request->user->name,
            $request->title,
            $request->request_type,
            $request->amount,
            // Format status to be human-readable (e.g., "Pending Budget")
            ucwords(str_replace('_', ' ', $request->status)),
            $request->created_at ? $request->created_at->format('Y-m-d H:i') : 'N/A',
            $request->budget_approved_at ? $request->budget_approved_at->format('Y-m-d H:i') : 'N/A',
            $request->accounting_approved_at ? $request->accounting_approved_at->format('Y-m-d H:i') : 'N/A',
            $request->cashier_paid_at ? $request->cashier_paid_at->format('Y-m-d H:i') : 'N/A',
        ];
    }

    // 4. This is the exact same query from your controller
    // This ensures the export matches what the user sees
    public function query()
    {
        $filters = $this->filters;

        $query = FinancialRequest::query()
            ->with('user:id,name') // Eager load user
            ->select(
                'id', 
                'user_id', 
                'title', 
                'request_type', 
                'amount', 
                'status', 
                'created_at', 
                'remarks',
                'budget_approved_at',
                'accounting_approved_at',
                'cashier_paid_at'
            );
            
        // Apply filtering logic
        $query->when($filters['type'] ?? null, function ($query, $type) {
            if ($type !== 'All') {
                $query->where('request_type', $type);
            }
        });
        
        $query->when($filters['status'] ?? null, function ($query, $status) {
            if ($status !== 'All') {
                $query->where('status', $status);
            }
        });

        // Apply sorting logic
        $query->when($filters['sort'] ?? 'created_at', function ($query, $sort) use ($filters) {
            $direction = $filters['direction'] ?? 'desc';
            if (in_array($sort, ['created_at', 'title', 'amount', 'status'])) {
                $query->orderBy($sort, $direction);
            }
        });

        // Return the query, NOT paginated
        return $query;
    }
}