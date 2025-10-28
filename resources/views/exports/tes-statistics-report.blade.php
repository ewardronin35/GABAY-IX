<!DOCTYPE html>
<html>
<head>
    <title>TES Statistics Report</title>
    <style>
        @page { margin: 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; }
        .header-table td { text-align: center; border: none; vertical-align: middle; }
        .header-table img { height: 65px; }
        .title { font-size: 18px; font-weight: bold; margin-top: 5px; }
        h3 { font-size: 14px; color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 5px; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        th, td { border: 1px solid #ccc; padding: 7px; text-align: left; }
        thead { background-color: #f0f4f8; }
        .chart-container { text-align: center; margin: 20px 0; page-break-inside: avoid; }
        .chart-container img { max-width: 90%; height: auto; border: 1px solid #eee; padding: 5px; }
        footer { position: fixed; bottom: -10px; left: 0; right: 0; height: 40px; font-size: 9px; text-align: center; }
        .page-number:before { content: "Page " counter(page); }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:15%;"><img src="{{ public_path('images/ched-logo.png') }}"></td>
            <td style="width:70%;"><p class="title">TES Statistics Report</p><p>Generated on: {{ date('F d, Y') }}</p></td>
            <td style="width:15%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}"></td>
        </tr>
    </table>

    <h3>Scholars by Province</h3>
    <div class="chart-container">
        <img src="{{ $regionChartImage }}" alt="Scholars per Province Chart">
    </div>
    <table>
        <thead><tr><th>Province</th><th>Total Scholars</th></tr></thead>
        <tbody>
            @foreach($stats['scholarsPerRegion'] as $item)
                <tr><td>{{ $item['province'] }}</td><td>{{ $item['total'] }}</td></tr>
            @endforeach
        </tbody>
    </table>

    <h3 style="margin-top: 30px;">Distribution by Sex</h3>
    <div class="chart-container">
        <img src="{{ $sexChartImage }}" alt="Distribution by Sex Chart">
    </div>
    <table>
        <thead><tr><th>Sex</th><th>Total Scholars</th></tr></thead>
        <tbody>
            @foreach($stats['scholarsBySex'] as $item)
                <tr><td>{{ $item['sex'] == 'M' ? 'Male' : 'Female' }}</td><td>{{ $item['total'] }}</td></tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>