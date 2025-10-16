<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Storage;
class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
     public function index(Request $request): Response
    {
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✨ FIX: Validate sort_by to prevent SQL errors with unknown columns
        if (!Schema::hasColumn('users', $sortBy) && $sortBy !== 'role') {
            $sortBy = 'created_at'; // Default to a safe column
        }

        $query = User::with(['roles', 'permissions']);

        // ✨ FIX: Apply JOIN for sorting by role relationship
        if ($sortBy === 'role') {
            $query->select('users.*', 'roles.name as role_name')
                ->join('model_has_roles', 'model_has_roles.model_id', '=', 'users.id')
                ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->orderBy('role_name', $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $users = $query->when($request->input('search'), function ($query, $search) {
                $query->where('users.name', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'role' => $user->getRoleNames()->first(),
                'disabled_at' => $user->disabled_at,
                'permissions' => $user->getAllPermissions()->map->only('id', 'name'),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::pluck('name')->all(),
            'permissions' => Permission::all()->map->only('id', 'name'),
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|exists:roles,name',
            'avatar' => ['nullable', 'image', 'max:1024'],
            'permissions' => ['nullable', 'array'], // ✨ ADD: Validate incoming permissions
            'permissions.*' => ['string', 'exists:permissions,name'], // Validate each permission exists
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $avatarPath,
        ]);

        $user->assignRole($request->role);
        $user->syncPermissions($request->input('permissions', [])); // ✨ ADD: Sync the selected permissions

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|string|exists:roles,name',
            'avatar' => ['nullable', 'image', 'max:1024'],
            'permissions' => ['nullable', 'array'], // ✨ ADD: Validate incoming permissions
            'permissions.*' => ['string', 'exists:permissions,name'], // Validate each permission exists
        ]);

        $user->update($request->only('name', 'email'));
        $user->syncRoles($request->role);
        $user->syncPermissions($request->input('permissions', [])); // ✨ ADD: Sync the selected permissions
        $message = 'User updated successfully.';
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);
            // ✨ ADD: More specific success message for the toast
            $message = 'User and profile picture updated successfully.';
        }
  return back()->with('success', $message);
    }

    /**
     * Toggle the user's disabled status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        $user->disabled_at = $user->disabled_at ? null : now();
        $user->save();

        return back();
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}