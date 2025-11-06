<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TDP Masterlist</title>
    <style>
        /* This CSS is critical for styling the PDF */
        @page {
            margin: 20px; /* Reduced margin */
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8px; /* Legal-landscape paper is wide, so we use small text */
        }
        
        /* --- HEADER STYLES --- */
        .header-table {
            width: 100%;
            border: 0;
            border-bottom: 1px solid #333;
            margin-bottom: 15px;
        }
        .header-table td {
            border: 0;
            padding: 0 5px;
            text-align: center;
            vertical-align: middle;
        }
        .header-logo {
            width: 80px; /* Fixed width for logos */
        }
        .header-logo img {
            max-width: 100%;
            height: auto;
        }
        .header-text {
            line-height: 1.2;
        }
        .header-text .line-1 {
            font-size: 10px;
        }
        .header-text .line-2 {
            font-size: 10px;
        }
        .header-text .line-3 {
            font-size: 14px;
            font-weight: bold;
        }
        .header-text .line-4 {
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
        }
        /* --- END HEADER STYLES --- */

        .date {
            text-align: right;
            font-size: 9px;
            font-style: italic;
            margin-bottom: 10px;
        }

        .main-table {
            width: 100%;
            border-collapse: collapse;
        }
        .main-table th, .main-table td {
            border: 1px solid #777;
            padding: 4px;
            text-align: left;
            word-wrap: break-word; 
        }
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .no-records {
            text-align: center;
            padding: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="header-logo">
                <img src="{{ public_path('images/ched-logo.png') }}" alt="CHED Logo">
            </td>
            <td class="header-text">
                <div class="line-1">Republic of the Philippines</div>
                <div class="line-2">OFFICE OF THE PRESIDENT</div>
                <div class="line-3">COMMISSION ON HIGHER EDUCATION</div>
                <div class="line-4">Tulong Dunong Program (TDP) Masterlist</div>
            </td>
            <td class="header-logo">
                <img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" alt="Bagong Pilipinas Logo">
            </td>
        </tr>
    </table>
    <div class="date">
        Date Generated: {{ date('F j, Y') }}
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th>Award No.</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>HEI</th>
                <th>Course</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($records as $record)
                <tr>
                    <td>{{ $record->award_no ?? 'N/A' }}</td>
                    
                    <td>{{ $record->scholar->family_name ?? '' }}</td>
                    <td>{{ $record->scholar->given_name ?? '' }}</td>
                    <td>{{ $record->scholar->middle_name ?? '' }}</td>
                    
                    <td>{{ $record->hei->hei_name ?? 'N/A' }}</td>
                    <td>{{ $record->course->course_name ?? 'N/A' }}</td>
                    
                    <td>{{ $record->validation_status ?? 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="no-records">
                        No records found for the selected filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>