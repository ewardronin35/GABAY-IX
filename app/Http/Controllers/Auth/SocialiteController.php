<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // We need to import the Log class
use Laravel\Socialite\Facades\Socialite;
use Throwable; // Import Throwable to catch any type of error

class SocialiteController extends Controller
{
    public function redirect(string $provider): RedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

   // In SocialiteController.php

public function callback(string $provider): RedirectResponse
{
    try {
        $socialUser = Socialite::driver($provider)->user();

        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // If the user already exists, just update their provider info
            $user->update([
                'provider_name' => $provider,
                'provider_id'   => $socialUser->getId(),
                'avatar'        => $socialUser->getAvatar(),
            ]);
        } else {
            // If no user with that email exists, create a new one
            $user = User::create([
                'name'              => $socialUser->getName(),
                'email'             => $socialUser->getEmail(),
                'provider_name'     => $provider,
                'provider_id'       => $socialUser->getId(),
                
            ]);

            $user->assignRole('User');

            // Fire the registered event for the new user
            event(new \Illuminate\Auth\Events\Registered($user));
        }

        // Log the user in
        Auth::login($user);

        // Redirect them straight to the dashboard
        return redirect()->route('dashboard');

    } catch (Throwable $e) {
        Log::error('Socialite Callback ERROR: ' . $e->getMessage(), ['exception' => $e]);
        return redirect('/login')->with('error', 'Something went wrong logging you in. Please try again.');
    }
}
}