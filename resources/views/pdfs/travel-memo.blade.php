<!DOCTYPE html>
<html>
<head>
    <title>Travel Authority Memo</title>
    <style>
        body { font-family: 'Arial', sans-serif; font-size: 11pt; margin: 0.5in; }
        .header { text-align: center; margin-bottom: 30px; }
        .header img { height: 80px; vertical-align: middle; margin: 0 10px; }
        .header-text { display: inline-block; vertical-align: middle; }
        .title { text-align: center; font-weight: bold; text-transform: uppercase; margin: 30px 0; font-size: 14pt; }
        .content { margin-top: 20px; line-height: 1.6; }
        .field-group { margin-bottom: 15px; }
        .label { font-weight: bold; text-transform: uppercase; }
        .signatory { margin-top: 60px; }
        .signatory-name { font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
        .footer-line { border-top: 1px solid black; margin-top: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <img src="{{ public_path('chedlogo.png') }}" alt="CHED">
        <div class="header-text">
            <div>Republic of the Philippines</div>
            <div style="font-weight: bold; font-size: 12pt;">COMMISSION ON HIGHER EDUCATION</div>
            <div style="font-weight: bold; font-size: 14pt;">REGIONAL OFFICE IX</div>
        </div>
        <img src="{{ public_path('Logo2.png') }}" alt="Bagong Pilipinas">
    </div>

    <div class="title">TRAVEL AUTHORITY</div>

    <div class="content">
        <p>{{ date('F d, Y') }}</p> <div class="field-group" style="margin-top: 30px;">
            <span class="label">MEMORANDUM TO:</span>
            <div style="margin-left: 0px; margin-top: 10px;">
                <div style="font-weight: bold; font-size: 12pt;">{{ strtoupper($order->official_name) }}</div>
                <div>{{ $order->position }}</div>
            </div>
        </div>

        <div class="footer-line"></div>

        <p style="text-align: justify; margin-top: 20px;">
            You are hereby directed to proceed to <b>{{ $order->destination }}</b> on 
            <b>{{ date('F d, Y', strtotime($order->date_from)) }} to {{ date('F d, Y', strtotime($order->date_to)) }}</b> 
            (inclusive of travel time).
        </p>

        <p style="text-align: justify;">
            The purpose of this travel is: <br>
            <i>{{ $order->purpose }}</i>
        </p>

        <p style="text-align: justify;">
            Expenses incurred during this travel shall be charged against 
            <b>{{ $order->subAllotment ? $order->subAllotment->description : 'Local Funds' }}</b>, 
            subject to usual accounting and auditing rules and regulations.
        </p>
    </div>

    <div class="signatory">
        <div class="signatory-name">MARIVIC V. IRIBERRI</div>
        <div>Officer-in-Charge, Office of the Director IV</div>
    </div>

</body>
</html>