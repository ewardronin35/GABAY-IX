import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { DataTable } from '@/pages/Admin/Users/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { columns, type Role, type Permission } from './Columns';
import { RoleSheet } from './RoleSheet';
import { route }from 'ziggy-js';
import { Trash2 } from 'lucide-react';
import Echo from 'laravel-echo'; // ✨ ADD: Import Echo type
import Pusher from 'pusher-js'; // ✨ ADD: Import Pusher
// ✨ ADD: Pagination component
const Pagination = ({ links }: { links: any[] }) => (
    <div className="mt-6 flex justify-center gap-1">
        {links.map((link, index) => (
            <Link key={index} href={link.url ?? '#'} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${link.active ? 'bg-primary text-primary-foreground' : 'bg-secondary'} ${!link.url ? 'text-muted-foreground cursor-not-allowed opacity-50' : 'hover:bg-accent'}`}
            />
        ))}
    </div>
);

// ✨ ADD: New component to manage permissions
const PermissionsManager = ({ permissions }: { permissions: Permission[] }) => {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('superadmin.permissions.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const deletePermission = (permissionId: number) => {
        if (confirm('Are you sure? This will remove the permission from all roles.')) {
            router.delete(route('superadmin.permissions.destroy', permissionId), { preserveScroll: true });
        }
    };

    return (
        <div className="mt-8 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Manage Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-2">Existing Permissions</h4>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {permissions.map(p => (
                            <div key={p.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                                <span>{p.name}</span>
                                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => deletePermission(p.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Add New Permission</h4>
                    <form onSubmit={submit} className="flex items-center gap-2">
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g., create articles" />
                        <Button type="submit" disabled={processing}>Add</Button>
                    </form>
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
            </div>
        </div>
    );
};

export default function RoleIndex({ auth, roles, permissions, success, error }: PageProps<{
    // ✨ UPDATE: 'roles' is now a paginator object
    roles: { data: Role[]; links: any[] };
    permissions: Permission[];
    success?: string;
    error?: string;
}>) {
    const [sheetState, setSheetState] = useState<{
        isOpen: boolean;
        role?: Role | null;
    }>({ isOpen: false, role: null });

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    const openSheet = (role: Role | null = null) => setSheetState({ isOpen: true, role });

    const handleDelete = (roleId: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(route('superadmin.roles.destroy', roleId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Roles & Permissions
                </h2>
            }
        >
            <Head title="Roles & Permissions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end items-center mb-4">
                        <Button onClick={() => openSheet()}>Add Role</Button>
                    </div>
                    {/* ✨ UPDATE: Pass role data and render Pagination */}
                    <DataTable columns={columns(openSheet, handleDelete)} data={roles.data} />
                    <Pagination links={roles.links} />

                    {/* ✨ ADD: Render the new PermissionsManager component */}
                    <PermissionsManager permissions={permissions} />
                </div>
            </div>
            <RoleSheet
                isOpen={sheetState.isOpen}
                setIsOpen={(isOpen) => setSheetState({ isOpen, role: isOpen ? sheetState.role : null })}
                role={sheetState.role}
                allPermissions={permissions.map(p => p.name)}
            />
            <Toaster richColors position="top-right" />
        </AuthenticatedLayout>
    );
}