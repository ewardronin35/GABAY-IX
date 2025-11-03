<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Financials</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; }
        .container { width: 90%; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { font-size: 24px; color: #333; }
        .content { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .total { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Pending Financials Summary</h1>
        <div class="content">
            <p>Hello,</p>
            <p>Here is a summary of all financial requests currently pending approval as of {{ date('F d, Y') }}:</p>

            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Pending Requests</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Budget</td>
                        <td>{{ $pendingCounts['Budget'] }}</td>
                    </tr>
                    <tr>
                        <td>Accounting</td>
                        <td>{{ $pendingCounts['Accounting'] }}</td>
                    </tr>
                    <tr>
                        <td>Cashier</td>
                        <td>{{ $pendingCounts['Cashier'] }}</td>
                    </tr>
                    <tr class="total">
                        <td>Total Pending</td>
                        <td>{{ $pendingCounts['Total'] }}</td>
                    </tr>
                </tbody>
            </table>

            <p style="margin-top: 20px;">
                Please log in to the system to review and process these items.
            </p>
            <p>Thank you.</p>
        </div>
    </div>
</body>
</html>