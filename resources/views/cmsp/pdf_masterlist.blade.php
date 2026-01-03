<!DOCTYPE html>
<html>
<head>
    <title>CMSP Masterlist</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 5px; }
        th { background: #0054A6; color: white; }
    </style>
</head>
<body>
    <h2 style="text-align:center;">CHED Merit Scholarship Program (CMSP) Masterlist</h2>
    <table>
        <thead>
            <tr><th>Name</th><th>Type</th><th>HEI</th><th>Course</th><th>GWA</th><th>Amount</th></tr>
        </thead>
        <tbody>
            @foreach($records as $row)
            <tr>
                <td>{{ $row->enrollment->scholar->family_name }}, {{ $row->enrollment->scholar->given_name }}</td>
                <td>{{ $row->enrollment->scholarship_type }}</td>
                <td>{{ $row->hei->hei_name ?? '' }}</td>
                <td>{{ $row->course->course_name ?? '' }}</td>
                <td>{{ $row->gwa }}</td>
                <td>{{ number_format($row->grant_amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>