<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'view applications']);
        Permission::firstOrCreate(['name' => 'evaluate applications']);
        Permission::firstOrCreate(['name' => 'approve applications']);
        Permission::firstOrCreate(['name' => 'manage disbursements']);
        Permission::firstOrCreate(['name' => 'view reports']);

        // Create Roles and Assign Permissions
        Role::firstOrCreate(['name' => 'User']);

        $recordsRole = Role::firstOrCreate(['name' => 'Records Officer']);
        $recordsRole->givePermissionTo('view applications');

        $coordinatorRole = Role::firstOrCreate(['name' => 'Scholarship Coordinator']);
        $coordinatorRole->givePermissionTo(['view applications', 'evaluate applications']);
        
        $accountingRole = Role::firstOrCreate(['name' => 'Accounting Officer']);
        $accountingRole->givePermissionTo(['manage disbursements', 'view reports']);

        $directorRole = Role::firstOrCreate(['name' => 'Regional Director']);
        $directorRole->givePermissionTo(['approve applications', 'view reports']);

        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        // Assign all permissions to Super Admin
        $superAdminRole->givePermissionTo(Permission::all());
    }
}