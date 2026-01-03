<!DOCTYPE html>
<html>
<head>
    <title>TES Statistics Report</title>
    <style>
        @page { margin: 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; color: #333; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header-table td { text-align: center; border: none; vertical-align: middle; }
        .header-table img { height: 60px; }
        .title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; color: #0056b3; }
        .subtitle { font-size: 10px; color: #555; margin: 2px 0; }
        .republic { font-size: 10px; margin: 0; }
        .commission { font-family: 'Times New Roman', serif; font-size: 14px; font-weight: bold; margin: 0; }
        
        h3 { font-size: 12px; color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px; margin-bottom: 5px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9px; }
        th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
        th { background-color: #f0f4f8; font-weight: bold; color: #333; }
        td.num { text-align: right; }
        
        .summary-box { background: #f9f9f9; border: 1px solid #eee; padding: 10px; margin-bottom: 15px; border-radius: 4px; display: table; width: 100%; }
        .summary-item { display: table-cell; width: 25%; text-align: center; border-right: 1px solid #ddd; }
        .summary-item:last-child { border-right: none; }
        .summary-label { font-weight: bold; color: #555; display: block; font-size: 9px; }
        .summary-val { font-weight: bold; color: #0056b3; font-size: 12px; display: block; margin-top: 3px; }
        
        .interpretation { background-color: #fffde7; border: 1px solid #fff9c4; padding: 10px; font-size: 10px; color: #666; font-style: italic; margin-top: 20px; page-break-inside: avoid; }
        
        .row { width: 100%; }
        .col-half { width: 48%; display: inline-block; vertical-align: top; }
        .gap { width: 2%; display: inline-block; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:15%;"><img src="{{ public_path('images/ched-logo.png') }}"></td>
            <td style="width:70%;">
                <p class="republic">Republic of the Philippines</p>
                <p class="commission">COMMISSION ON HIGHER EDUCATION</p>
                <p class="republic" style="font-weight:bold;">REGIONAL OFFICE IX</p>
                <br/>
                <p class="title">TES Statistics Report</p>
                <p class="subtitle">Generated on: {{ date('F d, Y h:i A') }}</p>
            </td>
            <td style="width:15%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}"></td>
        </tr>
    </table>

    <div class="summary-box">
        <div class="summary-item"><span class="summary-label">TOTAL SCHOLARS</span> <span class="summary-val">{{ number_format($stats['summary']['total_scholars']) }}</span></div>
        <div class="summary-item"><span class="summary-label">TOTAL HEIs</span> <span class="summary-val">{{ number_format($stats['summary']['total_heis']) }}</span></div>
        <div class="summary-item"><span class="summary-label">TOTAL FUNDS</span> <span class="summary-val">PHP {{ number_format($stats['summary']['total_funds'], 2) }}</span></div>
        <div class="summary-item"><span class="summary-label">ACTIVE / PAID</span> <span class="summary-val">{{ number_format($stats['summary']['active_scholars']) }}</span></div>
    </div>

    <div class="row">
        <div class="col-half">
            <h3>Validation Compliance</h3>
            <table>
                <thead><tr><th>Category</th><th style="text-align: right;">Count</th></tr></thead>
                <tbody>
                    @foreach($stats['compliance'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="gap"></div>
        <div class="col-half">
            <h3>Payment Status</h3>
            <table>
                <thead><tr><th>Status</th><th style="text-align: right;">Count</th></tr></thead>
                <tbody>
                    @foreach($stats['statusStats'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="row">
        <div class="col-half">
            <h3>Top 10 Institutions (HEIs)</h3>
            <table>
                <thead><tr><th>HEI Name</th><th style="text-align: right;">Scholars</th></tr></thead>
                <tbody>
                    @foreach($stats['topHeis'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="gap"></div>
        <div class="col-half">
            <h3>Top Provinces</h3>
            <table>
                <thead><tr><th>Province</th><th style="text-align: right;">Scholars</th></tr></thead>
                <tbody>
                    @foreach($stats['scholarsPerRegion'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="row">
        <div class="col-half">
            <h3>Sex Distribution</h3>
            <table>
                <thead><tr><th>Sex</th><th style="text-align: right;">Total</th></tr></thead>
                <tbody>
                    @foreach($stats['scholarsBySex'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="gap"></div>
        <div class="col-half">
            <h3>Year Level Distribution</h3>
            <table>
                <thead><tr><th>Year Level</th><th style="text-align: right;">Total</th></tr></thead>
                <tbody>
                    @foreach($stats['yearStats'] as $item)
                        <tr><td>{{ $item->name }}</td><td class="num">{{ number_format($item->value) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    @if(!empty($stats['interpretation']))
        <div class="interpretation">
            <strong>Executive Analysis:</strong> {{ $stats['interpretation'] }}
        </div>
    @endif
</body>
</html>