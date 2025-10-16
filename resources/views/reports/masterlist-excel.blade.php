{{-- resources/views/exports/masterlist-excel.blade.php --}}

{{-- Note: No need for complex styles or public_path() here --}}
<table>
    <thead>
        <tr>
            <th colspan="9" style="text-align: center; font-weight: bold;">COMMISSION ON HIGHER EDUCATION</th>
        </tr>
        <tr>
            {{-- Add more header text rows as needed --}}
        </tr>
        <tr>
            <th>No.</th>
            <th>Region</th>
            <th>Award No.</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Sex</th>
            <th>HEI</th>
            <th>Course</th>
        </tr>
    </thead>
    <tbody>
        @foreach($scholars as $index => $scholar)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $scholar->region }}</td>
                <td>{{ $scholar->award_number }}</td>
                <td>{{ $scholar->family_name }}</td>
                <td>{{ $scholar->given_name }}</td>
                <td>{{ $scholar->middle_name }}</td>
                <td>{{ $scholar->sex }}</td>
                <td>{{ $scholar->education->hei_name ?? '' }}</td>
                <td>{{ $scholar->education->program ?? '' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>