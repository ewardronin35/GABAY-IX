<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Verified;
class EmailVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
public function __invoke(EmailVerificationRequest $request): RedirectResponse
{
    // If the user is not yet verified, mark them as verified and fire the event.
    if (! $request->user()->hasVerifiedEmail()) {
        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }
    }

    // Now, always redirect to our custom "Verified!" page.
    return redirect()->route('verification.verified');
}
}