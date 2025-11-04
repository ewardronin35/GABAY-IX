<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\FinancialRequest; // ✨ Import the model

class NewRequestInQueue extends Notification
{
    use Queueable;

    protected $financialRequest;
    protected $roleName; // e.g., 'accounting', 'cashier'

    /**
     * Create a new notification instance.
     */
    public function __construct(FinancialRequest $financialRequest, string $roleName)
    {
        $this->financialRequest = $financialRequest;
        $this->roleName = $roleName;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $request = $this->financialRequest;
        $roleName = $this->roleName;
        $queueStatus = "pending_{$roleName}";
        
        // Build the correct route name, e.g., 'accounting.all-requests'
        $routeName = strtolower($roleName) . ".all-requests";
        $url = route($routeName, ['status' => $queueStatus]);

        return (new MailMessage)
                    ->subject("New Financial Request in Your Queue")
                    ->greeting("Hello, {$notifiable->name}!")
                    ->line("A new financial request, '{$request->title}', is now in your queue and requires your review.")
                    ->line("Amount: ₱" . number_format($request->amount, 2))
                    ->line("Submitted by: {$request->user->name}")
                    ->action('View Your Queue', $url);
    }
}