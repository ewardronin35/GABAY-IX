<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TDP Statistics Report</title>
    <style>
        @page { margin: 25px; }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            font-size: 11px;
        }
        .header-table {
            width: 100%;
            border: 0;
            border-bottom: 1px solid #333;
            margin-bottom: 15px;
        }
        .header-table td { border: 0; padding: 0 5px; text-align: center; vertical-align: middle; }
        .header-logo { width: 80px; }
        .header-logo img { max-width: 100%; height: auto; }
        .header-text { line-height: 1.2; }
        .header-text .line-1 { font-size: 11px; }
        .header-text .line-2 { font-size: 11px; }
        .header-text .line-3 { font-size: 15px; font-weight: bold; }
        .header-text .line-4 { font-size: 13px; font-weight: bold; margin-top: 5px; }
        .date { text-align: right; font-size: 10px; font-style: italic; margin-bottom: 10px; }
        h2 {
            font-size: 16px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        
        /* --- Summary Cards --- */
        .summary-container {
            width: 100%;
            border-spacing: 10px;
            border-collapse: separate;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .summary-card {
            border: 1px solid #ddd;
            width: 25%;
            text-align: center;
            padding: 15px;
            border-radius: 5px;
        }
        .summary-card .label { font-size: 12px; color: #555; }
        .summary-card .value { font-size: 22px; font-weight: bold; }
        
        /* --- Data Tables --- */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            page-break-inside: auto;
        }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .data-table th { background-color: #f2f2f2; font-weight: bold; }
        .data-table tr { page-break-inside: avoid; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="header-logo"><img src="{{ public_path('images/ched-logo.png') }}" alt="CHED Logo"></td>
            <td class="header-text">
                <div class="line-1">Republic of the Philippines</div>
                <div class="line-2">OFFICE OF THE PRESIDENT</div>
                <div class="line-3">COMMISSION ON HIGHER EDUCATION</div>
                <div class="line-4">Tulong Dunong Program (TDP) Statistical Report</div>
            </td>
            <td class="header-logo"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" alt="Bagong Pilipinas Logo"></td>
        </tr>
    </table>

    <div class="date">Date Generated: {{ date('F j, Y h:i A') }}</div>

    <h2>Executive Summary</h2>
    <table class="summary-container">
        <tr>
            <td class="summary-card">
                <div class="label">Total Scholars</div>
                <div class="value">{{ $stats['total_scholars'] ?? 0 }}</div>
            </td>
            <td class="summary-card" style="border-color: #28a745;">
                <div class="label">Validated</div>
                <div class="value" style="color: #28a745;">{{ $stats['by_status']['VALIDATED'] ?? 0 }}</div>
            </td>
            <td class="summary-card" style="border-color: #ffc107;">
                <div class="label">Pending</div>
                <div class="value" style="color: #ffc107;">{{ $stats['by_status']['PENDING'] ?? 0 }}</div>
            </td>
            <td class="summary-card" style="border-color: #dc3545;">
                <div class="label">Rejected/Other</div>
                <div class="value" style="color: #dc3545;">
                    @php
                        // Sum up all other statuses
                        $rejectedTotal = 0;
                        if (isset($stats['by_status']) && is_array($stats['by_status'])) {
                            foreach ($stats['by_status'] as $key => $value) {
                                if ($key !== 'VALIDATED' && $key !== 'PENDING') {
                                    $rejectedTotal += $value;
                                }
                            }
                        }
                    @endphp
                    {{ $rejectedTotal }}
                </div>
            </td>
        </tr>
    </table>

    <h2>Detailed Data Tables</h2>
    
    <table style="width: 100%; border: 0; page-break-inside: avoid;">
        <tr style="border: 0;">
            <td style="width: 48%; vertical-align: top; border: 0; padding: 0;">
                <h3>Scholars by Status</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>Status</th><th>Total Scholars</th></tr>
                    </thead>
                    <tbody>
                        @forelse($stats['by_status'] as $status => $total)
                            <tr><td>{{ $status }}</td><td>{{ $total }}</td></tr>
                        @empty
                            <tr><td colspan="2">No data available.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
            <td style="width: 4%; border: 0; padding: 0;"></td>
            <td style="width: 48%; vertical-align: top; border: 0; padding: 0;">
                <h3>Scholars by HEI (Top 10)</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>HEI Name</th><th>Total Scholars</th></tr>
                    </thead>
                    <tbody>
                        @forelse($stats['by_hei'] as $name => $total)
                            <tr><td>{{ $name }}</td><td>{{ $total }}</td></tr>
                        @empty
                            <tr><td colspan="2">No data available.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>
    
    <h3 style="margin-top: 20px;">Scholars by Province</h3>
    <table class="data-table">
        <thead>
            <tr><th>Province</th><th>Total Scholars</th></tr>
        </thead>
        <tbody>
            @forelse($stats['scholarsByProvince'] as $province)
                <tr><td>{{ $province['province'] }}</td><td>{{ $province['total'] }}</td></tr>
            @empty
                <tr><td colspan="2">No data available.</td></tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>