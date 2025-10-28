<!DOCTYPE html>
<html>
<head>
    <title>TDP Statistics Report</title>
    <style>
        body { font-family: sans-serif; margin: 30px; }
        h1 { font-size: 24px; text-align: center; margin-bottom: 30px; }
        h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Tulong Dunong Program (TDP) Statistics</h1>
    <p class="total">Total Scholars: {{ $stats['total_scholars'] }}</p>

    <h2>Scholars by Validation Status</h2>
    <table>
        <thead>
            <tr><th>Status</th><th>Count</th></tr>
        </thead>
        <tbody>
            @foreach($stats['by_status'] as $status)
            <tr><td>{{ $status->validation_status }}</td><td>{{ $status->count }}</td></tr>
            @endforeach
        </tbody>
    </table>

    <h2>Top 10 HEIs by Scholar Count</h2>
    <table>
        <thead>
            <tr><th>HEI Name</th><th>Count</th></tr>
        </thead>
        <tbody>
            @foreach($stats['by_hei'] as $hei)
            <tr><td>{{ $hei->hei_name }}</td><td>{{ $hei->count }}</td></tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>