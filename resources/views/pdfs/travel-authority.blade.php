<!DOCTYPE html>
<html>
<head>
    <title>Authority to Travel</title>
    <style>
        body { font-family: 'Arial', sans-serif; font-size: 9pt; margin: 0.2in; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        td, th { border: 1px solid black; padding: 4px; vertical-align: top; }
        .no-border { border: none; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .red { color: red; }
        .header-logo { height: 60px; }
        .small { font-size: 8pt; }
        .box { width: 15px; height: 15px; border: 1px solid black; display: inline-block; margin-right: 5px; }
        .checked { background-color: black; }
    </style>
</head>
<body>

    <table class="no-border">
        <tr class="no-border">
            <td class="no-border text-center" width="15%">
                <img src="{{ public_path('chedlogo.png') }}" class="header-logo">
            </td>
            <td class="no-border text-center" width="70%">
                <div class="bold" style="font-size: 11pt;">COMMISSION ON HIGHER EDUCATION</div>
                <div class="small">Higher Education Development Center (HEDC) Building</div>
                <div class="small">C.P. Garcia Ave., Diliman, Quezon City</div>
            </td>
            <td class="no-border text-center" width="15%">
                <img src="{{ public_path('Logo2.png') }}" class="header-logo">
            </td>
        </tr>
    </table>

    <table class="no-border">
        <tr class="no-border">
            <td class="no-border text-right red bold small" width="15%">BOOKING REFERENCE:</td>
            <td class="no-border" width="20%" style="border-bottom: 1px solid black;">{{ $order->booking_reference }}</td>
            <td class="no-border text-right red bold small" width="30%">BASE FARE X NO. OF PASSENGERS:</td>
            <td class="no-border" width="35%" style="border-bottom: 1px solid black;">{{ $order->base_fare_notes }}</td>
        </tr>
    </table>

    <div class="text-center bold" style="font-size: 12pt; margin: 10px 0;">AUTHORITY TO TRAVEL</div>

    <table>
        <tr>
            <td colspan="2" width="70%">
                <div class="small">Name of Official/Employee:</div>
                <div class="bold" style="font-size: 11pt;">{{ strtoupper($order->official_name) }}</div>
            </td>
            <td width="30%">
                <div class="small">Position:</div>
                <div class="text-center bold">{{ $order->position }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="small">Office/Station:</div>
                <div class="text-center">{{ $order->office_station }}</div>
            </td>
            <td>
                <div class="small">Destination:</div>
                <div class="text-center bold">{{ $order->destination }}</div>
            </td>
            <td>
                <div class="small">Period of Travel:</div>
                <div class="text-center bold">
                    {{ date('M d', strtotime($order->date_from)) }} - {{ date('M d, Y', strtotime($order->date_to)) }}
                </div>
                <div class="text-center small">(Inclusive of travel time)</div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <div class="small">Purpose of Travel:</div>
                <div style="min-height: 40px;">{{ $order->purpose }}</div>
            </td>
            <td>
                <div class="small" style="margin-bottom: 5px;">&nbsp;</div>
                <div>
                    <span class="box {{ $order->is_official_business ? 'checked' : '' }}"></span> Official Business <br>
                    <span class="box {{ $order->is_official_time ? 'checked' : '' }}"></span> Official Time Only
                </div>
            </td>
        </tr>
    </table>

    <div class="small bold uppercase">* authorized to reimburse actual expenses</div>
    <div class="text-center bold" style="font-size: 10pt; border: 1px solid black; border-bottom: none; padding: 2px;">ESTIMATED EXPENSES</div>
    
    <table>
        <tr>
            <th class="text-center red small" width="20%">AIR FARE EXPENSES<br>with Travel Insurance</th>
            <th class="text-center small" width="20%">Training Fee/<br>Registration Fee</th>
            <th class="text-center small" width="20%">Travel Allowance</th>
            <th class="text-center small" width="20%">Total Amount</th>
            <th width="20%" rowspan="2" style="vertical-align: middle; padding-left: 10px;">
                <div class="small bold">Please check:</div>
                <br>
                <span class="box {{ $order->is_cash_advance ? 'checked' : '' }}"></span> Cash Advance <br>
                <span class="box {{ $order->is_reimbursement ? 'checked' : '' }}"></span> Reimbursement
            </th>
        </tr>
        <tr>
            <td class="text-right">{{ number_format($order->est_airfare, 2) }}</td>
            <td class="text-right">{{ number_format($order->est_registration, 2) }}</td>
            <td class="text-right">{{ number_format($order->est_per_diem, 2) }}</td>
            <td class="text-right bold">{{ number_format($order->total_estimated_cost, 2) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td width="33%" height="80">
                <div class="small">REQUESTED BY:</div>
                <div class="text-center" style="margin-top: 30px;">
                    <div class="bold">{{ strtoupper($order->official_name) }}</div>
                    <div class="small">{{ $order->position }}</div>
                </div>
            </td>
            <td width="33%">
                <div class="small">FUNDS AVAILABLE:</div>
                <div class="text-right bold small">{{ number_format($order->total_estimated_cost, 2) }}</div>
                <div class="text-center" style="margin-top: 15px;">
                    <div class="bold">KIMBERLY BUHIAN</div>
                    <div class="small">Administrative Officer III</div>
                    <div class="small">Budget Division</div>
                </div>
            </td>
            <td width="33%">
                <div class="small">APPROVED BY:</div>
                <div class="text-center" style="margin-top: 30px;">
                    <div class="bold">ATTY. MARCO CICERO F. DOMINGO</div>
                    <div class="small">Officer in Charge, Office of the Director IV</div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="small">Date:</td>
            <td class="small">Source of Funds: <span class="bold italic">Local Funds</span></td>
            <td class="small">Date:</td>
        </tr>
    </table>

    <table>
        <tr>
            <td width="50%" height="40">
                <div class="red bold small">ASSIGNED TRAVEL ARRANGER:</div>
            </td>
            <td width="50%">
                <div class="red bold small">APPROVED FOR ISSUANCE OF AIRLINE TICKET:</div>
            </td>
        </tr>
        <tr>
            <td colspan="2" height="40">
                <div class="red bold small">AIRLINE TICKET RECEIVED BY:</div>
            </td>
        </tr>
    </table>

</body>
</html>