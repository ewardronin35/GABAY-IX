import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Eye, Check, X, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- 1. DEFINE PROP TYPES ---
type PaginatorLink = { url: string | null; label: string; active: boolean };
type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    from: number;
    to: number;
    total: number;
};
type User = { id: number; name: string; email: string };
type Application = {
    id: number;
    application_no: string;
    academic_year: string;
    semester: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Incomplete';
    created_at: string;
    user: User; // User is eager-loaded from the controller
};
interface AdminAppProps extends PageProps {
    applications: Paginator<Application>;
    filters: {
        status?: string;
        search?: string;
    };
    queryParams?: {
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
        [key: string]: any;
    };
}

// --- 2. HELPER COMPONENTS ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'Incomplete':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const SortableLink = ({ column, currentSort, currentDirection, onSort, children }: any) => {
    const isCurrent = column === currentSort;
    const icon = isCurrent ? (currentDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : null;
    return (
        <button type="button" onClick={() => onSort(column)} className="flex items-center space-x-1 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            <span>{children}</span>
            {icon}
        </button>
    );
};

// --- 3. MAIN COMPONENT ---
export default function ApplicationList({ auth, applications, filters, queryParams = {} }: AdminAppProps) {
    const [viewingApp, setViewingApp] = useState<Application | null>(null);

    const currentSort = queryParams?.sort_by || 'created_at';
    const currentDirection = queryParams?.sort_direction || 'desc';

    const handleSort = (column: string) => {
        const newDirection = currentSort === column && currentDirection === 'asc' ? 'desc' : 'asc';
        router.get(route('superadmin.applications.index'), { ...queryParams, sort_by: column, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    // --- 4. ACTION HANDLER ---
    const handleUpdateStatus = (app: Application, newStatus: Application['status']) => {
        if (!confirm(`Are you sure you want to set this application to "${newStatus}"?`)) {
            return;
        }
        
        router.patch(route('superadmin.applications.update', app.id), 
            { status: newStatus }, 
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Application status updated!');
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update status.');
                }
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="Manage Scholarship Applications">
            <Head title="Manage Applications" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-2xl font-semibold mb-6">Manage Applications</h2>
                            {/* You can add filter/search inputs here later */}
                            
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th><SortableLink column="application_no" {...{currentSort, currentDirection}} onSort={handleSort}>Tracking #</SortableLink></th>
                                            <th><SortableLink column="user.name" {...{currentSort, currentDirection}} onSort={handleSort}>Applicant</SortableLink></th>
                                            <th><SortableLink column="academic_year" {...{currentSort, currentDirection}} onSort={handleSort}>Period</SortableLink></th>
                                            <th><SortableLink column="created_at" {...{currentSort, currentDirection}} onSort={handleSort}>Submitted</SortableLink></th>
                                            <th><SortableLink column="status" {...{currentSort, currentDirection}} onSort={handleSort}>Status</SortableLink></th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {applications.data.map((app) => (
                                            <tr key={app.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.application_no}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{app.user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{app.academic_year} ({app.semester} Sem)</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(app.created_at), 'MMM dd, yyyy')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button type="button" onClick={() => setViewingApp(app)} className="text-indigo-600 hover:text-indigo-900" title="View Details"><Eye size={18} /></button>
                                                    
                                                    {/* --- 5. APPROVE/REJECT BUTTONS --- */}
                                                    {app.status === 'Pending' || app.status === 'Incomplete' ? (
                                                        <>
                                                            <button type="button" onClick={() => handleUpdateStatus(app, 'Approved')} className="text-green-600 hover:text-green-900" title="Approve"><Check size={18} /></button>
                                                            <button type="button" onClick={() => handleUpdateStatus(app, 'Rejected')} className="text-red-600 hover:text-red-900" title="Reject"><X size={18} /></button>
                                                            {app.status !== 'Incomplete' && (
                                                                <button type="button" onClick={() => handleUpdateStatus(app, 'Incomplete')} className="text-blue-600 hover:text-blue-900" title="Mark Incomplete"><Edit size={18} /></button>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* --- 6. PAGINATION --- */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-400">
                                    Showing {applications.from} to {applications.to} of {applications.total} results
                                </div>
                                <div className="flex flex-wrap">
                                    {applications.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || ''}
                                            preserveScroll preserveState
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-2 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                            disabled={!link.url} as="button" type="button"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 7. VIEW MODAL (with applicant info) --- */}
            {viewingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">Application Details</h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>Applicant:</strong> {viewingApp.user.name}</p>
                            <p><strong>Email:</strong> {viewingApp.user.email}</p>
                            <p><strong>Tracking #:</strong> {viewingApp.application_no}</p>
                            <p><strong>Period:</strong> {viewingApp.academic_year} ({viewingApp.semester} Sem)</p>
                            <p><strong>Submitted:</strong> {format(new Date(viewingApp.created_at), 'MMMM dd, yyyy h:mm a')}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full ${getStatusColor(viewingApp.status)}`}>{viewingApp.status}</span></p>
                        </div>
                        <button type="button" onClick={() => setViewingApp(null)} className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}