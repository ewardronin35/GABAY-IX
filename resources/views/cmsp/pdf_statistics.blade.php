<!DOCTYPE html>
<html>
<head>
    <title>CMSP Statistics</title>
    <style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 8px; }</style>
</head>
<body>
    <h2>CMSP Statistical Report</h2>
    <p>Total Scholars: {{ number_format($stats['total']) }}</p>
    <p>Total Investment: P{{ number_format($stats['amount'], 2) }}</p>
    
    <h3>Distribution by Type</h3>
    <table>
        <thead><tr><th>Type</th><th>Count</th></tr></thead>
        <tbody>
            @foreach($stats['by_type'] as $row)
            <tr><td>{{ $row->scholarship_type }}</td><td>{{ $row->count }}</td></tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>