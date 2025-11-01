<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Budget Request Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f2f2f2; font-size: 11px; }
        .amount { text-align: right; }
        .status { text-transform: capitalize; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Budget Request Report</h1>
        <p>Generated on: {{ now()->format('F d, Y') }}</p>
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
            </tr>
        </thead>
        <tbody>
            @forelse($requests as $request)
                <tr>
                    <td>{{ $request->id }}</td>
                    <td>{{ $request->user->name }}</td>
                    <td>{{ $request->title }}</td>
                    <td>{{ $request->request_type }}</td>
                    <td class="amount">{{ number_format($request->amount, 2) }}</td>
                    <td class="status">{{ str_replace('_', ' ', $request->status) }}</td>
                    <td>{{ $request->created_at ? $request->created_at->format('Y-m-d') : 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">No data available for the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>