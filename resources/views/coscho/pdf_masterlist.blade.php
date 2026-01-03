<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? 'COSCHO Masterlist' }}</title>
    <style>
        body { font-family: sans-serif; font-size: 9px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #1e3a8a; } /* Dark Blue */
        .header p { margin: 2px 0; font-size: 11px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #444; padding: 4px 6px; text-align: left; vertical-align: top; }
        th { background-color: #dbeafe; font-weight: bold; text-align: center; }
        
        .amount { text-align: right; font-family: monospace; }
        .center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CHEDRO IX - COSCHO PROGRAM</h2>
        <p>Scholarship Program for Coconut Farmers and their Families</p>
        <p>Masterlist of Beneficiaries</p>
        <p>Generated: {{ date('F d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="3%">#</th>
                <th width="12%">Award No.</th>
                <th width="18%">Name</th>
                <th width="4%">Sex</th>
                <th width="15%">Address</th>
                <th width="20%">HEI & Course</th>
                <th width="5%">Year</th>
                <th width="10%">Grant Amount</th>
                <th width="10%">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $index => $record)
                @php 
                    $scholar = $record->enrollment->scholar; 
                    $enrollment = $record->enrollment;
                    $address = $scholar->address;
                @endphp
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $enrollment->award_number }}</td>
                    <td>
                        <strong style="text-transform: uppercase;">{{ $scholar->family_name }}</strong>, 
                        {{ $scholar->given_name }} {{ $scholar->middle_name }} {{ $scholar->extension_name }}
                    </td>
                    <td class="center">{{ $scholar->sex }}</td>
                    <td>
                        {{ $address->town_city ?? '' }}, {{ $address->province ?? '' }}
                    </td>
                    <td>
                        <strong>{{ $record->hei->hei_name ?? $enrollment->hei->hei_name ?? '-' }}</strong><br>
                        <span style="color: #555; font-style: italic;">{{ $record->course->course_name ?? '' }}</span>
                    </td>
                    <td class="center">{{ $record->year_level }}</td>
                    <td class="amount">P {{ number_format($record->grant_amount, 2) }}</td>
                    <td class="center" style="font-size: 8px;">{{ $enrollment->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>