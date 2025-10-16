// resources/js/Pages/Admin/Users/Index.tsx
import AuthenticatedLayout from '@/layouts/app-layout';
import { type PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react'; // ✨ ADD: Import Link

import { useState, useMemo, useEffect } from 'react';
import { DataTable } from './DataTable';
import { columns, type User, type Permission } from './Columns'; // ✨ FIX: Import User and Permission types
import { UserSheet } from './UserSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from "sonner";

interface PaginatedUsers {
  data: User[];
  links: any[]; // ✨ ADD: Type for pagination links
}

export default function UserIndex({
  auth,
  users,
  roles,
  permissions, // ✨ ADD: Receive all permissions from controller
  filters,
  success,
  error,
}: PageProps<{
  users: PaginatedUsers;
  roles: string[];
  permissions: Permission[]; // ✨ ADD: Define the prop type
  filters: { search: string };
  success?: string;
  error?: string;
}>) {
  const [sheetState, setSheetState] = useState<{
    isOpen: boolean;
    user?: User | null;
  }>({ isOpen: false, user: null });

  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
  }, [success, error]);

  const openSheet = (user: User | null = null) =>
    setSheetState({ isOpen: true, user: user });
const Pagination = ({ links }: { links: any[] }) => (
    <div className="mt-6 flex justify-center gap-1">
        {links.map((link, index) => (
            <Link
                key={index}
                href={link.url ?? '#'}
                preserveScroll
                dangerouslySetInnerHTML={{ __html: link.label }}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${
                    link.active ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                } ${!link.url ? 'text-muted-foreground cursor-not-allowed opacity-50' : 'hover:bg-accent'}`}
            />
        ))}
    </div>
);
  const tableColumns = useMemo(() => columns(openSheet), []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          User Management
        </h2>
      }
    >
      <Head title="User Management" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Filter users..." className="max-w-sm" />
            <Button onClick={() => openSheet()}>Add User</Button>
          </div>
          <DataTable columns={tableColumns} data={users.data} />
          <Pagination links={users.links} />
        </div>
      </div>
      <UserSheet
        isOpen={sheetState.isOpen}
        setIsOpen={(isOpen) =>
          setSheetState({ isOpen, user: isOpen ? sheetState.user : null })
        }
        user={sheetState.user}
        roles={roles}
        allPermissions={permissions} // ✨ ADD: Pass all permissions down
      />
      <Toaster richColors position="top-right" />
    </AuthenticatedLayout>
  );
}