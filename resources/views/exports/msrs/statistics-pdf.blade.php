<!DOCTYPE html>
<html>
<head>
    <title>MSRS Statistics Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 14px; font-weight: bold; color: #0056b3; text-transform: uppercase; }
        .section-title { font-size: 12px; font-weight: bold; color: #0056b3; margin-top: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 5px; border: 1px solid #ddd; }
        td { padding: 5px; border: 1px solid #ddd; }
        .right { text-align: right; }
        .center { text-align: center; }
        
        .kpi-box { width: 32%; display: inline-block; background: #f9f9f9; border: 1px solid #ddd; padding: 10px; text-align: center; margin-right: 1%; margin-bottom: 10px; }
        .kpi-value { font-size: 14px; font-weight: bold; display: block; margin-top: 5px; }
        .kpi-label { font-size: 9px; color: #666; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <div style="font-weight:bold; font-size:12px;">COMMISSION ON HIGHER EDUCATION - REGION IX</div>
        <div class="title">MSRS Statistics & Analytics Report</div>
        <div style="font-size:9px; color:#666;">Generated on: {{ $generated_at }} | By: {{ $user }}</div>
    </div>

    <div>
        <div class="kpi-box">
            <span class="kpi-label">Total Scholars</span>
            <span class="kpi-value">{{ $stats['total_scholars'] }}</span>
        </div>
        <div class="kpi-box">
            <span class="kpi-label">Active Scholars</span>
            <span class="kpi-value">{{ $stats['active_scholars'] }}</span>
        </div>
        <div class="kpi-box">
            <span class="kpi-label">Total Disbursed</span>
            <span class="kpi-value">{{ number_format($stats['total_disbursed'], 2) }}</span>
        </div>
    </div>

    <div class="section-title">1. Financial Trends (By Academic Year)</div>
    <table>
        <thead>
            <tr>
                <th width="60%">Academic Year</th>
                <th width="40%" class="right">Total Disbursed (PHP)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats['financial_trend'] as $trend)
            <tr>
                <td>{{ $trend->year }}</td>
                <td class="right">{{ number_format($trend->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">2. Institutional Distribution (Top HEIs)</div>
    <table>
        <thead>
            <tr>
                <th width="70%">Institution Name</th>
                <th width="30%" class="center">Scholar Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats['scholars_by_hei'] as $hei)
            <tr>
                <td>{{ $hei['name'] }}</td>
                <td class="center">{{ $hei['value'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">3. Demographics Summary</div>
    <table style="width: 50%; float: left; margin-right: 2%;">
        <thead><tr><th colspan="2">Gender Distribution</th></tr></thead>
        <tbody>
            @foreach($stats['gender_distribution'] as $gender)
            <tr>
                <td>{{ $gender['name'] == 'M' ? 'Male' : 'Female' }}</td>
                <td class="center">{{ $gender['value'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <table style="width: 48%; float: left;">
        <thead><tr><th colspan="2">Top Provinces</th></tr></thead>
        <tbody>
            @foreach($stats['scholars_by_province'] as $prov)
            <tr>
                <td>{{ $prov['name'] }}</td>
                <td class="center">{{ $prov['value'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>