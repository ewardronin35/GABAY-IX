<!DOCTYPE html>
<html>
<head>
    <title>COSCHO Statistics</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        .container { width: 100%; padding: 10px; }
        
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
        .header h2 { margin: 0; color: #1e3a8a; }
        .header p { margin: 5px 0; color: #666; font-size: 12px; }

        /* Summary Boxes */
        .summary-box { width: 100%; margin-bottom: 30px; }
        .summary-item { display: inline-block; width: 32%; text-align: center; background: #f8fafc; padding: 15px 0; border: 1px solid #e2e8f0; border-radius: 4px; }
        .val { font-size: 22px; font-weight: bold; display: block; color: #1e40af; }
        .lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 5px; display: block; }

        /* Tables */
        .section-title { font-size: 14px; font-weight: bold; margin: 20px 0 10px 0; color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #eff6ff; color: #1e3a8a; }
        .num { text-align: right; font-family: monospace; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>COSCHO PROGRAM STATISTICS</h2>
            <p>Report Generated: {{ $date ?? date('F d, Y') }}</p>
        </div>

        <div class="summary-box">
            <div class="summary-item">
                <span class="val">{{ number_format($stats['total']) }}</span>
                <span class="lbl">Total Scholars</span>
            </div>
            <div class="summary-item">
                <span class="val">P {{ number_format($stats['amount'], 2) }}</span>
                <span class="lbl">Total Grants Released</span>
            </div>
            <div class="summary-item">
                <span class="val">{{ number_format($stats['active']) }}</span>
                <span class="lbl">Active Status</span>
            </div>
        </div>

        <div class="section-title">Financial Disbursement History</div>
        <table>
            <thead>
                <tr>
                    <th>Academic Year</th>
                    <th style="text-align: right;">Total Amount Disbursed</th>
                </tr>
            </thead>
            <tbody>
                @forelse($stats['financials'] as $fin)
                <tr>
                    <td>{{ $fin->year }}</td>
                    <td class="num">P {{ number_format($fin->total, 2) }}</td>
                </tr>
                @empty
                <tr><td colspan="2" style="text-align: center;">No financial records found.</td></tr>
                @endforelse
            </tbody>
        </table>

        <br>

        <div class="section-title">Top Higher Education Institutions (HEIs)</div>
        <table>
            <thead>
                <tr>
                    <th>HEI Name</th>
                    <th width="20%" style="text-align: right;">Scholar Count</th>
                </tr>
            </thead>
            <tbody>
                @forelse($stats['by_hei'] as $hei)
                <tr>
                    <td>{{ $hei->hei_name }}</td>
                    <td class="num">{{ $hei->enrollments_count }}</td>
                </tr>
                @empty
                <tr><td colspan="2" style="text-align: center;">No HEI data available.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>