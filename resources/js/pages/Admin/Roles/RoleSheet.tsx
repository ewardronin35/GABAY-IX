import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Role } from './Columns';
import { useEffect } from 'react';
import { route } from 'ziggy-js'; // ✨ FIX: Use named import for route

export function RoleSheet({
    isOpen,
    setIsOpen,
    role,
    allPermissions = [],
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    role?: Role | null;
    allPermissions?: string[]; // ✨ FIX: The type is now string[] to match the data from your controller
}) {
    const isEditing = !!role;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setData({
                    name: role.name || '',
                    permissions: role.permissions?.map((p) => p.name) || [],
                });
            } else {
                reset();
            }
        }
    }, [role, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            // ✨ FIX: Use 'superadmin' prefix for route names
            put(route('superadmin.roles.update', role!.id), {
                onSuccess: () => setIsOpen(false),
                preserveScroll: true,
            });
        } else {
            post(route('superadmin.roles.store'), {
                onSuccess: () => setIsOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</SheetTitle>
                    <SheetDescription>
                        {isEditing ? `Update details for the ${role?.name} role.` : 'Create a new role and assign permissions.'}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4 max-h-80 overflow-y-auto">
                            {/* ✨ FIX: 'permission' is now a string, so all the logic below works correctly. */}
                            {allPermissions.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`perm-${permission}`}
                                        checked={data.permissions.includes(permission)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setData('permissions', [...data.permissions, permission]);
                                            else setData('permissions', data.permissions.filter((p) => p !== permission));
                                        }}
                                    />
                                    <label htmlFor={`perm-${permission}`} className="text-sm font-medium leading-none">
                                        {permission}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-sm text-red-500 mt-1">{errors.permissions}</p>}
                    </div>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving...' : 'Save Role'}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}