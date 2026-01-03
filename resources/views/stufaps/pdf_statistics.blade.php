<!DOCTYPE html>
<html>
<head>
    <title>Statistics Report</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .stat-box { border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
        .title { font-size: 14px; font-weight: bold; background: #eee; padding: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CHED StuFAPs Statistical Report</h2>
        <p>Date: {{ date('F d, Y') }}</p>
    </div>

    <div class="stat-box">
        <div class="title">Summary</div>
        <p><strong>Total Scholars:</strong> {{ number_format($stats['total']) }}</p>
    </div>

    <div class="stat-box">
        <div class="title">Distribution by Scholarship Type</div>
        <table>
            <thead><tr><th>Code</th><th>Count</th></tr></thead>
            <tbody>
                @foreach($stats['by_code'] as $row)
                <tr>
                    <td>{{ $row->scholarship_type ?? 'Unspecified' }}</td>
                    <td>{{ $row->count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="stat-box">
        <div class="title">Financial Disbursement History</div>
        <table>
            <thead><tr><th>Academic Year</th><th>Amount</th></tr></thead>
            <tbody>
                @foreach($stats['financials'] as $row)
                <tr>
                    <td>{{ $row->year }}</td>
                    <td>P{{ number_format($row->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>