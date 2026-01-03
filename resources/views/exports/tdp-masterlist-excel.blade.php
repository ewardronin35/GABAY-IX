<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<table>
    <tr><td colspan="21"></td></tr>
    <tr>
        <td colspan="21" style="text-align: center; font-size: 10px; font-family: Arial, sans-serif;">Republic of the Philippines</td>
    </tr>
    <tr>
        <td colspan="21" style="text-align: center; font-size: 12px; font-weight: bold; font-family: Arial, sans-serif;">COMMISSION ON HIGHER EDUCATION</td>
    </tr>
    <tr>
        <td colspan="21" style="text-align: center; font-size: 11px; font-weight: bold; font-family: Arial, sans-serif;">REGIONAL OFFICE IX</td>
    </tr>
    <tr>
        <td colspan="21" style="text-align: center; font-size: 16px; font-weight: bold; color: #0056b3; font-family: Arial, sans-serif; height: 30px; vertical-align: middle;">TULONG DUNONG PROGRAM (TDP) MASTERLIST</td>
    </tr>
    <tr>
        <td colspan="21" style="text-align: center; font-size: 10px; font-style: italic; font-family: Arial, sans-serif;">Generated on: {{ date('F d, Y h:i A') }}</td>
    </tr>
    <tr><td colspan="21"></td></tr>

    <thead>
        <tr style="height: 35px;">
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">SEQ</th>
            
            {{-- LOCATION --}}
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">REGION</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">PROVINCE</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">CITY/MUN</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">DISTRICT</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">BARANGAY</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">ZIP</th>

            {{-- HEI --}}
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">HEI NAME</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">AWARD NO</th>

            {{-- PERSONAL --}}
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">LAST NAME</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">FIRST NAME</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">MIDDLE NAME</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">EXT</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">SEX</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">CONTACT</th>

            {{-- ACADEMIC --}}
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">COURSE</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">YEAR</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">AY</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">SEM</th>

            {{-- STATUS --}}
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">AMOUNT</th>
            <th style="background-color: #0056b3; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; vertical-align: middle;">STATUS</th>
        </tr>
    </thead>
    <tbody>
        @foreach($records as $record)
            @php
                $scholar = $record->enrollment?->scholar;
                $address = $scholar?->address;
            @endphp
            <tr>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->seq }}</td>
                
                {{-- Location --}}
                <td style="border: 1px solid #000000;">{{ $address?->region?->name ?? 'N/A' }}</td>
                <td style="border: 1px solid #000000;">{{ $address?->province?->name ?? 'N/A' }}</td>
                <td style="border: 1px solid #000000;">{{ $address?->city?->name ?? 'N/A' }}</td>
                <td style="border: 1px solid #000000;">{{ $address?->district?->name ?? 'N/A' }}</td>
                <td style="border: 1px solid #000000;">{{ $address?->barangay?->name ?? 'N/A' }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $address?->zip_code }}</td>

                {{-- HEI --}}
                <td style="border: 1px solid #000000;">{{ $record->hei?->hei_name }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->enrollment?->award_number }}</td>

                {{-- Personal --}}
                <td style="border: 1px solid #000000;">{{ $scholar?->family_name }}</td>
                <td style="border: 1px solid #000000;">{{ $scholar?->given_name }}</td>
                <td style="border: 1px solid #000000;">{{ $scholar?->middle_name }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $scholar?->extension_name }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $scholar?->sex }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $scholar?->contact_no }}</td>

                {{-- Academic --}}
                <td style="border: 1px solid #000000;">{{ $record->course?->course_name }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->year_level }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->academicYear?->name }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->semester?->name }}</td>

                {{-- Status --}}
                <td style="text-align: right; border: 1px solid #000000;">{{ number_format($record->grant_amount, 2) }}</td>
                <td style="text-align: center; border: 1px solid #000000;">{{ $record->payment_status }}</td>
            </tr>
        @endforeach
    </tbody>
</table>