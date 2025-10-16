<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request): Response
    {
        // ✨ ADD: Logic for sorting
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $roles = Role::with('permissions')
            ->orderBy($sortBy, $sortDirection)
            ->paginate(10) // ✨ UPDATE: Use paginate() instead of get()
            ->withQueryString();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            // ✨ UPDATE: Pass all permission objects for the new management UI
            'permissions' => Permission::all()->map->only('id', 'name'),
            'filters' => $request->only(['sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->input('permissions', []));

        return back()->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        // Prevent editing the Super Admin role's name
        if ($role->name === 'Super Admin') {
            return back()->with('error', 'The Super Admin role cannot be edited.');
        }

        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->input('permissions', []));

        return back()->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deleting critical roles
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return back()->with('error', 'This role cannot be deleted.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted successfully.');
    }
     public function storePermission(Request $request): RedirectResponse
    {
        $request->validate(['name' => 'required|string|unique:permissions,name']);
        Permission::create(['name' => $request->name]);
        return back()->with('success', 'Permission created successfully.');
    }

    // ✨ ADD: Method to destroy a permission
    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $permission->delete();
        return back()->with('success', 'Permission deleted successfully.');
    }

}