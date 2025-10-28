<!DOCTYPE html>
<html>
<head>
    <title>COSCHO Masterlist</title>
    <style>
        /* ✅ General page and font setup */
        @page { margin: 20px 25px; }
        body { font-family: 'Helvetica', sans-serif; color: #333; }

        /* ✅ Header styling */
        .header-table { width: 100%; border: none; }
        .header-table td { text-align: center; border: none; vertical-align: middle; }
        .header-table img { height: 65px; }
        .header-text p { margin: 0; }
        .republic { font-size: 10px; }
        .commission { font-family: 'Times New Roman', serif; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; }
        .title { font-family: 'Times New Roman', serif; font-size: 14px; font-weight: bold; }

        /* ✅ Main content table styling */
        .content-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 15px; }
        .content-table th, .content-table td { border: 1px solid #999; padding: 5px; text-align: left; }
        .content-table thead { background-color: #E0E0E0; }
        .content-table thead th { font-weight: bold; color: #000; }
        
        /* ✨ NEW: Zebra striping for better readability */
        .content-table tbody tr:nth-child(even) { background-color: #f8f8f8; }

        /* ✨ NEW: Footer styling */
        footer { position: fixed; bottom: -10px; left: 0px; right: 0px; height: 50px; font-size: 9px; text-align: center; }
        .page-number:before { content: "Page " counter(page); }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width:20%;"><img src="{{ public_path('images/ched-logo.png') }}" alt="CHED Logo"></td>
            <td style="width:60%;" class="header-text">
                <p class="republic">Republic of the Philippines</p>
                <p class="commission">COMMISSION ON HIGHER EDUCATION</p>
                <p class="title">COSCHO Scholarship MASTERLIST</p>
            </td>
            <td style="width:20%;"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" alt="Bagong Pilipinas Logo"></td>
        </tr>
    </table>

    <table class="content-table">
        <thead>
            <tr>
                <th>No.</th>
                <th>Award No.</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>HEI</th>
                <th>Course</th>
                <th>Region</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($scholars as $index => $scholar)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $scholar['award_no'] }}</td>
                    <td>{{ $scholar['last_name'] }}</td>
                    <td>{{ $scholar['first_name'] }}</td>
                    <td>{{ $scholar['hei'] }}</td>
                    <td>{{ $scholar['course'] }}</td>
                    <td>{{ $scholar['region'] }}</td>
                    <td>{{ $scholar['status'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <footer>
        <p>Generated on: {{ date('F d, Y h:i A') }} | <span class="page-number"></span></p>
    </footer>

</body>
</html>