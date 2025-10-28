<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Estatskolar Masterlist</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        th, td {
            border: 1px solid #777;
            padding: 4px 6px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            text-align: center;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Estatskolar Program</h1>
        <p>Official Masterlist of Beneficiaries</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Award Number</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>HEI Name</th>
                <th>Program Name</th>
                <th>Region</th>
                <th>Province</th>
            </tr>
        </thead>
        <tbody>
            @forelse($beneficiaries as $index => $scholar)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $scholar->award_number }}</td>
                    <td>{{ $scholar->last_name }}</td>
                    <td>{{ $scholar->first_name }}</td>
                    <td>{{ $scholar->middle_name }}</td>
                    <td>{{ $scholar->hei_name }}</td>
                    <td>{{ $scholar->program_name }}</td>
                    <td>{{ $scholar->region }}</td>
                    <td>{{ $scholar->province }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" style="text-align: center;">No beneficiaries found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>