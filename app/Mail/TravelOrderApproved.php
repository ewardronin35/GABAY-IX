<?php

namespace App\Mail;

use App\Models\TravelOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TravelOrderApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(TravelOrder $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('✅ Approved: Travel Order ' . $this->order->travel_order_code)
                    ->view('emails.travel.approved'); // Using custom HTML view
    }
}