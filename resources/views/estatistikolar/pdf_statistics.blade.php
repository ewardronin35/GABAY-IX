<!DOCTYPE html>
<html>
<head>
    <title>Estatistikolar Statistics</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .header { margin-bottom: 30px; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #2563EB; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Estatistikolar Program Statistics</h2>
        <p>Generated: {{ date('F d, Y') }}</p>
    </div>

    <div class="section-title">Program Overview</div>
    <table>
        <tr>
            <th>Total Scholars</th>
            <td>{{ number_format($stats['total']) }}</td>
        </tr>
        <tr>
            <th>Active Scholars</th>
            <td>{{ number_format($stats['active']) }}</td>
        </tr>
        <tr>
            <th>Total Disbursed</th>
            <td>P {{ number_format($stats['amount'], 2) }}</td>
        </tr>
    </table>

    <div class="section-title">Scholarship Types</div>
    <table>
        <thead>
            <tr>
                <th>Type</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats['by_type'] as $type)
                <tr>
                    <td>{{ $type->scholarship_type ?? 'Unspecified' }}</td>
                    <td>{{ $type->count }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Financial History</div>
    <table>
        <thead>
            <tr>
                <th>Academic Year</th>
                <th>Amount Disbursed</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats['financials'] as $fin)
                <tr>
                    <td>{{ $fin->year }}</td>
                    <td>P {{ number_format($fin->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Special Equity Groups</div>
    <table>
        <thead>
            <tr>
                <th>Group</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats['special_groups'] as $key => $val)
                @if(is_array($val))
                    <tr>
                        <td>{{ $val['name'] }}</td>
                        <td>{{ $val['value'] }}</td>
                    </tr>
                @else
                    <tr>
                        <td>{{ $key }}</td>
                        <td>{{ $val }}</td>
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>
</body>
</html>