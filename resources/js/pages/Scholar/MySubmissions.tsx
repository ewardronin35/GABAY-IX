import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Eye, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

// ... (types and helpers are all correct) ...
type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

type Application = {
    id: number;
    application_no: string;
    academic_year: string;
    semester: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Incomplete';
    created_at: string;
};

interface MySubmissionsProps extends PageProps {
    applications: Paginator<Application>;
    queryParams?: { // queryParams can be undefined
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
        [key: string]: any;
    };
}

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

const SortableLink = ({
    column,
    currentSort,
    currentDirection,
    onSort,
    children,
}: {
    column: string;
    currentSort: string;
    currentDirection: string;
    onSort: (column: string) => void;
    children: React.ReactNode;
}) => {
    const isCurrent = column === currentSort;
    const icon = isCurrent ? (currentDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : null;

    return (
        <button
            type="button"
            onClick={() => onSort(column)}
            className="flex items-center space-x-1 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
        >
            <span>{children}</span>
            {icon}
        </button>
    );
};

// --- 3. MAIN COMPONENT ---
export default function MySubmissions({ auth, applications, queryParams = {} }: MySubmissionsProps) {
    const [viewingApp, setViewingApp] = useState<Application | null>(null);

    // ⬇️ **THE FIX IS HERE**
    const currentSort = queryParams?.sort_by || 'created_at';
    const currentDirection = queryParams?.sort_direction || 'desc';

    // Function to handle sorting
    const handleSort = (column: string) => {
        const newDirection = currentSort === column && currentDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            route('scholar.csmp.my-applications'),
            {
                ...queryParams,
                sort_by: column,
                sort_direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="My Submissions">
            <Head title="My Submissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ... (rest of the component is unchanged and correct) ... */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-2xl font-semibold mb-6">My Application History</h2>

                            {applications.data.length === 0 ? (
                                <p>You have not submitted any applications yet.</p>
                            ) : (
                                <>
                                    {/* --- 4. THE TABLE --- */}
                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th scope="col">
                                                        <SortableLink
                                                            column="application_no"
                                                            currentSort={currentSort}
                                                            currentDirection={currentDirection}
                                                            onSort={handleSort}
                                                        >
                                                            Tracking Number
                                                        </SortableLink>
                                                    </th>
                                                    <th scope="col">
                                                        <SortableLink
                                                            column="academic_year"
                                                            currentSort={currentSort}
                                                            currentDirection={currentDirection}
                                                            onSort={handleSort}
                                                        >
                                                            Period
                                                        </SortableLink>
                                                    </th>
                                                    <th scope="col">
                                                        <SortableLink
                                                            column="created_at"
                                                            currentSort={currentSort}
                                                            currentDirection={currentDirection}
                                                            onSort={handleSort}
                                                        >
                                                            Date Submitted
                                                        </SortableLink>
                                                    </th>
                                                    <th scope="col">
                                                        <SortableLink
                                                            column="status"
                                                            currentSort={currentSort}
                                                            currentDirection={currentDirection}
                                                            onSort={handleSort}
                                                        >
                                                            Status
                                                        </SortableLink>
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {applications.data.map((app) => (
                                                    <tr key={app.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {app.application_no}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {app.academic_year} ({app.semester} Sem)
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {format(new Date(app.created_at), 'MMM dd, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingApp(app)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            
                                                            {app.status === 'Incomplete' && (
                                                                <Link
                                                                    href={route('scholar.csmp.edit', app.id)} 
                                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    title="Edit Application"
                                                                >
                                                                    <Edit size={18} />
                                                                </Link>
                                                            )}
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
                                                    preserveScroll
                                                    preserveState
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-2 text-sm ${link.active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'text-gray-700 dark:text-gray-300'} ${!link.url ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                    disabled={!link.url}
                                                    as="button"
                                                    type="button"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 7. VIEW MODAL --- */}
            {viewingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Application Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setViewingApp(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong>Tracking Number:</strong> {viewingApp.application_no}</p>
                            <p><strong>Period:</strong> {viewingApp.academic_year} ({viewingApp.semester} Sem)</p>
                            <p><strong>Submitted:</strong> {format(new Date(viewingApp.created_at), 'MMMM dd, yyyy h:mm a')}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full ${getStatusColor(viewingApp.status)}`}>{viewingApp.status}</span></p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setViewingApp(null)}
                            className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}