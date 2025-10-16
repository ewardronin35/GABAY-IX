<!DOCTYPE html>
<html>
<head>
    <title>Masterlist</title>
    <style>
        /* Add any additional PDF-specific styles here */
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 4px; font-size: 9pt; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    @include('reports.masterlist-header')

    <h2 style="text-align: center;">Scholarship Program Masterlist</h2>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Region</th>
                <th>Award No.</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Sex</th>
                <th>HEI</th>
                <th>Course</th>
            </tr>
        </thead>
        <tbody>
            @foreach($scholars as $index => $scholar)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $scholar->region }}</td>
                    <td>{{ $scholar->award_number }}</td>
                    <td>{{ $scholar->family_name }}</td>
                    <td>{{ $scholar->given_name }}</td>
                    <td>{{ $scholar->middle_name }}</td>
                    <td>{{ $scholar->sex }}</td>
                    <td>{{ $scholar->education->hei_name ?? '' }}</td>
                    <td>{{ $scholar->education->program ?? '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>