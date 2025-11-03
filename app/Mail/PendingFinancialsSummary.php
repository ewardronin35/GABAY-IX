<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection; // ✨ Import Collection

class PendingFinancialsSummary extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The pending request data.
     *
     * @var array
     */
    public $pendingCounts;

    /**
     * Create a new message instance.
     */
    public function __construct(array $pendingCounts)
    {
        $this->pendingCounts = $pendingCounts;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Weekly Pending Financials Summary',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            // We will create this view next
            view: 'mail.pending-financials-summary',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}