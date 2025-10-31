import AppLayout from "@/layouts/app-layout";
import { PageProps, User, FullFinancialRequest, Paginator } from "@/types"; 
import { Head, router } from "@inertiajs/react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, ArrowUp, ArrowDown } from "lucide-react"; 
import { ViewRequestSheet } from "../Financial/ViewRequestSheet"; 
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { pickBy } from 'lodash';
import { useDebounce } from "use-debounce";
import { type VariantProps } from "class-variance-authority";

// --- TYPES & HELPERS ---
interface FinancialRequest {
    id: number;
    title: string;
    request_type: string;
    amount: number;
    status: string;
    created_at: string;
    remarks: string | null;
    user: User; 
    budget_approved_at: string | null;
    accounting_approved_at: string | null;
    cashier_paid_at: string | null;
}
interface AllRequestsPageProps extends PageProps {
    requests: Paginator<FinancialRequest>;
    request?: FullFinancialRequest;
    filters: {
        sort?: string;
        direction?: string;
        type?: string;
        status?: string;
    }
}
type SortConfig = {
    key: keyof FinancialRequest | 'created_at';
    direction: 'asc' | 'desc';
};

// ✨ 1. FIX: Added all helper functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};
const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};
const requestTypesFilter = ["All", "Reimbursement", "Cash Advance", "Liquidation"];
const requestStatusesFilter = ["All", "pending_budget", "pending_accounting", "pending_cashier", "completed", "rejected"];

const getDaysPending = (dateString: string | null): number => {
    if (!dateString) return 0;
    return differenceInCalendarDays(new Date(), new Date(dateString));
};
const getStatusStyle = (request: FinancialRequest): { rowClass: string, badgeVariant: VariantProps<typeof badgeVariants>["variant"] } => {
    let badgeVariant: VariantProps<typeof badgeVariants>["variant"] = "outline";
    let rowClass = "border-b"; 
    let daysPending = 0;
    switch (request.status) {
        case 'pending_budget':
            daysPending = getDaysPending(request.created_at); break;
        case 'pending_accounting':
            daysPending = getDaysPending(request.budget_approved_at); break;
        case 'pending_cashier':
            daysPending = getDaysPending(request.accounting_approved_at); break;
        case 'completed':
            badgeVariant = "success";
            rowClass = "border-b bg-green-500/10 hover:bg-green-500/20"; break;
        case 'rejected':
            badgeVariant = "destructive";
            rowClass = "border-b bg-red-500/10 hover:bg-red-500/20"; break;
    }
    if (request.status.startsWith('pending_')) {
        if (daysPending <= 2) badgeVariant = "success";
        else if (daysPending <= 4) badgeVariant = "warning";
        else if (daysPending <= 7) badgeVariant = "orange";
        else badgeVariant = "destructive";
    }
    return { badgeVariant, rowClass };
}
const StatusCell = ({ request }: { request: FinancialRequest }) => {
    const { badgeVariant } = getStatusStyle(request);
    return (
        <Badge variant={badgeVariant} className="capitalize">
            {request.status.replace('_', ' ')}
        </Badge>
    );
};
// ---

// --- MAIN "ALL REQUESTS" COMPONENT ---
export default function AllRequests(props: AllRequestsPageProps) {
    const { auth, requests, request, ziggy, filters } = props; 
    
    const [viewingRequest, setViewingRequest] = useState<FullFinancialRequest | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: (filters.sort || 'created_at') as keyof FinancialRequest, 
        direction: (filters.direction || 'desc') as 'asc' | 'desc' 
    });
    const [typeFilter, setTypeFilter] = useState(filters.type || 'All');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All');

    useEffect(() => {
        if (request) {
            setViewingRequest(request);
            setIsSheetOpen(true);
        }
    }, [request]);

    const processedRequests = requests.data;

    const [filtersState, setFiltersState] = useState({
        sort: sortConfig.key,
        direction: sortConfig.direction,
        type: typeFilter,
        status: statusFilter,
    });
    const debouncedFilters = useDebounce(filtersState, 300);

    useEffect(() => {
        router.get(route('budget.all'), pickBy(debouncedFilters), {
            preserveState: true,
            preserveScroll: true,
            only: ['requests', 'filters'],
        });
    }, [debouncedFilters]);

    useEffect(() => { setFiltersState(prev => ({ ...prev, sort: sortConfig.key, direction: sortConfig.direction })); }, [sortConfig]);
    useEffect(() => { setFiltersState(prev => ({ ...prev, type: typeFilter })); }, [typeFilter]);
    useEffect(() => { setFiltersState(prev => ({ ...prev, status: statusFilter })); }, [statusFilter]);

    const handleViewRequest = (id: number) => {
        router.get(route('financial.show', id), {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['request'],
            onError: () => { alert("Error loading request details."); }
        });
    };
    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) {
            setViewingRequest(null);
            router.get(route('budget.all'), {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['requests'], 
            });
        }
    }

    const requestSort = (key: keyof FinancialRequest) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <AppLayout user={auth.user!} page_title="All Financial Requests">
            <Head title="All Financial Requests" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle>All Submitted Requests</CardTitle>
                                <CardDescription>Filter and view all requests in the system.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <div className="flex-1">
                                    <Label htmlFor="type_filter">Filter by Type</Label>
                                    {/* ✨ 2. FIX: Filled in Select options */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger id="type_filter"><SelectValue placeholder="Select type..." /></SelectTrigger>
                                        <SelectContent>
                                            {requestTypesFilter.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="status_filter">Filter by Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger id="status_filter"><SelectValue placeholder="Select status..." /></SelectTrigger>
                                        <SelectContent>
                                            {requestStatusesFilter.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {/* ... (Sort buttons) ... */}
                                        <TableHead>Submitted By</TableHead>
                                        {/* ... (Other sort buttons) ... */}
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedRequests.length > 0 ? (
                                        processedRequests.map((request) => (
                                            // ✨ 3. FIX: Corrected JSX syntax
                                            <TableRow key={request.id} className={getStatusStyle(request).rowClass}>
                                                <TableCell>{formatDate(request.created_at)}</TableCell>
                                                <TableCell>{request.user.name}</TableCell>
                                                <TableCell className="font-medium">{request.title}</TableCell>
                                                <TableCell>{formatCurrency(request.amount)}</TableCell>
                                                {/* ✨ 4. FIX: Filled in StatusCell */}
                                                <TableCell><StatusCell request={request} /></TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={6} className="text-center">No requests match.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <PaginationLinks links={requests.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View Modal (Sheet) */}
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {viewingRequest ? (
                        <ViewRequestSheet request={viewingRequest} />
                    ) : (
                        <p>Loading...</p>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}