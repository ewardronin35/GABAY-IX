<!DOCTYPE html>
<html>
<head><title>StuFAPs Statistics Report</title><style>/* ... your CSS styles ... */</style></head>
<body>
    <header>
        <p>StuFAPs Statistics Report</p>
    </header>
    <h3>Scholars by Region</h3>
    <div class="chart-container"><img src="{{ $chartImage }}"></div>
    <table>
        <thead><tr><th>Region</th><th>Total Scholars</th></tr></thead>
        <tbody>
            @foreach($stats['scholarsPerRegion'] as $item)
                <tr><td>{{ $item['region'] }}</td><td>{{ $item['total'] }}</td></tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>