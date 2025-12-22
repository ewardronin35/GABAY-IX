<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Travel Order Approved</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        
        <tr>
            <td style="padding: 25px 30px; border-bottom: 4px solid #1e3a8a; background-color: #ffffff;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td width="60" style="vertical-align: middle;">
                            <img src="{{ $message->embed(public_path('chedlogo.png')) }}" alt="CHED Logo" width="60" style="display: block;">
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</p>
                            <h2 style="margin: 2px 0 0; font-size: 16px; font-weight: 700; color: #111827; text-transform: uppercase;">Commission on Higher Education</h2>
                            <p style="margin: 2px 0 0; font-size: 12px; font-weight: bold; color: #1e3a8a;">REGIONAL OFFICE IX</p>
                        </td>
                        <td width="60" style="vertical-align: middle; text-align: right;">
                            <img src="{{ $message->embed(public_path('Logo2.png')) }}" alt="Bagong Pilipinas" width="60" style="display: block; margin-left: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <tr>
            <td style="background-color: #eff6ff; padding: 15px; text-align: center; border-bottom: 1px solid #bfdbfe;">
                <h2 style="color: #1e40af; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Authority to Travel: <span style="font-weight: 900;">APPROVED</span></h2>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px;">
                <p style="color: #374151; font-size: 15px; margin-top: 0;">
                    {{-- ✨ FIX: Fallback to user->name if official_name is null --}}
                    Good day, <strong>{{ $order->official_name ?? $order->user->name }}</strong>.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    We are pleased to inform you that the request for Authority to Travel to <strong>{{ $order->destination }}</strong> has been officially approved.
                </p>

                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-weight: bold;">Official Travel Order Code</p>
                    <p style="color: #0f172a; font-size: 32px; font-family: 'Courier New', monospace; font-weight: 700; margin: 0; letter-spacing: 2px;">{{ $order->travel_order_code }}</p>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                    <tr>
                        <td width="120" style="padding-bottom: 10px; color: #6b7280; font-size: 13px; font-weight: bold;">Name of Official:</td>
                        <td style="padding-bottom: 10px; color: #111827; font-size: 14px; text-transform: uppercase; font-weight: bold;">
                            {{-- ✨ FIX: Fallback here as well --}}
                            {{ $order->official_name ?? $order->user->name }}
                        </td>
                    </tr>
                    <tr>
                        <td width="120" style="padding-bottom: 10px; color: #6b7280; font-size: 13px; font-weight: bold;">Travel Period:</td>
                        <td style="padding-bottom: 10px; color: #111827; font-size: 14px;">
                            {{ $order->date_from->format('F d, Y') }} &mdash; {{ $order->date_to->format('F d, Y') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 10px; color: #6b7280; font-size: 13px; font-weight: bold; vertical-align: top;">Purpose:</td>
                        <td style="padding-bottom: 10px; color: #111827; font-size: 14px; line-height: 1.4;">
                            {{ $order->purpose }}
                        </td>
                    </tr>
                </table>

                <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>

                <div style="text-align: center;">
                    <p style="margin-bottom: 20px; font-size: 14px; color: #4b5563;">
                        Use the code above to file your reimbursement upon return.
                    </p>
                    <a href="{{ route('travel-claims.create', ['code' => $order->travel_order_code]) }}" style="background-color: #1e3a8a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                        File Reimbursement
                    </a>
                </div>
            </td>
        </tr>

        <tr>
            <td style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.5;">
                    &copy; {{ date('Y') }} Commission on Higher Education - Region IX.<br>
                    This is an automated system notification. Please do not reply.
                </p>
            </td>
        </tr>
    </table>

</body>
</html>