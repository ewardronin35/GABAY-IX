<!DOCTYPE html>
<html>
<head>
    <title>TDP Masterlist Report</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        @page { 
            /* Reduced margins to maximize space for larger text */
            margin: 10px 10px; 
            size: legal landscape; 
        }
        body { 
            font-family: 'Helvetica', sans-serif; 
            font-size: 10px; /* ✅ Increased from 8px */
            color: #000; 
        }
        
        /* HEADER */
        .header-table { 
            width: 100%; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #0056b3; 
            padding-bottom: 5px; 
        }
        .header-table td { text-align: center; vertical-align: middle; }
        .header-logo { height: 55px; width: auto; } /* Slightly larger logo */
        
        .republic { font-size: 10px; }
        .commission { font-family: 'Times New Roman', serif; font-size: 12px; font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; color: #0056b3; margin-top: 2px; }
        .subtitle { font-size: 10px; font-style: italic; }

        /* DATA TABLE */
        table.data { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            table-layout: fixed; 
        }
        table.data th, table.data td { 
            border: 1px solid #444; 
            padding: 4px; /* More padding for readability */
            text-align: left; 
            vertical-align: top;
            word-wrap: break-word; 
            overflow-wrap: break-word;
        }
        table.data th { 
            background-color: #0056b3; 
            color: #fff; 
            text-align: center; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 9px; /* ✅ Increased from 7px */
        }
        table.data td { 
            font-size: 9px; /* ✅ Increased from 7px */
        }
        
        .center { text-align: center !important; }
        .right { text-align: right !important; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td width="15%"><img src="{{ public_path('images/ched-logo.png') }}" class="header-logo"></td>
            <td width="70%">
                <div class="republic">Republic of the Philippines</div>
                <div class="commission">COMMISSION ON HIGHER EDUCATION</div>
                <div class="republic" style="font-weight:bold;">REGIONAL OFFICE IX</div>
                <div class="title">TULONG DUNONG PROGRAM (TDP) MASTERLIST</div>
                <div class="subtitle">Generated on: {{ date('F d, Y h:i A') }}</div>
                @if(isset($filters['academic_year']) && $filters['academic_year'] !== 'all')
                    <div class="subtitle">Academic Year: {{ $filters['academic_year'] }}</div>
                @endif
            </td>
            <td width="15%"><img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" class="header-logo"></td>
        </tr>
    </table>

    @if(count($records) > 0)
    <table class="data">
        <thead>
            <tr>
                <th width="3%">Seq</th>
                <th width="7%">Region</th>
                <th width="8%">Province</th>
                <th width="8%">City</th>
                <th width="16%">HEI Name</th>
                <th width="9%">Award No</th>
                <th width="9%">Last Name</th>
                <th width="9%">First Name</th>
                <th width="6%">Mid</th> <th width="12%">Course</th>
                <th width="3%">Yr</th>
                <th width="5%">Stat</th> <th width="5%">Amt</th> </tr>
        </thead>
        <tbody>
            @foreach($records as $record)
                @php 
                    $scholar = $record->enrollment?->scholar; 
                    $address = $scholar?->address;
                    
                    // Fallback to text column if ID relationship is null
                    $regionName = $address?->region?->name ?? $address?->getAttribute('region') ?? '-';
                    $provinceName = $address?->province?->name ?? $address?->getAttribute('province') ?? '-';
                    $cityName = $address?->city?->name ?? $address?->getAttribute('town_city') ?? '-';
                @endphp
                <tr>
                    <td class="center">{{ $record->seq }}</td>
                    <td>{{ $regionName }}</td>
                    <td>{{ $provinceName }}</td>
                    <td>{{ $cityName }}</td>
                    
                    <td>{{ $record->hei?->hei_name }}</td>
                    <td class="center">{{ $record->enrollment?->award_number }}</td>
                    
                    <td>{{ $scholar?->family_name }}</td>
                    <td>{{ $scholar?->given_name }}</td>
                    <td>{{ $scholar?->middle_name }}</td>
                    
                    <td>{{ $record->course?->course_name }}</td>
                    <td class="center">{{ $record->year_level }}</td>
                    
                    <td class="center">{{ $record->payment_status }}</td>
                    <td class="right">{{ number_format($record->grant_amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @else
        <div style="text-align: center; margin-top: 50px; font-style: italic; font-size: 12px;">
            No records found for the selected filters.
        </div>
    @endif

</body>
</html>