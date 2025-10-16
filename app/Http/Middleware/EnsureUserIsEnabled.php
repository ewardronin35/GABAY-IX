<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // <-- 1. ADD THIS IMPORT

class EnsureUserIsEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 2. CHANGE auth()-> to Auth::
        if (Auth::check() && Auth::user()->disabled_at) {
            Auth::logout();
            return redirect('/login')->with('error', 'Your account has been disabled.');
        }

        return $next($request);
    }
}