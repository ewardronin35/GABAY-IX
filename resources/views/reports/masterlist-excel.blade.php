<table>
    <thead>
        <tr>
            {{-- This merged cell will act as the main title --}}
            <th colspan="9" style="text-align: center; font-weight: bold; font-size: 14px;">COMMISSION ON HIGHER EDUCATION</th>
        </tr>
        <tr>
            <th colspan="9" style="text-align: center; font-weight: bold; font-size: 12px;">COSCHO Scholarship Masterlist</th>
        </tr>
        <tr>
            {{-- This row is intentionally left blank for spacing --}}
        </tr>
        <tr>
            {{-- These are the actual column headers --}}
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
                <td>{{ $scholar['region'] ?? '' }}</td>
                <td>{{ $scholar['award_no'] ?? '' }}</td>
                <td>{{ $scholar['last_name'] ?? '' }}</td>
                <td>{{ $scholar['first_name'] ?? '' }}</td>
                <td>{{ $scholar['middle_name'] ?? '' }}</td>
                <td>{{ $scholar['sex'] ?? '' }}</td>
                <td>{{ $scholar['hei'] ?? '' }}</td>
                <td>{{ $scholar['course'] ?? '' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>