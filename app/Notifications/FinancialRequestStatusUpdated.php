<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\FinancialRequest; // ✨ Import the model

class FinancialRequestStatusUpdated extends Notification
{
    use Queueable;

    protected $financialRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(FinancialRequest $financialRequest) // ✨ Accept the request
    {
        $this->financialRequest = $financialRequest;
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
        
        // Make the status human-readable (e.g., "pending_accounting" -> "Pending Accounting")
        $status = ucwords(str_replace('_', ' ', $request->status));
        $subject = "Your Financial Request has been {$status}";

        $message = (new MailMessage)
                    ->subject($subject)
                    ->greeting("Hello, {$notifiable->name}!")
                    ->line("The status of your financial request '{$request->title}' has been updated.");

        // Add different lines based on the status
        if ($request->status === 'rejected') {
            $message->line("New Status: Rejected")
                    ->line("Remarks: \"{$request->remarks}\"")
                    ->error(); // This makes the email red
        } elseif ($request->status === 'completed') {
             $message->line("New Status: Completed")
                    ->line("Your request has been paid by the cashier.")
                    ->success(); // This makes the email green
        } else {
            $message->line("New Status: {$status}");
        }

        // Add a button to view their requests
        $message->action('View My Requests', route('financial.index'));

        return $message;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}