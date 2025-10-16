import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { DataTable } from '@/pages/Admin/Users/DataTable';
import { Toaster, toast } from 'sonner';
import { columns, type ScholarshipApplication } from './Columns';
import { useState, useEffect } from 'react'; // ✨ FIX: Import useState here
import { ApplicationDetailsSheet } from './ApplicationDetailsSheet'; // ✨ 1. Import the new sheet

// Re-use the Pagination component
const Pagination = ({ links }: { links: any[] }) => (
    <div className="mt-6 flex justify-center gap-1">
        {links.map((link, index) => (
            <Link key={index} href={link.url ?? '#'} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${link.active ? 'bg-primary text-primary-foreground' : 'bg-secondary'} ${!link.url ? 'text-muted-foreground cursor-not-allowed opacity-50' : 'hover:bg-accent'}`}
            />
        ))}
    </div>
);

export default function ApplicationIndex({ auth, applications, success }: PageProps<{
    applications: { data: ScholarshipApplication[], links: any[] };
    success?: string;
}>) {
    // ✨ 2. Add state for the details sheet
    const [detailsSheet, setDetailsSheet] = useState<{ isOpen: boolean; application: ScholarshipApplication | null }>({
        isOpen: false,
        application: null,
    });

    useEffect(() => {
        if (success) toast.success(success);
    }, [success]);
    
    // ✨ 3. Function to open the details sheet
    const openDetailsSheet = (application: ScholarshipApplication) => {
        setDetailsSheet({ isOpen: true, application });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl">Scholarship Applications</h2>}
        >
            <Head title="Scholarship Applications" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ✨ 4. Pass the open function to the DataTable */}
                    <DataTable columns={columns(openDetailsSheet)} data={applications.data} />
                    <Pagination links={applications.links} />
                </div>
            </div>
            {/* ✨ 5. Render the new sheet component */}
            <ApplicationDetailsSheet
                isOpen={detailsSheet.isOpen}
                setIsOpen={(isOpen) => setDetailsSheet({ isOpen, application: null })}
                application={detailsSheet.application}
            />
            <Toaster richColors />
        </AuthenticatedLayout>
    );
}