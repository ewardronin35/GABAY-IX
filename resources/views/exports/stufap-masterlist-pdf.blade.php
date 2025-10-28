<!DOCTYPE html>
<html>
<head>
    <title>StuFAPs Masterlist</title>
    <style>
        @page { 
            margin: 20px; 
        }
        body { 
            font-family: 'Helvetica', sans-serif; 
            font-size: 8px; 
            color: #333;
        }
        .header-table { 
            width: 100%; 
            border: none; 
            margin-bottom: 15px; 
        }
        .header-table td { 
            text-align: center; 
            border: none; 
            vertical-align: middle; 
        }
        .header-table img { 
            height: 60px; 
        }
        .title { 
            font-size: 14px; 
            font-weight: bold; 
            font-family: 'Times New Roman', serif;
        }
        .content-table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        .content-table th, .content-table td { 
            border: 1px solid #999; 
            padding: 4px; 
            text-align: left; 
            word-wrap: break-word;
        }
        .content-table thead { 
            background-color: #E0E0E0; 
            font-weight: bold;
        }
        footer { 
            position: fixed; 
            bottom: 0px; 
            left: 0px; 
            right: 0px; 
            height: 30px; 
            font-size: 8px; 
            text-align: center; 
        }
        .page-number:before { 
            content: "Page " counter(page); 
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:15%;"><img src="{{ public_path('images/ched-logo.png') }}" alt="CHED Logo"></td>
            <td style="width:70%;">
                <p style="font-size: 10px;">Republic of the Philippines</p>
                <p class="title">COMMISSION ON HIGHER EDUCATION</p>
                <p class="title">StuFAPs Masterlist</p>
            </td>
            <td style="width:15%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" alt="Bagong Pilipinas Logo"></td>
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
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $record)
                <tr>
                    <td>{{ $record->seq }}</td>
                    <td>{{ $record->award_number }}</td>
                    <td>{{ $record->scholar?->family_name }}</td>
                    <td>{{ $record->scholar?->given_name }}</td>
                    <td>{{ $record->scholar?->middle_name ? substr($record->scholar->middle_name, 0, 1) . '.' : '' }}</td>
                    <td>{{ $record->hei?->hei_name }}</td>
                    <td>{{ $record->course?->course_name }}</td>
                    <td>{{ $record->status_type }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <footer>
        <p>Generated on: {{ date('Y-m-d h:i A') }} | <span class="page-number"></span></p>
    </footer>
</body>
</html>