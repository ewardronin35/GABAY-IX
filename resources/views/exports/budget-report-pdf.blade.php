<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Budget Request Report</title>
    <style>
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            font-size: 10px; 
            color: #333;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            color: #000;
        }
        .header p { 
            margin: 0; 
            font-size: 12px; 
            color: #555;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            border: 1px solid #ccc; 
            padding: 6px; 
            text-align: left; 
            vertical-align: top;
        }
        th { 
            background-color: #f2f2f2; 
            font-size: 11px; 
            font-weight: bold;
            color: #000;
        }
        .amount { 
            text-align: right; 
            font-family: 'Courier New', Courier, monospace;
        }
        .status { 
            text-transform: capitalize; 
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            padding: 20px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Budget Request Report</h1>
        <p>Generated on: {{ now()->format('F d, Y h:i A') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Submitted By</th>
                <th>Title</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted On</th>
                <th>Budget Approved</th>
                <th>Accounting Approved</th>
                <th>Cashier Paid</th>
            </tr>
        </thead>
        <tbody>
            @forelse($requests as $request)
                <tr>
                    <td>{{ $request->id }}</td>
                    <td>{{ $request->user->name ?? 'N/A' }}</td>
                    <td>{{ $request->title }}</td>
                    <td>{{ $request->request_type }}</td>
                    <td class="amount">₱{{ number_format($request->amount, 2) }}</td>
                    <td class="status">{{ str_replace('_', ' ', $request->status) }}</td>
                    <td>{{ $request->created_at ? $request->created_at->format('Y-m-d') : 'N/A' }}</td>
                    <td>{{ $request->budget_approved_at ? $request->budget_approved_at->format('Y-m-d') : 'N/A' }}</td>
                    <td>{{ $request->accounting_approved_at ? $request->accounting_approved_at->format('Y-m-d') : 'N/A' }}</td>
                    <td>{{ $request->cashier_paid_at ? $request->cashier_paid_at->format('Y-m-d') : 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="no-data">
                        No data available for the selected filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>