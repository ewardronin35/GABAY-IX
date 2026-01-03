<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Notice of Award</title>
    <style>
        /* --- PAGE MARGINS (Standard Legal/A4) --- */
        @page {
            margin: 30px 40px 40px 40px; 
        }
        
        body {
            font-family: "Prima Sans Roman", "Arial", sans-serif;
            font-size: 9pt;
            line-height: 1.1; /* Tighter line height for official look */
            color: #000;
        }

        /* Wrapper to allow absolute positioning per page */
        .page-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .page-break {
            page-break-after: always;
        }

        /* --- CORNER LABELS (Absolute Layout) --- */
        .top-left-label {
            position: absolute;
            top: -10px;
            left: 0;
            font-size: 8pt;
            font-weight: bold;
            text-align: left;
            line-height: 1.2;
        }

        .top-right-label {
            position: absolute;
            top: -10px;
            right: 0;
            font-size: 8pt;
            font-weight: bold;
            text-align: right;
            line-height: 1.2;
        }

        /* --- HEADER LOGOS & TEXT --- */
        table.header-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px; /* Pushes down to clear corner labels */
            margin-bottom: 15px;
        }

        table.header-table td {
            vertical-align: middle;
            padding: 0;
        }

        /* LEFT: Logos (BP + CHED) */
        td.header-left {
            width: 20%;
            text-align: left;
            white-space: nowrap;
        }

        /* CENTER: Agency Text */
        td.header-center {
            width: 60%;
            text-align: center;
        }

        /* RIGHT: UniFAST Logo */
        td.header-right {
            width: 20%;
            text-align: right;
        }

        /* Logo Images - Sizing */
        .logo-bp {
            height: 50px;
            width: auto;
            margin-right: 4px;
            vertical-align: middle;
            display: inline-block;
        }

        .logo-ched {
            height: 50px;
            width: auto;
            vertical-align: middle;
            display: inline-block;
        }

        .logo-unifast {
            height: 45px;
            width: auto;
            vertical-align: middle;
            display: inline-block;
        }

        /* Header Text Typography */
        .text-republic {
            font-size: 8pt;
            font-weight: normal;
            margin-bottom: 2px;
            font-family: "Times New Roman", serif; /* Often distinct in official docs */
        }
        .text-ched {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
            font-family: "Arial", sans-serif;
        }
        .text-unifast {
            font-size: 7pt;
            font-weight: bold;
            color: #d32f2f; /* UniFAST Red (Optional, remove if BW print needed) */
            color: #000; /* Fallback to black */
            text-transform: uppercase;
        }

        /* --- MAIN TITLES --- */
        .title-section {
            text-align: center;
            margin-bottom: 20px;
        }

        .program-title {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .program-sub {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .noa-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
        }

        /* --- RECIPIENT --- */
        .date-line {
            text-align: right;
            margin-bottom: 15px;
        }

        .recipient-info {
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        .recipient-name {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10pt;
        }
        
        .recipient-address {
            font-size: 9pt;
            text-transform: capitalize;
        }

        /* --- BODY TEXT --- */
        .body-paragraph {
            text-align: justify;
            margin-bottom: 10px;
            text-indent: 30px; /* Indent start of paragraphs */
        }

        .body-paragraph strong {
            font-weight: bold;
        }

        /* --- LIST --- */
        ul.conditions {
            padding-left: 30px;
            margin-top: 5px;
            margin-bottom: 10px;
        }
        ul.conditions li {
            text-align: justify;
            margin-bottom: 4px;
            list-style-type: disc;
        }

        /* --- SIGNATORY --- */
        .closing {
            margin-top: 25px;
            margin-bottom: 25px;
        }
        
        .signatory-name {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10pt;
        }
        .signatory-title {
            font-size: 9pt;
        }

        /* --- FOOTER --- */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7pt;
            font-style: italic;
            font-weight: bold;
        }
    </style>
</head>
<body>
    @foreach($scholars_data as $index => $data)
        <div class="page-container {{ !$loop->last ? 'page-break' : '' }}">

            <div class="top-left-label">
                CHED-UniFAST-NOA<br>
                2024 Version
            </div>

            <div class="top-right-label">
                Annex 10-NOA<br>
                Batch {{ $data['record']->batch_no ?? 'N/A' }}
            </div>

            <table class="header-table">
                <tr>
                    <td class="header-left">
                    <img src="{{ public_path('images/unifast logo.png') }}" class="logo-unifast" alt="UniFAST">
                        <img src="{{ public_path('images/ched-logo.png') }}" class="logo-ched" alt="CHED">
                    </td>
                    
                    <td class="header-center">
                        <div class="text-republic">Republic of the Philippines</div>
                        <div class="text-ched">COMMISSION ON HIGHER EDUCATION</div>
                        <div class="text-unifast">Unified Student Financial Assistance System for Tertiary Education</div>
                    </td>

                    <td class="header-right">
                       
                    
                                            <img src="{{ public_path('Logo2.png') }}" class="logo-bp" alt="Bagong Pilipinas">
    
                
                </td>
                </tr>
            </table>

            <div class="title-section">
                <div class="program-title">TULONG DUNONG PROGRAM</div>
                <div class="program-sub">TDP</div>
                <div class="noa-title">NOTICE OF AWARD (NOA)</div>
            </div>

            <div class="date-line">
                Date: {{ now()->format('F d, Y') }}
            </div>

            <div class="recipient-info">
                <div class="recipient-name">
                    {{ $data['scholar']->given_name }} 
                    {{ $data['scholar']->middle_name ? substr($data['scholar']->middle_name, 0, 1) . '.' : '' }} 
                    {{ $data['scholar']->family_name }}
                </div>
             <div class="recipient-address">
        {{-- 1. specific_address --}}
        {{ $data['scholar']->address?->specific_address }} 
        
        {{-- 2. FIX: Access the 'barangay' property INSIDE the relationship object --}}
        {{-- Based on your error image, the column name inside the object is also "barangay" --}}
        {{ $data['scholar']->address?->barangay->barangay ?? $data['scholar']->address?->barangay->name ?? '' }}
        
        {{-- 3. town_city (Only show comma if city exists) --}}
        @if($data['scholar']->address?->town_city)
            {{ $data['scholar']->address->town_city }},
        @endif
        
        {{-- 4. province and zip --}}
        {{ $data['scholar']->address?->province }} 
        {{ $data['scholar']->address?->zip_code }}
    </div>
            </div>

            <div class="body-paragraph">
                Dear Mr./Ms. <strong>{{ strtoupper($data['scholar']->family_name) }}</strong>:
            </div>

            <div class="body-paragraph">
                We are pleased to inform you that you are qualified as a TDP-TES grantee with <strong>Award No. {{ $data['enrollment']->award_number }}</strong>. 
                Subject to availability of funds as provided in the General Appropriations Act and provisions of issuances issued by CHED/UniFAST, 
                you will receive <strong>(PhP 7,500.00)</strong> per semester starting the <strong>{{ $data['record']->semester->name ?? 'N/A' }} of AY {{ $data['record']->academicYear->name ?? 'N/A' }}</strong>. 
                Once qualified, a TDP grantee will continue to receive grants provided that you are enrolled every semester and complies with the 
                documentary requirements, and retention policy of his Higher Education Institution pursuant to the maximum residency rule.
            </div>

            <div class="body-paragraph">
                As TDP-TES grantee, you must comply with the following conditions:
            </div>

            <ul class="conditions">
                <li>Meet the retention policy of your HEI;</li>
                <li>Secure approval from this CHED Regional Office (CHEDRO) for the deferment of your grant or your transfer to another program or College/University;</li>
                <li>Secure an approved leave of absence (LOA) in case of unforeseen circumstances that may prevent enrollment for one term, such as health issues, personal emergencies, or other significant commitments requiring temporary withdrawal from academic responsibilities.</li>
                <li>Complete the degree program on time or a year after the period prescribed in their program pursuant to the maximum residency rule;</li>
                <li>Submit only genuine and not falsified or fake documents; and</li>
                <li>Not avail of multiple national government-funded assistance, except for Free Higher Education in SUCs and LUCs under R.A. No. 10931 or the Universal Access to Quality Tertiary Education Act and DSWD Assistance to Individuals in Crisis Situation (AICS).</li>
            </ul>

            <div class="body-paragraph">
                Please be advised that failure to comply with the above conditions will be grounds for the termination of your grants per Sec.9 of the UniFAST Memorandum Order No. 3 series 2024.
            </div>

            <div class="closing">Very truly yours,</div>

            <div class="signatory-section">
                <div class="signatory-name">MARIVIC V. IRIBERRI</div>
                <div class="signatory-title">Officer-in-Charge, Office of the Director IV</div>
                <div class="signatory-title">CHED Regional Office IX</div>
            </div>

            <div class="footer">
                ***This Notice of Award is not for sale and is issued only once to qualified applicants.***
            </div>

        </div>
    @endforeach
</body>
</html>