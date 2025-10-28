<!DOCTYPE html>
<html>
<head>
    <title>Scholarship Statistics Report</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 25px; }
        .header img { height: 60px; }
        .header p { margin: 0; }
        .title { font-size: 18px; font-weight: bold; }
        h3 { font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        thead { background-color: #f2f2f2; }
        .chart-container { text-align: center; margin-top: 20px; }
        .chart-container img { max-width: 90%; height: auto; }
    </style>
</head>
<body>
    <header class="header">
        <img src="{{ public_path('images/ched-logo.png') }}" alt="CHED Logo">
        <p class="title">Scholarship Program Statistics</p>
        <p>Generated on: {{ date('F d, Y') }}</p>
    </header>

    <div class="content">
        <h3>Scholars by Region</h3>
        <table>
            <thead>
                <tr>
                    <th>Region</th>
                    <th>Total Scholars</th>
                </tr>
            </thead>
            <tbody>
                @foreach($stats['scholarsPerRegion'] as $region)
                    <tr>
                        <td>{{ $region['region'] }}</td>
                        <td>{{ $region['total'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <h3>Regional Distribution Chart</h3>
        <div class="chart-container">
            {{-- The Base64 image from the frontend will be embedded here --}}
            <img src="{{ $chartImage }}" alt="Scholars per Region Chart">
        </div>
    </div>
</body>
</html>