<table>
    <thead><tr><th>SEQ</th><th>Award No.</th><th>Last Name</th><th>First Name</th><th>M.I.</th><th>HEI</th><th>Course</th><th>Status</th></tr></thead>
    <tbody>
        @foreach($records as $record)
            <tr>
                <td>{{ $record->seq }}</td><td>{{ $record->award_number }}</td><td>{{ $record->scholar?->family_name }}</td><td>{{ $record->scholar?->given_name }}</td>
                <td>{{ $record->scholar?->middle_name }}</td><td>{{ $record->hei?->hei_name }}</td><td>{{ $record->course?->course_name }}</td><td>{{ $record->status_type }}</td>
            </tr>
        @endforeach
    </tbody>
</table>