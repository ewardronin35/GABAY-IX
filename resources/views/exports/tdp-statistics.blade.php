<table>
    <thead>
        <tr>
            <th colspan="3" style="font-size: 16px; font-weight: bold; text-align: center; height: 30px;">TULONG DUNONG PROGRAM (TDP) - STATISTICAL REPORT</th>
        </tr>
        <tr>
            <th colspan="3" style="text-align: center; color: #666666;">Generated: {{ $generated_at }}</th>
        </tr>
        <tr>
            <th colspan="3" style="text-align: center; color: #666666;">
                Filters: 
                @foreach($filters as $key => $val)
                    @if(!empty($val) && $key !== 'page' && $key !== 'tab')
                        {{ ucwords(str_replace('_', ' ', $key)) }}: {{ $val }} |
                    @endif
                @endforeach
            </th>
        </tr>
        <tr></tr> </thead>

    <tbody>
        <tr>
            <td colspan="3" style="background-color: #dbeafe; border: 1px solid #000000; font-weight: bold; text-align: center;">TOTAL ENROLLED SCHOLARS</td>
        </tr>
        <tr>
            <td colspan="3" style="background-color: #eff6ff; border: 1px solid #000000; font-size: 20px; font-weight: bold; text-align: center; height: 40px;">
                {{ number_format($totalScholars) }}
            </td>
        </tr>
        <tr></tr>

        <tr>
            <td colspan="3" style="font-weight: bold; background-color: #1e3a8a; color: #ffffff;">GENDER DEMOGRAPHICS</td>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000;">Category</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Count</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Percentage</th>
        </tr>
        @foreach($sexDistribution as $item)
        <tr>
            <td style="border: 1px solid #000000;">{{ $item->name }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($item->value) }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
        </tr>
        @endforeach
        <tr></tr>

        <tr>
            <td colspan="3" style="font-weight: bold; background-color: #1e3a8a; color: #ffffff;">REGIONAL DISTRIBUTION</td>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000;">Region</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Count</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Percentage</th>
        </tr>
        @foreach($regionDistribution as $item)
        <tr>
            <td style="border: 1px solid #000000;">{{ $item->name }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($item->value) }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
        </tr>
        @endforeach
        <tr></tr>

        <tr>
            <td colspan="3" style="font-weight: bold; background-color: #1e3a8a; color: #ffffff;">TOP PARTICIPATING INSTITUTIONS (HEIs)</td>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000;">Institution Name</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Count</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Percentage</th>
        </tr>
        @foreach($heiDistribution as $item)
        <tr>
            <td style="border: 1px solid #000000;">{{ $item->name }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($item->value) }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
        </tr>
        @endforeach
        <tr></tr>

        <tr>
            <td colspan="3" style="font-weight: bold; background-color: #1e3a8a; color: #ffffff;">TOP ACADEMIC PROGRAMS</td>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000;">Course Name</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Enrolled</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Percentage</th>
        </tr>
        @foreach($courseDistribution as $item)
        <tr>
            <td style="border: 1px solid #000000;">{{ $item->name }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($item->value) }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
        </tr>
        @endforeach
        <tr></tr>

        <tr>
            <td colspan="3" style="font-weight: bold; background-color: #1e3a8a; color: #ffffff;">GEOGRAPHIC DISTRIBUTION (PROVINCE)</td>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000;">Province</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Count</th>
            <th style="font-weight: bold; background-color: #f3f4f6; border: 1px solid #000000; text-align: right;">Percentage</th>
        </tr>
        @foreach($provinceDistribution as $item)
        <tr>
            <td style="border: 1px solid #000000;">{{ $item->name }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ number_format($item->value) }}</td>
            <td style="border: 1px solid #000000; text-align: right;">{{ $totalScholars > 0 ? round(($item->value / $totalScholars) * 100, 1) : 0 }}%</td>
        </tr>
        @endforeach
    </tbody>
</table>