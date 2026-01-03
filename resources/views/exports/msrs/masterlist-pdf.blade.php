<!DOCTYPE html>
<html>
<head>
    <title>MSRS Masterlist</title>
    <style>
        @page { margin: 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 9px; color: #333; }
        
        /* Header Styling */
        .header-table { width: 100%; border: none; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header-table td { text-align: center; border: none; vertical-align: middle; }
        .header-table img { height: 60px; }
        
        .republic { font-size: 10px; margin: 0; }
        .commission { font-family: 'Times New Roman', serif; font-size: 14px; font-weight: bold; margin: 0; }
        .office { font-size: 10px; font-weight: bold; margin: 0; }
        .title { font-size: 14px; font-weight: bold; color: #0056b3; margin-top: 10px; text-transform: uppercase; }
        
        /* Content Table Styling */
        .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .content-table th { 
            background-color: #0056b3; 
            color: white; 
            padding: 6px; 
            font-size: 8px; 
            border: 1px solid #004494; 
            text-transform: uppercase;
        }
        .content-table td { 
            border: 1px solid #ddd; 
            padding: 5px; 
            font-size: 8px; 
            vertical-align: middle;
        }
        .content-table tr:nth-child(even) { background-color: #f9f9f9; }
        
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        
        footer { 
            position: fixed; 
            bottom: 0px; 
            left: 0px; 
            right: 0px; 
            height: 30px; 
            font-size: 8px; 
            text-align: right; 
            border-top: 1px solid #eee; 
            padding-top: 5px; 
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td width="20%">
                {{-- <img src="{{ public_path('images/ched-logo.png') }}" /> --}}
            </td>
            <td width="60%">
                <p class="republic">Republic of the Philippines</p>
                <p class="commission">COMMISSION ON HIGHER EDUCATION</p>
                <p class="office">REGIONAL OFFICE IX</p>
                <p class="title">Medical Scholarship and Return Service (MSRS)<br/>Masterlist Report</p>
            </td>
            <td width="20%">
                </td>
        </tr>
    </table>

    <table class="content-table">
        <thead>
            <tr>
                <th width="3%">#</th>
                <th width="12%">Award No</th>
                <th width="20%">Scholar Name</th>
                <th width="5%">Sex</th>
                <th width="20%">HEI</th>
                <th width="15%">Course</th>
                <th width="5%">Year</th>
                <th width="10%">Term</th>
                <th width="10%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $index => $record)
                @php 
                    $scholar = $record->enrollment->scholar;
                    $name = strtoupper("{$scholar->family_name}, {$scholar->given_name} {$scholar->extension_name}");
                @endphp
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td class="center">{{ $record->enrollment->award_number }}</td>
                    <td class="bold">{{ $name }}</td>
                    <td class="center">{{ $scholar->sex }}</td>
                    <td>{{ $record->hei->hei_name ?? '-' }}</td>
                    <td>{{ $record->course->course_name ?? '-' }}</td>
                    <td class="center">{{ $record->year_level }}</td>
                    <td class="center">
                        {{ $record->semester->name ?? '' }}<br/>
                        <span style="color:#666; font-size:7px">{{ $record->academicYear->name ?? '' }}</span>
                    </td>
                    <td class="right">{{ number_format($record->grant_amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <footer>
        Generated on: {{ date('F d, Y h:i A') }} | Page <span class="page-number"></span>
    </footer>
    
    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_script('
                $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", "normal");
                $pdf->text(750, 580, "Page " . $PAGE_NUM . " of " . $PAGE_COUNT, $font, 8);
            ');
        }
    </script>
</body>
</html>