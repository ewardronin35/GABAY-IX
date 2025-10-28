<!DOCTYPE html>
<html>
<head>
    <title>TES Masterlist</title>
    <style>
        @page { margin: 20px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 8px; }
        .header-table { width: 100%; border: none; margin-bottom: 15px; }
        .header-table td { text-align: center; border: none; vertical-align: middle; }
        .header-table img { height: 60px; }
        .title { font-size: 14px; font-weight: bold; }
        .content-table { width: 100%; border-collapse: collapse; }
        .content-table th, .content-table td { border: 1px solid #999; padding: 4px; text-align: left; }
        .content-table thead { background-color: #E0E0E0; }
        footer { position: fixed; bottom: 0px; left: 0px; right: 0px; height: 30px; font-size: 8px; text-align: center; }
        .page-number:before { content: "Page " counter(page); }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:15%;"><img src="{{ public_path('images/ched-logo.png') }}"></td>
            <td style="width:70%;"><p class="title">Tertiary Education Subsidy (TES) Masterlist</p></td>
            <td style="width:15%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}"></td>
        </tr>
    </table>
    <table class="content-table">
        <thead>
            <tr>
                <th>SEQ</th><th>Award No.</th><th>Last Name</th><th>First Name</th><th>M.I.</th><th>HEI</th><th>Course</th><th>Year Lvl</th><th>Sem</th><th>AY</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $record)
                <tr>
                    <td>{{ $record->seq }}</td><td>{{ $record->award_no }}</td><td>{{ $record->scholar?->family_name }}</td><td>{{ $record->scholar?->given_name }}</td>
                    <td>{{ $record->scholar?->middle_name ? substr($record->scholar->middle_name, 0, 1) . '.' : '' }}</td>
                    <td>{{ $record->hei?->hei_name }}</td><td>{{ $record->course?->course_name }}</td><td>{{ $record->year_level }}</td>
                    <td>{{ $record->semester }}</td><td>{{ $record->academic_year }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <footer><p>Generated on: {{ date('Y-m-d h:i A') }} | <span class="page-number"></span></p></footer>
</body>
</html>