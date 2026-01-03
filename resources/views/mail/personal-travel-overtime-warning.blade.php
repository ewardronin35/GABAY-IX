<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Travel Time Limit Exceeded</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { width: 90%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; }
        .header { font-size: 24px; color: #d97706; margin-bottom: 20px; }
        .content { margin-top: 20px; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .stats { background-color: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .stats-item { margin: 10px 0; }
        .stats-label { font-weight: bold; color: #6b7280; }
        .stats-value { color: #111827; font-size: 18px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">⚠️ Personal Travel Time Limit Exceeded</h1>

        <div class="content">
            <p>Hi {{ $user->name }},</p>

            <div class="warning-box">
                <strong>Heads up!</strong> You've exceeded your monthly personal travel time limit of 4 hours.
            </div>

            <div class="stats">
                <div class="stats-item">
                    <span class="stats-label">Month:</span>
                    <span class="stats-value">{{ now()->format('F Y') }}</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">Total Personal Travel Time:</span>
                    <span class="stats-value">
                        @php
                            $hours = floor($timeRecord->time_consumed_seconds / 3600);
                            $minutes = floor(($timeRecord->time_consumed_seconds % 3600) / 60);
                        @endphp
                        {{ $hours }}h {{ $minutes }}m
                    </span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">Overtime:</span>
                    <span class="stats-value" style="color: #dc2626;">
                        @php
                            $overtimeSeconds = $timeRecord->getOvertimeSeconds();
                            $overtimeHours = floor($overtimeSeconds / 3600);
                            $overtimeMinutes = floor(($overtimeSeconds % 3600) / 60);
                        @endphp
                        {{ $overtimeHours }}h {{ $overtimeMinutes }}m
                    </span>
                </div>
            </div>

            <p>
                <strong>What this means:</strong><br>
                The "Personal" travel option will be disabled for any new personnel locator slips for the rest of {{ now()->format('F Y') }}.
                You can still submit slips for official travel.
            </p>

            <p>
                If you believe this is an error or have questions, please contact your administrator.
            </p>

            <div class="footer">
                <p>This is an automated message from the CHED GABAY BRIDGE Personnel Locator System.</p>
                <p>Date: {{ now()->format('F d, Y h:i A') }}</p>
            </div>
        </div>
    </div>
</body>
</html>
