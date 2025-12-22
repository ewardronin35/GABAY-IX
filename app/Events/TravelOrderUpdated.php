<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TravelOrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        // We don't need to send specific data, just a signal to refresh.
    }

    /**
     * Get the channels the event should broadcast on.
     * We use a public channel 'travel-orders' for simplicity.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('travel-orders'),
        ];
    }
}