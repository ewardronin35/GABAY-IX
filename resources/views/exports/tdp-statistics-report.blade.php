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
        .header-text .line-4 { font-size: 13px; font-weight: bold; }

        .kpi-container {
            width: 100%;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            text-align: center;
            border-radius: 4px;
        }
        .kpi-label { font-size: 12px; color: #0369a1; font-weight: bold; text-transform: uppercase; }
        .kpi-value { font-size: 24px; color: #0c4a6e; font-weight: bold; margin-top: 5px; }

        .section-header {
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            background-color: #1e40af;
            padding: 5px 10px;
            margin-top: 20px;
            margin-bottom: 5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        .data-table th, .data-table td {
            border: 1px solid #e5e7eb;
            padding: 5px;
            text-align: left;
        }
        .data-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        .data-table tr:nth-child(even) { background-color: #f9fafb; }
        .text-right { text-align: right; }
        .w-50 { width: 48%; display: inline-block; vertical-align: top; }
        .spacer { width: 2%; display: inline-block; }
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

    <div class="kpi-container">
        <div class="kpi-label">Total Enrolled Scholars</div>
        <div class="kpi-value">{{ number_format($totalScholars) }}</div>
    </div>

    <div>
        <div class="w-50">
            <div class="section-header">GENDER DISTRIBUTION</div>
            <table class="data-table">
                <thead><tr><th>Category</th><th class="text-right">Count</th><th class="text-right">%</th></tr></thead>
                <tbody>
                    @forelse($sexDistribution as $item)
                        <tr>
                            <td>{{ $item->name }}</td>
                            <td class="text-right">{{ number_format($item->value) }}</td>
                            <td class="text-right">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
                        </tr>
                    @empty
                        <tr><td colspan="3">No data available</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="spacer"></div>

        <div class="w-50">
            <div class="section-header">REGIONAL DISTRIBUTION</div>
            <table class="data-table">
                <thead><tr><th>Region</th><th class="text-right">Scholars</th></tr></thead>
                <tbody>
                    @forelse($regionDistribution as $item)
                        <tr>
                            <td>{{ Str::limit($item->name, 25) }}</td>
                            <td class="text-right">{{ number_format($item->value) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No data available</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div style="margin-top: 15px;">
        <div class="w-50">
            <div class="section-header">TOP PARTICIPATING HEIs</div>
            <table class="data-table">
                <thead><tr><th>Institution</th><th class="text-right">Count</th></tr></thead>
                <tbody>
                    @forelse($heiDistribution as $item)
                        <tr>
                            <td>{{ Str::limit($item->name, 35) }}</td>
                            <td class="text-right">{{ number_format($item->value) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No data available</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="spacer"></div>

        <div class="w-50">
            <div class="section-header">TOP ACADEMIC COURSES</div>
            <table class="data-table">
                <thead><tr><th>Course</th><th class="text-right">Count</th></tr></thead>
                <tbody>
                    @forelse($courseDistribution as $item)
                        <tr>
                            <td>{{ Str::limit($item->name, 35) }}</td>
                            <td class="text-right">{{ number_format($item->value) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No data available</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div style="margin-top: 15px;">
        <div class="section-header">GEOGRAPHIC DISTRIBUTION (BY PROVINCE)</div>
        <table class="data-table">
            <thead><tr><th>Province</th><th class="text-right">Total Scholars</th></tr></thead>
            <tbody>
                @forelse($provinceDistribution as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td class="text-right">{{ number_format($item->value) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="2">No data available</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 9px; color: #666;">
        <strong>Applied Filters:</strong> 
        @foreach($filters as $key => $val)
            @if(!empty($val) && $key !== 'page' && $key !== 'tab')
                {{ ucwords(str_replace('_', ' ', $key)) }}: {{ $val }} |
            @endif
        @endforeach
    </div>

</body>
</html>