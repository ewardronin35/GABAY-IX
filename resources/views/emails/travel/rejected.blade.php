<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Travel Order Returned</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        
        <tr>
            <td style="padding: 25px 30px; border-bottom: 4px solid #b91c1c; background-color: #ffffff;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td width="60" style="vertical-align: middle;">
                            <img src="{{ $message->embed(public_path('chedlogo.png')) }}" alt="CHED Logo" width="60" style="display: block;">
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Republic of the Philippines</p>
                            <h2 style="margin: 2px 0 0; font-size: 16px; font-weight: 700; color: #111827; text-transform: uppercase;">Commission on Higher Education</h2>
                            <p style="margin: 2px 0 0; font-size: 12px; font-weight: bold; color: #b91c1c;">REGIONAL OFFICE IX</p>
                        </td>
                        <td width="60" style="vertical-align: middle; text-align: right;">
                            <img src="{{ $message->embed(public_path('Logo2.png')) }}" alt="Bagong Pilipinas" width="60" style="display: block; margin-left: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <tr>
            <td style="background-color: #fef2f2; padding: 15px; text-align: center; border-bottom: 1px solid #fecaca;">
                <h2 style="color: #991b1b; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Status: <span style="font-weight: 900;">RETURNED</span></h2>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px;">
                <p style="color: #374151; font-size: 15px; margin-top: 0;">
                    {{-- ✨ FIX: Fallback to user->name if official_name is null --}}
                    Good day, <strong>{{ $order->official_name ?? $order->user->name }}</strong>.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    The request for Authority to Travel has been returned.
                </p>

                <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0 0 5px; font-size: 13px; color: #6b7280;"><strong>Name of Official:</strong> <span style="color: #111827; text-transform: uppercase;">{{ $order->official_name ?? $order->user->name }}</span></p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Destination:</strong> <span style="color: #111827;">{{ $order->destination }}</span></p>
                </div>

                <div style="background-color: #fff1f2; border-left: 4px solid #fb7185; padding: 20px; margin: 25px 0;">
                    <p style="color: #881337; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 5px;">Remarks / Action Required:</p>
                    <p style="color: #be123c; font-size: 16px; font-style: italic; margin: 0; font-weight: 500;">
                        "{{ $order->rejection_reason }}"
                    </p>
                </div>

                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Please update your request with the necessary corrections or contact the Budget Office for clarification.
                </p>

                <div style="text-align: center; margin-top: 35px;">
                    <a href="{{ route('travel-orders.show', $order->id) }}" style="background-color: #4b5563; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                        View Request Details
                    </a>
                </div>
            </td>
        </tr>

        <tr>
            <td style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.5;">
                    &copy; {{ date('Y') }} Commission on Higher Education - Region IX.<br>
                    This is an automated system notification.
                </p>
            </td>
        </tr>
    </table>

</body>
</html>