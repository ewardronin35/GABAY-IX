<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<table>
    <tr><td colspan="4"></td></tr>
    <tr>
        <td colspan="4" style="text-align: center; font-size: 10px;">Republic of the Philippines</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align: center; font-size: 12px; font-weight: bold;">COMMISSION ON HIGHER EDUCATION</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align: center; font-size: 11px; font-weight: bold;">REGIONAL OFFICE IX</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align: center; font-size: 14px; font-weight: bold; color: #0056b3;">TES STATISTICS REPORT</td>
    </tr>
    <tr>
        <td colspan="4" style="text-align: center; font-size: 10px;">Generated on: {{ date('F d, Y h:i A') }}</td>
    </tr>
    <tr><td colspan="4"></td></tr>
</table>

<table>
    <thead>
        <tr>
            <th colspan="2" style="background-color: #0056b3; color: #ffffff; font-weight: bold; border: 1px solid #000000; text-align: left;">EXECUTIVE SUMMARY</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="background-color: #f2f2f2; font-weight: bold; border: 1px solid #000000;">Total Scholars Processed</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($summary['total_scholars']) }}</td>
        </tr>
        <tr>
            <td style="background-color: #f2f2f2; font-weight: bold; border: 1px solid #000000;">Active / Paid Scholars</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($summary['active_scholars']) }}</td>
        </tr>
        <tr>
            <td style="background-color: #f2f2f2; font-weight: bold; border: 1px solid #000000;">Participating HEIs</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($summary['total_heis']) }}</td>
        </tr>
        <tr>
            <td style="background-color: #f2f2f2; font-weight: bold; border: 1px solid #000000;">Total Funds Allocated</td>
            <td style="border: 1px solid #000000; text-align: right;">PHP {{ number_format($summary['total_funds'], 2) }}</td>
        </tr>
    </tbody>
</table>

<br/>

<table>
    <thead>
        <tr>
            {{-- ✅ FIXED: Changed '&' to 'AND' to prevent DOM Document Error --}}
            <th colspan="3" style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000;">VALIDATION AND COMPLIANCE STATUS</th>
            <th></th>
            <th colspan="2" style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000;">PAYMENT STATUS</th>
        </tr>
        <tr>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Status Category</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Count</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Percentage</th>
            <th></th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Status</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Count</th>
        </tr>
    </thead>
    <tbody>
        @php 
            $totalComp = $complianceStats->sum('value'); 
            $maxRows = max($complianceStats->count(), $statusStats->count());
        @endphp
        
        @for($i = 0; $i < $maxRows; $i++)
            <tr>
                <td style="border: 1px solid #000000;">{{ $complianceStats[$i]->name ?? '' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($complianceStats[$i]) ? $complianceStats[$i]->value : '' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">
                    {{ (isset($complianceStats[$i]) && $totalComp > 0) ? round(($complianceStats[$i]->value / $totalComp) * 100, 1) . '%' : '' }}
                </td>
                
                <td></td>
                
                <td style="border: 1px solid #000000;">{{ $statusStats[$i]->name ?? '' }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ isset($statusStats[$i]) ? $statusStats[$i]->value : '' }}</td>
            </tr>
        @endfor
    </tbody>
</table>

<br/>

<table>
    <thead>
        <tr>
            <th colspan="2" style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000;">TOP 10 INSTITUTIONS (HEIs)</th>
        </tr>
        <tr>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">HEI Name</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Total Scholars</th>
        </tr>
    </thead>
    <tbody>
        @foreach($topHeis as $item)
            <tr>
                <td style="border: 1px solid #000000;">{{ $item->name }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ number_format($item->value) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<br/>

<table>
    <thead>
        <tr>
            <th colspan="2" style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000;">TOP PROVINCES</th>
        </tr>
        <tr>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Province</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Total Scholars</th>
        </tr>
    </thead>
    <tbody>
        @foreach($provinceStats as $item)
            <tr>
                <td style="border: 1px solid #000000;">{{ $item->name }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ number_format($item->value) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<br/>

<table>
    <thead>
        <tr>
            <th colspan="2" style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000;">DEMOGRAPHICS</th>
        </tr>
        <tr>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Category</th>
            <th style="background-color: #cccccc; font-weight: bold; border: 1px solid #000000; text-align: center;">Count</th>
        </tr>
    </thead>
    <tbody>
        <tr><td colspan="2" style="font-weight: bold; background-color: #e0e0e0; border: 1px solid #000000;">BY SEX</td></tr>
        @foreach($sexStats as $item)
            <tr>
                <td style="border: 1px solid #000000;">{{ $item->name }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ number_format($item->value) }}</td>
            </tr>
        @endforeach
        
        <tr><td colspan="2" style="font-weight: bold; background-color: #e0e0e0; border: 1px solid #000000;">BY YEAR LEVEL</td></tr>
        @foreach($yearStats as $item)
            <tr>
                <td style="border: 1px solid #000000;">{{ $item->name }}</td>
                <td style="border: 1px solid #000000; text-align: center;">{{ number_format($item->value) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>