<table>
    <tr>
        <td colspan="6" style="text-align: center; font-weight: bold; font-size: 14px; color: #0056b3;">
            MSRS STATISTICS AND ANALYTICS REPORT
        </td>
    </tr>
    <tr>
        <td colspan="6" style="text-align: center; font-size: 10px;">
            Generated on: {{ $generated_at ?? date('Y-m-d H:i:s') }}
        </td>
    </tr>
    <tr><td colspan="6"></td></tr>

    <tr>
        <td colspan="2" style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #000000; text-align: center;">Total Scholars</td>
        <td colspan="2" style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #000000; text-align: center;">Active Scholars</td>
        <td colspan="2" style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #000000; text-align: center;">Total Disbursed</td>
    </tr>
    <tr>
        <td colspan="2" style="text-align: center; border: 1px solid #000000;">{{ $stats['total_scholars'] ?? 0 }}</td>
        <td colspan="2" style="text-align: center; border: 1px solid #000000;">{{ $stats['active_scholars'] ?? 0 }}</td>
        <td colspan="2" style="text-align: right; border: 1px solid #000000;">{{ number_format($stats['total_disbursed'] ?? 0, 2) }}</td>
    </tr>
    <tr><td colspan="6"></td></tr>

    <tr>
        <td colspan="6" style="font-weight: bold; color: #ffffff; background-color: #0056b3; border: 1px solid #000000;">1. FINANCIAL TRENDS (Per Academic Year)</td>
    </tr>
    <tr>
        <td colspan="3" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Academic Year</td>
        <td colspan="3" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Total Disbursed (PHP)</td>
    </tr>
    @if(isset($stats['financial_trend']) && count($stats['financial_trend']) > 0)
        @foreach($stats['financial_trend'] as $trend)
        <tr>
            <td colspan="3" style="border: 1px solid #000000; text-align: center;">{{ $trend->year ?? 'N/A' }}</td>
            <td colspan="3" style="border: 1px solid #000000; text-align: right;">{{ number_format($trend->total ?? 0, 2) }}</td>
        </tr>
        @endforeach
    @else
        <tr><td colspan="6" style="text-align: center; border: 1px solid #000000;">No financial records found.</td></tr>
    @endif
    <tr><td colspan="6"></td></tr>

    <tr>
        <td colspan="6" style="font-weight: bold; color: #ffffff; background-color: #0056b3; border: 1px solid #000000;">2. INSTITUTIONAL DISTRIBUTION (Top HEIs)</td>
    </tr>
    <tr>
        <td colspan="4" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6;">Institution Name</td>
        <td colspan="2" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Scholar Count</td>
    </tr>
    @if(isset($stats['scholars_by_hei']) && count($stats['scholars_by_hei']) > 0)
        @foreach($stats['scholars_by_hei'] as $hei)
        <tr>
            <td colspan="4" style="border: 1px solid #000000;">{{ $hei['name'] ?? 'Unknown' }}</td>
            <td colspan="2" style="border: 1px solid #000000; text-align: center;">{{ $hei['value'] ?? 0 }}</td>
        </tr>
        @endforeach
    @else
        <tr><td colspan="6" style="text-align: center; border: 1px solid #000000;">No institution data available.</td></tr>
    @endif
    <tr><td colspan="6"></td></tr>

    <tr>
        <td colspan="6" style="font-weight: bold; color: #ffffff; background-color: #0056b3; border: 1px solid #000000;">3. GEOGRAPHIC DISTRIBUTION (Top Provinces)</td>
    </tr>
    <tr>
        <td colspan="4" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6;">Province</td>
        <td colspan="2" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Scholar Count</td>
    </tr>
    @if(isset($stats['scholars_by_province']) && count($stats['scholars_by_province']) > 0)
        @foreach($stats['scholars_by_province'] as $prov)
        <tr>
            <td colspan="4" style="border: 1px solid #000000;">{{ $prov['name'] ?? 'Unknown' }}</td>
            <td colspan="2" style="border: 1px solid #000000; text-align: center;">{{ $prov['value'] ?? 0 }}</td>
        </tr>
        @endforeach
    @else
        <tr><td colspan="6" style="text-align: center; border: 1px solid #000000;">No provincial data available.</td></tr>
    @endif
    <tr><td colspan="6"></td></tr>

    <tr>
        <td colspan="6" style="font-weight: bold; color: #ffffff; background-color: #0056b3; border: 1px solid #000000;">4. DEMOGRAPHICS (Gender)</td>
    </tr>
    <tr>
        <td colspan="3" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Gender</td>
        <td colspan="3" style="font-weight: bold; border: 1px solid #000000; background-color: #e6e6e6; text-align: center;">Count</td>
    </tr>
    @if(isset($stats['gender_distribution']) && count($stats['gender_distribution']) > 0)
        @foreach($stats['gender_distribution'] as $gender)
        <tr>
            <td colspan="3" style="border: 1px solid #000000; text-align: center;">
                {{ ($gender['name'] ?? '') == 'M' ? 'Male' : (($gender['name'] ?? '') == 'F' ? 'Female' : 'Unspecified') }}
            </td>
            <td colspan="3" style="border: 1px solid #000000; text-align: center;">{{ $gender['value'] ?? 0 }}</td>
        </tr>
        @endforeach
    @else
        <tr><td colspan="6" style="text-align: center; border: 1px solid #000000;">No demographic data.</td></tr>
    @endif
</table>