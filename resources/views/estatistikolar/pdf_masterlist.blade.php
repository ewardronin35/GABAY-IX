<!DOCTYPE html>
<html>
<head>
    <title>Estatistikolar Masterlist</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CHED Regional Office IX</h2>
        <h3>Estatistikolar Masterlist</h3>
        <p>Generated on: {{ date('F d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Seq</th>
                <th>LRN</th>
                <th>Award No.</th>
                <th>Name</th>
                <th>Sex</th>
                <th>HEI</th>
                <th>Program</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $index => $record)
                @php $scholar = $record->enrollment->scholar; @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $scholar->lrn }}</td>
                    <td>{{ $record->enrollment->award_number }}</td>
                    <td>{{ $scholar->family_name }}, {{ $scholar->given_name }}</td>
                    <td>{{ $scholar->sex }}</td>
                    <td>{{ $record->hei->hei_name ?? ($record->enrollment->hei->hei_name ?? '-') }}</td>
                    <td>{{ $record->course->course_name ?? '-' }}</td>
                    <td>{{ $record->enrollment->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>