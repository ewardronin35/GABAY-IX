<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'create roles',
            'read roles',
            'update roles',
            'delete roles',
            'create users',
            'read users',
            'update users',
            'delete users',
            'create applications',
            'read applications',
            'update applications',
            'delete applications',
            'upload stufaps',
            'read stufaps',
            'create reports',
            'read reports',
            'create travel claims',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // --- Create Roles and Assign Existing Permissions ---

        // Create the Super Admin role
        $superAdminRole = Role::create(['name' => 'Super Admin']);
        
        // Assign all permissions to the Super Admin role
        $allPermissions = Permission::all();
        $superAdminRole->givePermissionTo($allPermissions);

        // Create an Admin role and assign specific permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminPermissions = [
            'create users',
            'read users',
            'update users',
            'delete users',
            'create applications',
            'read applications',
            'update applications',
            'delete applications',
            'upload stufaps',
            'read stufaps',
        ];
        $adminRole->givePermissionTo($adminPermissions);

        // Create a User role (with no permissions by default)
        Role::create(['name' => 'user']);
    }
}