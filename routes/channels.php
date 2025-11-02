<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User; // ✨ Import User
/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// ✨ ADD THIS CODE
// This authorizes your 'stufaps-database' private channel.
Broadcast::channel('stufaps-database', function ($user) {
    // Only allow users with these roles to listen to the channel.
    // Adjust the roles as needed.
    return $user->hasRole(['Super Admin', 'Records Officer', 'Encoder']);
});

Broadcast::channel('User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// ✨ ADD THIS CHANNEL for notifying roles
Broadcast::channel('Role.{roleName}', function (User $user, $roleName) {
    // This checks if the authenticated user has the specified role
    return $user->hasRole($roleName);
});