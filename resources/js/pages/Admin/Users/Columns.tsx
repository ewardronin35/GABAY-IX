// resources/js/Pages/Admin/Users/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"; // Added Separator
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { router, usePage } from "@inertiajs/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import  { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";

export type Permission = {
    id: number;
    name: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    role: string | null;
    disabled_at: string | null;
    permissions: Permission[];
};

export const columns = (
    openSheet: (user: User) => void,
): ColumnDef<User>[] => {
    const { props } = usePage();
    const { filters } = props as any;

    const handleSort = (column: string) => {
        const isCurrentlySorted = filters.sort_by === column;
        const direction = isCurrentlySorted && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(route('superadmin.users.index'), {
            ...filters,
            sort_by: column,
            sort_direction: direction,
        }, { preserveState: true });
    };

    return [
        {
            accessorKey: "name",
            header: () => (
                <Button variant="ghost" onClick={() => handleSort('name')}>
                    User
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={row.original.avatar_url} />
                        <AvatarFallback>
                            {row.original.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {row.original.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: () => (
                <Button variant="ghost" onClick={() => handleSort('role')}>
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            header: "Permissions",
            cell: ({ row }) => (
                <div className="flex flex-wrap max-w-xs gap-1">
                    {row.original.permissions?.map((permission) => (
                        <Badge key={permission.id} variant="secondary">
                            {permission.name}
                        </Badge>
                    ))}
                </div>
            ),
        },
       {
            header: "Status",
            accessorKey: "disabled_at",
            cell: ({ row }) => {
                const isActive = !row.original.disabled_at;
                return (
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? "Active" : "Disabled"}
                    </Badge>
                );
            }
        },
       {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openSheet(row.original)}>
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()} // Prevents menu from closing on click
                            className="flex items-center justify-between"
                        >
                           <span>{row.original.disabled_at ? 'Enable' : 'Disable'} User</span>
                            <Switch
                                checked={!row.original.disabled_at}
                                onCheckedChange={() =>
                                    router.patch(
                                        route("superadmin.users.toggleStatus", row.original.id), {},
                                        { preserveScroll: true }
                                    )
                                }
                                className="ml-4"
                            />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            onClick={() =>
                                router.delete(route("superadmin.users.destroy", row.original.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
};