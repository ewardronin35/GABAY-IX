<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Notice of Award</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.3; margin: 0.5in; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo-left { position: absolute; left: 0; top: 0; width: 80px; }
        .logo-right { position: absolute; right: 0; top: 0; width: 80px; }
        .title { font-weight: bold; text-transform: uppercase; margin-top: 10px; }
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .text-bold { font-weight: bold; }
        .indent { text-indent: 30px; }
        .mt-4 { margin-top: 20px; }
        .mb-4 { margin-bottom: 20px; }
        .cut-line { border-top: 1px dashed black; margin: 30px 0; padding-top: 20px; }
        .signatory { margin-top: 40px; }
        .return-slip { font-size: 10pt; }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/ched-logo.png') }}" class="logo-left">
        <img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" class="logo-right">
        <div>Republic of the Philippines</div>
        <div class="text-bold">OFFICE OF THE PRESIDENT</div>
        <div class="text-bold">COMMISSION ON HIGHER EDUCATION</div>
        <div>Regional Office IX</div>
        <br>
        <div class="text-bold">SCHOLARSHIP PROGRAM FOR COCONUT FARMERS</div>
        <div class="text-bold">AND THEIR FAMILIES (CoScho)</div>
    </div>

    <div class="text-center text-bold" style="font-size: 14pt; margin: 20px 0;">NOTICE OF AWARD</div>

    <div style="text-align: right;">{{ now()->format('F d, Y') }}</div>

    <div class="mt-4">
        <div class="text-bold uppercase">{{ $scholar->family_name }}, {{ $scholar->given_name }}</div>
        <div>{{ $address }}</div>
    </div>

    <div class="mt-4">Dear Mr./Ms. {{ $scholar->family_name }}:</div>

    <div class="mt-4 text-justify indent">
        We are pleased to inform you that you qualified as a CoScho scholar with Award No. <span class="text-bold">{{ $enrollment->award_number }}</span>. 
        This scholarship is effective {{ $enrollment->semester ?? '1st' }} Semester, AY {{ $enrollment->academic_year ?? '2025-2026' }} 
        with <span class="text-bold">₱40,000</span> benefits per semester and other financial benefits provided in the Commission on Higher Education 
        and Philippine Coconut Authority Joint Memorandum Circular No. 01, Series of 2023.
    </div>

    <div class="mt-4">Below are the responsibilities of a scholar and termination of scholarship:</div>

    <div class="mt-4 text-bold">Responsibilities:</div>
    <ul>
        <li>Execute a Scholarship Grant Contract with CHEDRO for the scholarship program;</li>
        <li>Enroll in identified recognized priority programs;</li>
        <li>Carry a regular load per semester/term as determined by the HEI;</li>
        <li>Pass all subjects enrolled;</li>
        <li>Maintain a GWA of at least 80% or its equivalent;</li>
        <li>Transfer only to the concerned HEI or shift to other priority program upon written approval; and</li>
        <li>Must not avail any other government funded student financial assistance program.</li>
    </ul>

    <div class="mt-4 text-justify indent">
        You are advised to constantly coordinate and communicate with CHED Regional Office (CHEDRO) regarding any concern with regards to your scholarship.
    </div>

    <div class="mt-4 text-justify indent">
        Finally, please signify your acceptance of this award by filling out the form below and submit the same to the CHEDRO within thirty (30) working days upon receipt.
    </div>

    <div class="signatory">
        Very truly yours,
        <br><br><br>
        <div class="text-bold uppercase">DR. MARIVIC V. IRIBERRI</div>
        <div>Officer-in-Charge, Office of the Director IV</div>
    </div>

    <div class="cut-line">
        <div class="text-center text-bold mb-4">(Please return this part to CHEDRO)</div>
        
        <div><span class="text-bold">DR. MARIVIC V. IRIBERRI</span></div>
        <div>Officer-in-Charge, Office of the Director IV</div>
        <div>Baliwasan Chico, Zamboanga City</div>

        <div class="mt-4">Sir/Madam:</div>

        <div class="mt-4 text-justify">
            Please be informed that I, <span class="text-bold uppercase">{{ $scholar->family_name }}, {{ $scholar->given_name }}</span>, 
            a resident of {{ $address }} is recipient of Scholarship Program for Coconut Farmers and their Families (CoScho).
        </div>

        <div class="mt-4">Please check (✓) one:</div>
        
        <div style="margin-left: 20px; margin-top: 10px;">
            ( &nbsp;&nbsp; ) Accept the scholarship with Award No. <span class="text-bold">{{ $enrollment->award_number }}</span>
        </div>
        <div style="margin-left: 20px; margin-top: 5px;">
            ( &nbsp;&nbsp; ) Defer my grant for __________ semester of academic year _______________.
        </div>
        <div style="margin-left: 20px; margin-top: 5px;">
            ( &nbsp;&nbsp; ) Reject/waive the grant.
        </div>

        <div class="signatory" style="margin-top: 50px; text-align: right;">
            <div style="border-top: 1px solid black; display: inline-block; width: 250px; text-align: center;">
                (Signature over printed name)
            </div>
        </div>
    </div>
</body>
</html>