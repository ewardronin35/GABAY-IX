import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type User } from '@/pages/Admin/Users/Columns';
import { router } from '@inertiajs/react';
import { route }from 'ziggy-js';

// Define the full shape of a ScholarshipApplication object, including all fields
export type ScholarshipApplication = {
    id: number;
    user: User;
    status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
    created_at: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    sex: string;
    father_name: string | null;
    mother_name: string | null;
    parents_combined_income: number;
    doc_birth_certificate: string | null;
    doc_good_moral: string | null;
    doc_report_card: string | null;
    doc_proof_of_income: string | null;
    // ... include all other fields from your migration here
};

// ✨ Map each status to a specific badge style
const statusStyles: Record<ScholarshipApplication['status'], string> = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const columns = (
    openDetailsSheet: (application: ScholarshipApplication) => void,
): ColumnDef<ScholarshipApplication>[] => [
    {
        header: 'Applicant',
        accessorKey: 'user.name',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.user.name}</div>
                <div className="text-sm text-muted-foreground">{row.original.user.email}</div>
            </div>
        ),
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
            <Badge className={statusStyles[row.original.status]}>
                {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
            </Badge>
        ),
    },
    {
        header: 'Submission Date',
        accessorKey: 'created_at',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const application = row.original;

            // ✨ Handler for approve/reject actions
            const handleAction = (action: 'approve' | 'reject') => {
                const message = `Are you sure you want to ${action} this application?`;
                if (confirm(message)) {
                    router.post(route(`admin.applications.${action}`, application.id), {}, {
                        preserveScroll: true,
                    });
                }
            };
            
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {/* ✨ All buttons are now functional */}
                            <DropdownMenuItem onClick={() => openDetailsSheet(application)}>
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('approve')}>
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('reject')} className="text-red-500 focus:text-red-500">
                                Reject
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];