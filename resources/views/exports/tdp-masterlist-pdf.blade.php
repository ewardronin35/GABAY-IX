<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TDP Masterlist</title>
    <style>
        /* This CSS is critical for styling the PDF */
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px; /* Legal-landscape paper is wide, so we use small text */
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #777;
            padding: 5px;
            text-align: left;
            /* This helps prevent text from breaking in the middle of a word */
            word-wrap: break-word; 
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .header {
            text-align: center;
        }
        .header h2 {
            margin: 0;
            padding: 0;
            font-size: 16px;
        }
        .header p {
            margin: 0;
            padding: 0;
            font-size: 12px;
        }
        .date {
            text-align: right;
            font-size: 10px;
            margin-top: 10px;
        }
        .no-records {
            text-align: center;
            padding: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Tulong Dunong Program (TDP)</h2>
        <p>Official Masterlist</p>
    </div>

    <div class="date">
        Date Generated: {{ date('F j, Y') }}
    </div>

    <table>
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