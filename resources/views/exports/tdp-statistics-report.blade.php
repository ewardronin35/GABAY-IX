<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TDP Statistics Report</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 5px 0; color: #555; }
        h2 { font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f7f7f7; font-weight: bold; }
        .total-scholars { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Tulong Dunong Program (TDP)</h1>
        <p>Statistical Report</p>
    </div>

    @if(isset($stats['scholarsByProvince']))
        <h2>Total Scholars by Province</h2>
        <div class="total-scholars">
            Total Records: {{ collect($stats['scholarsByProvince'])->sum('total') }}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Province</th>
                    <th>Number of Scholars</th>
                </tr>
            </thead>
            <tbody>
                @forelse($stats['scholarsByProvince'] as $provinceStat)
                    <tr>
                        <td>{{ $provinceStat['province'] }}</td>
                        <td>{{ $provinceStat['total'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="2">No data available.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @else
        <p>No statistics data found.</p>
    @endif

</body>
</html>