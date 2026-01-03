<!DOCTYPE html>
<html>
<head>
    <title>Driver's Trip Ticket</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-weight: bold; font-size: 16px; text-transform: uppercase; margin-bottom: 5px; }
        .sub { font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; width: 30%; }
        .signatures { margin-top: 40px; display: table; width: 100%; }
        .sig-box { display: table-cell; width: 50%; text-align: center; }
        .line { border-bottom: 1px solid #000; width: 80%; margin: 40px auto 5px auto; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Driver's Trip Ticket</div>
        <div class="sub">CHED REGIONAL OFFICE IX</div>
        <div class="sub">Government Center, Balintawak, Pagadian City</div>
    </div>

    <table>
        <tr>
            <th>Ticket No.</th>
            <td style="font-weight: bold; color: red;">{{ str_pad($ticket->id, 6, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <th>Date of Travel</th>
            <td>{{ \Carbon\Carbon::parse($ticket->date_of_travel)->format('F d, Y') }}</td>
        </tr>
        <tr>
            <th>Driver's Name</th>
            <td style="text-transform: uppercase;">{{ $ticket->driver_name }}</td>
        </tr>
        <tr>
            <th>Vehicle / Plate No.</th>
            <td style="text-transform: uppercase;">{{ $ticket->vehicle_plate }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <th>Destination</th>
            <td>{{ $ticket->destination }}</td>
        </tr>
        <tr>
            <th>Purpose</th>
            <td>{{ $ticket->purpose }}</td>
        </tr>
        <tr>
            <th>Authorized Passengers</th>
            <td>{{ $ticket->passengers }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <th>Departure Time</th>
            <td>{{ \Carbon\Carbon::parse($ticket->departure_time)->format('h:i A') }}</td>
            <th>Return Time</th>
            <td>__________________</td>
        </tr>
        <tr>
            <th>Odometer Start</th>
            <td>__________________</td>
            <th>Odometer End</th>
            <td>__________________</td>
        </tr>
        <tr>
            <th>Fuel Balance (Start)</th>
            <td>__________________</td>
            <th>Fuel Issued</th>
            <td>__________________</td>
        </tr>
    </table>

    <div class="signatures">
        <div class="sig-box">
            <p>Requested by:</p>
            <div class="line"></div>
            <p style="text-transform: uppercase; font-weight: bold;">{{ Auth::user()->name }}</p>
            <p>Requesting Official</p>
        </div>
        <div class="sig-box">
            <p>Approved by:</p>
            <div class="line"></div>
            <p style="font-weight: bold;">ENGR. JANENY B. DOMINGSIL</p>
            <p>OIC-Chief Admin Officer</p>
        </div>
    </div>
    
    <div style="margin-top: 30px; font-size: 10px; text-align: center; font-style: italic;">
        This ticket must be filled out before departure. Valid only for the date specified.
    </div>
</body>
</html>