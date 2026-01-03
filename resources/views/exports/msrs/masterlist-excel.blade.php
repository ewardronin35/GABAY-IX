<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<table>
    <tr>
        <td colspan="16" style="text-align: center; font-size: 10px; font-family: Arial, sans-serif;">Republic of the Philippines</td>
    </tr>
    <tr>
        <td colspan="16" style="text-align: center; font-size: 12px; font-weight: bold; font-family: Arial, sans-serif;">COMMISSION ON HIGHER EDUCATION</td>
    </tr>
    <tr>
        <td colspan="16" style="text-align: center; font-size: 11px; font-weight: bold; font-family: Arial, sans-serif;">REGIONAL OFFICE IX</td>
    </tr>
    <tr>
        <td colspan="16" style="text-align: center; font-size: 16px; font-weight: bold; color: #0056b3; font-family: Arial, sans-serif; height: 30px; vertical-align: middle;">
            MSRS MASTERLIST REPORT
        </td>
    </tr>
    <tr>
        <td colspan="16" style="text-align: center; font-size: 10px; font-style: italic; font-family: Arial, sans-serif;">
            Generated on: {{ date('F d, Y h:i A') }}
        </td>
    </tr>
    <tr><td colspan="16"></td></tr>

    <thead>
        <tr style="height: 30px; background-color: #0056b3; color: #ffffff; text-align: center;">
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 50px;">#</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 150px;">Award No</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 120px;">Last Name</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 120px;">First Name</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 100px;">Middle Name</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 50px;">Ext</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 50px;">Sex</th>
            
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 250px;">HEI Name</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 200px;">Course</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 80px;">Year</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 100px;">Sem</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 120px;">AY</th>
            
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 120px;">Grant Amount</th>
            
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 150px;">Province</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 150px;">City/Town</th>
            <th style="border: 1px solid #000000; font-weight: bold; vertical-align: middle; width: 100px;">Status</th>
        </tr>
    </thead>

    <tbody>
        @foreach($records as $index => $record)
            @php
                $enrollment = $record->enrollment;
                $scholar = $enrollment->scholar;
                $address = $scholar->address;
                $statusColor = in_array($enrollment->status, ['Enrolled', 'Validated', 'Active']) ? '#008000' : '#FF0000';
            @endphp
            <tr>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $index + 1 }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $enrollment->award_number }}</td>
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $scholar->family_name }}</td>
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $scholar->given_name }}</td>
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $scholar->middle_name }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $scholar->extension_name }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $scholar->sex }}</td>
                
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $record->hei->hei_name ?? '-' }}</td>
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $record->course->course_name ?? '-' }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $record->year_level }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $record->semester->name ?? '' }}</td>
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle;">{{ $record->academicYear->name ?? '' }}</td>
                
                <td style="text-align: right; border: 1px solid #000000; vertical-align: middle;">
                    {{ number_format($record->grant_amount, 2) }}
                </td>

                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $address->province->name ?? $address->province ?? '-' }}</td>
                <td style="border: 1px solid #000000; vertical-align: middle;">{{ $address->city->name ?? $address->town_city ?? '-' }}</td>
                
                <td style="text-align: center; border: 1px solid #000000; vertical-align: middle; font-weight: bold; color: {{ $statusColor }};">
                    {{ $record->validation_status }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>