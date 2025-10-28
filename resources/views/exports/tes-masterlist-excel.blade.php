<table>
    <thead>
        <tr>
            <th>SEQ</th><th>HEI NAME</th><th>HEI TYPE</th><th>HEI CITY/MUNICIPALITY</th><th>HEI PROVINCE</th><th>HEI DISTRICT</th><th>APP NO.</th><th>AWARD NO.</th>
            <th>LASTNAME</th><th>FIRSTNAME</th><th>EXTNAME</th><th>MIDDLENAME</th><th>SEX</th><th>COURSE/PROGRAM ENROLLED</th><th>YEAR LEVEL</th>
            <th>DATE DISBURSED</th><th>LDDAP</th><th>SEMESTER</th><th>YEAR</th>
        </tr>
    </thead>
    <tbody>
        @foreach($records as $record)
            <tr>
                <td>{{ $record->seq }}</td><td>{{ $record->hei?->hei_name }}</td><td>{{ $record->hei?->hei_type }}</td><td>{{ $record->hei?->city }}</td><td>{{ $record->hei?->province }}</td><td>{{ $record->hei?->district }}</td>
                <td>{{ $record->app_no }}</td><td>{{ $record->award_no }}</td><td>{{ $record->scholar?->family_name }}</td><td>{{ $record->scholar?->given_name }}</td><td>{{ $record->scholar?->extension_name }}</td>
                <td>{{ $record->scholar?->middle_name }}</td><td>{{ $record->scholar?->sex }}</td><td>{{ $record->course?->course_name }}</td><td>{{ $record->year_level }}</td>
                <td></td><td></td>{{-- Placeholders for Date Disbursed & LDDAP --}}
                <td>{{ $record->semester }}</td><td>{{ $record->academic_year }}</td>
            </tr>
        @endforeach
    </tbody>
</table>