<!DOCTYPE html>
<html>
<head>
    <title>StuFAPs Masterlist</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 20px; position: relative; }
        .logo { width: 60px; height: 60px; position: absolute; top: 0; left: 20px; }
        .header h3 { margin: 0; font-size: 12px; }
        .header h2 { margin: 5px 0; font-size: 14px; text-transform: uppercase; }
        .header p { margin: 0; font-size: 10px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #444; padding: 5px; text-align: left; vertical-align: top; }
        th { background-color: #0054A6; color: white; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; color: #555; text-align: right; padding: 5px; }
    </style>
</head>
<body>
    <div class="header">
        {{-- Use absolute path for images in DomPDF --}}
        {{-- <img src="{{ public_path('images/ched_logo.png') }}" class="logo"> --}}
        
        <h3>Republic of the Philippines</h3>
        <h3>OFFICE OF THE PRESIDENT</h3>
        <h3>COMMISSION ON HIGHER EDUCATION</h3>
        <h3>REGIONAL OFFICE IX</h3>
        <br>
        <h2>StuFAPs Masterlist of Beneficiaries</h2>
        <p>Generated on: {{ date('F d, Y h:i A') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="10%">Award No</th>
                <th width="8%">Code</th>
                <th width="20%">Scholar Name</th>
                <th width="5%">Sex</th>
                <th width="22%">HEI</th>
                <th width="20%">Course</th>
                <th width="5%">Year</th>
                <th width="10%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $record)
            <tr>
                <td>{{ $record->enrollment->award_number ?? '-' }}</td>
                <td>{{ $record->enrollment->scholarship_type ?? '' }}</td>
                <td style="text-transform: uppercase;">
                    <strong>{{ $record->enrollment->scholar->family_name ?? '' }}</strong>, 
                    {{ $record->enrollment->scholar->given_name ?? '' }}
                </td>
                <td class="text-center">{{ $record->enrollment->scholar->sex ?? '' }}</td>
                <td>{{ $record->hei->hei_name ?? '' }}</td>
                <td>{{ $record->course->course_name ?? '' }}</td>
                <td class="text-center">{{ $record->year_level }}</td>
                <td class="text-right">{{ number_format($record->grant_amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page <span class="page-number"></span> | System Generated Report
    </div>
</body>
</html>