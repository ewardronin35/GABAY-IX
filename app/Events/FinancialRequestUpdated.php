<?php

namespace App\Events;

use App\Models\FinancialRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FinancialRequestUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $request;
    private $targetRole;

    /**
     * Create a new event instance.
     * We accept the request and a 'targetRole' (e.g., 'Budget', 'Accounting')
     * to notify the correct queue.
     */
    public function __construct(FinancialRequest $financialRequest, string $targetRole = null)
    {
        $this->request = $financialRequest;
        $this->targetRole = $targetRole;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            // Always notify the original user who submitted the request
            // This is a private channel for 'User.1', 'User.2', etc.
            new PrivateChannel('User.' . $this->request->user_id),
        ];

        // If a target role is specified, notify everyone with that role
        // This is a private channel for 'Role.Budget', 'Role.Accounting', etc.
        if ($this->targetRole) {
            $channels[] = new PrivateChannel('Role.' . $this->targetRole);
        }

        return $channels;
    }
    
    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        // This is the name our frontend will listen for
        return 'financial-request.updated';
    }
}