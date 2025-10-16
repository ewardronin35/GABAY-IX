<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Log; // <-- 1. ADD THIS IMPORT
use App\Models\ScholarshipApplication;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
public function share(Request $request): array
{
    [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
  $user = $request->user();

    // --- START DEBUGGING BLOCK ---
    if ($user) {
        Log::info('USER AUTH CHECK:', [
            'user_id' => $user->id,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getPermissionNames()
        ]);
    }
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'quote' => ['message' => trim($message), 'author' => trim($author)],
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->getRoleNames()->first(), 
                'avatar_url' => $request->user()->avatar_url,
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ] : null,
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                    'query' => $request->query()
                ]);
            },
        // --- END BLOCK ---
    ];
}

}
