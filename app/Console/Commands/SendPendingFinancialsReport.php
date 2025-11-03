<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FinancialRequest; // ✨ Import
use App\Models\User; // ✨ Import
use App\Mail\PendingFinancialsSummary; // ✨ Import
use Illuminate\Support\Facades\Mail; // ✨ Import

class SendPendingFinancialsReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-pending-financials-report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends a weekly summary of pending financial requests to management.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Gathering pending financial requests...');

        // 1. Get counts for each pending status
        $budgetCount = FinancialRequest::where('status', 'pending_budget')->count();
        $accountingCount = FinancialRequest::where('status', 'pending_accounting')->count();
        $cashierCount = FinancialRequest::where('status', 'pending_cashier')->count();
        $total = $budgetCount + $accountingCount + $cashierCount;

        // If there are no pending items, don't send an email
        if ($total === 0) {
            $this->info('No pending requests. No email sent.');
            return 0;
        }

        $pendingCounts = [
            'Budget' => $budgetCount,
            'Accounting' => $accountingCount,
            'Cashier' => $cashierCount,
            'Total' => $total,
        ];

        // 2. Get all management users
        $managementRoles = ['Super Admin', 'Chief', 'RD'];
        $recipients = User::role($managementRoles)->get();

        if ($recipients->isEmpty()) {
            $this->warn('No users found with roles: Super Admin, Chief, or RD. No email sent.');
            return 0;
        }
        
        $this->info("Found {$recipients->count()} recipients. Sending emails...");

        // 3. Send the email to each recipient
        foreach ($recipients as $user) {
            Mail::to($user->email)->send(new PendingFinancialsSummary($pendingCounts));
        }

        $this->info('Weekly pending financials report sent successfully!');
        return 0;
    }
}