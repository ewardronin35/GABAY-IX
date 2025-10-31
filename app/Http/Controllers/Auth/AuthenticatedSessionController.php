<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
 /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // --- ✨ START OF NEW LOGIC ---

        // 1. Get the authenticated user
        $user = Auth::user();

        // 2. Set a default URL (your original '/dashboard')
        $url = route('dashboard', absolute: false);

        // 3. Check for specific roles and change the URL
        if ($user->hasRole('Budget')) {
            $url = route('budget.dashboard');
        } 
        // You can add more roles here later
        // elseif ($user->hasRole('Accounting')) {
        //     $url = route('accounting.dashboard');
        // }
        
        // --- END OF NEW LOGIC ---

        // 4. Use the new $url as the default
        //    redirect()->intended() will still send users to the page
        //    they were *trying* to visit if they were forced to log in.
        return redirect()->intended($url);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
