<!DOCTYPE html>
<html>
<head>
    <title>TES Masterlist</title>
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
        .subtitle { font-size: 9px; color: #555; margin-bottom: 5px; }

        /* Content Table Styling */
        .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .content-table th, .content-table td { border: 1px solid #999; padding: 5px; text-align: left; vertical-align: middle; }
        .content-table th { background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 8px; }
        .content-table td { font-size: 8px; }
        
        /* Footer */
        footer { position: fixed; bottom: 0px; left: 0px; right: 0px; height: 30px; font-size: 8px; text-align: right; border-top: 1px solid #ddd; padding-top: 5px; }
        .page-number:before { content: "Page " counter(page); }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:15%;"><img src="{{ public_path('images/ched-logo.png') }}"></td>
            <td style="width:70%;">
                <p class="republic">Republic of the Philippines</p>
                <p class="commission">COMMISSION ON HIGHER EDUCATION</p>
                <p class="office">REGIONAL OFFICE IX</p>
                
                <p class="title">Tertiary Education Subsidy (TES) Masterlist</p>
                <p class="subtitle">Generated on: {{ date('F d, Y h:i A') }}</p>
            </td>
            <td style="width:15%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}"></td>
        </tr>
    </table>
    
    <table class="content-table">
        <thead>
            <tr>
                <th>SEQ</th>
                <th>Award No.</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>M.I.</th>
                <th>HEI</th>
                <th>Course</th>
                <th>Year Lvl</th>
                <th>Sem</th>
                <th>AY</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $record)
                <tr>
                    <td>{{ $record->seq }}</td>
                    {{-- ✅ FIX: Access Award No via Enrollment --}}
                    <td>{{ $record->enrollment?->award_number }}</td>
                    
                    {{-- ✅ FIX: Access Names via Enrollment -> Scholar --}}
                    <td>{{ $record->enrollment?->scholar?->family_name }}</td>
                    <td>{{ $record->enrollment?->scholar?->given_name }}</td>
                    <td>{{ $record->enrollment?->scholar?->middle_name ? substr($record->enrollment->scholar->middle_name, 0, 1) . '.' : '' }}</td>
                    
                    <td>{{ $record->hei?->hei_name }}</td>
                    <td>{{ $record->course?->course_name }}</td>
                    <td>{{ $record->year_level }}</td>
                    
                    {{-- ✅ FIX: Access 'name' property to avoid JSON object printing --}}
                    <td>{{ $record->semester?->name }}</td>
                    <td>{{ $record->academicYear?->name }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    
    <footer>
        <p>Generated on: {{ date('F d, Y h:i A') }} | <span class="page-number"></span></p>
    </footer>
</body>
</html>