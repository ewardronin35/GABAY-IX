<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Estatskolar Statistics Report</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 5px 0; color: #555; }
        h2 { font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f7f7f7; font-weight: bold; }
        
        /* Basic grid for two columns */
        .container { width: 100%; }
        .column { width: 48%; margin-right: 2%; float: left; }
        .column:last-child { margin-right: 0; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Estatskolar Program</h1>
        <p>Statistical Report</p>
    </div>

    <div class="container clearfix">
        <div class="column">
            <h2>Scholars by Region</h2>
            <table>
                <thead>
                    <tr>
                        <th>Region</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($stats['by_region'] as $region => $count)
                        <tr>
                            <td>{{ $region }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2" style="text-align: center;">No data available.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="column">
            <h2>Scholars by Sex</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sex</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($stats['by_sex'] as $sex => $count)
                        <tr>
                            <td>{{ $sex === 'F' ? 'Female' : ($sex === 'M' ? 'Male' : 'Other') }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2" style="text-align: center;">No data available.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</body>
</html>