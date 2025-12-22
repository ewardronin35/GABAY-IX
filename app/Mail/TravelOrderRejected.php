<?php

namespace App\Mail;

use App\Models\TravelOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TravelOrderRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(TravelOrder $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('❌ Action Required: Travel Request Returned')
                    ->view('emails.travel.rejected'); // Using custom HTML view
    }
}