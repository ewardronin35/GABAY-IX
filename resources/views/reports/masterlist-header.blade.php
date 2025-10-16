{{-- resources/views/reports/masterlist-header.blade.php --}}
<style>
    /* Define fonts and basic styles */
    .header-container {
        font-family: sans-serif;
        width: 100%;
        text-align: center;
        margin-bottom: 20px;
    }
    .logo-left {
        float: left;
        width: 100px;
    }
    .logo-right {
        float: right;
        width: 100px;
    }
    .header-text {
        text-align: center;
        display: inline-block;
    }
    .fira-sans {
        font-family: 'Fira Sans', sans-serif; /* You might need to import this font */
        font-size: 11pt;
    }
    .georgia {
        font-family: 'Georgia', serif;
        font-size: 14pt;
        font-weight: bold;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
    }
</style>

<div class="header-container">
    {{-- Note: public_path() is needed for the PDF generator to find the image --}}
    <img src="{{ public_path('images/ched-logo.png') }}" class="logo-left" alt="CHED Logo">
    <img src="{{ public_path('images/bagong-pilipinas-logo.png') }}" class="logo-right" alt="Bagong Pilipinas Logo">
    
    <div class="header-text">
        <div class="fira-sans">Republic of the Philippines</div>
        <div class="fira-sans">OFFICE OF THE PRESIDENT</div>
        <div class="georgia">COMMISSION ON HIGHER EDUCATION</div>
    </div>
</div>