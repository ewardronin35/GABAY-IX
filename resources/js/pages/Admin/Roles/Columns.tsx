import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'; // ✨ ADD ArrowUpDown
import { Badge } from '@/components/ui/badge';
import { router, usePage } from '@inertiajs/react'; // ✨ ADD usePage and router
import {route }from 'ziggy-js';

// ✨ ADD: Helper function to generate a color from a string
const getColorForPermission = (permissionName: string) => {
    let hash = 0;
    for (let i = 0; i < permissionName.length; i++) {
        hash = permissionName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    ];
    return colors[Math.abs(hash % colors.length)];
};

export type Permission = { id: number; name: string };
export type Role = { id: number; name: string; permissions: Permission[] };

export const columns = (
    openSheet: (role: Role) => void,
    handleDelete: (roleId: number) => void,
): ColumnDef<Role>[] => {
    const { props } = usePage();
    const { filters } = props as any;

    const handleSort = (column: string) => {
        const direction = filters.sort_by === column && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.roles.index'), { sort_by: column, sort_direction: direction }, { preserveState: true });
    };
    
    return [
        {
            accessorKey: 'name',
            // ✨ UPDATE: Make header sortable
            header: () => (
                <Button variant="ghost" onClick={() => handleSort('name')}>
                    Role Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            header: 'Permissions',
            cell: ({ row }) => (
                <div className="flex flex-wrap max-w-lg gap-1">
                    {row.original.permissions?.map((permission) => (
                        // ✨ UPDATE: Use className for dynamic colors
                        <Badge key={permission.name} className={getColorForPermission(permission.name)}>
                            {permission.name}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openSheet(row.original)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                onClick={() => handleDelete(row.original.id)}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
};