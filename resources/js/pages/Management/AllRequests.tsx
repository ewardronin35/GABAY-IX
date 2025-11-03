import AppLayout from "@/layouts/app-layout";
import { PageProps, FullFinancialRequest, Paginator } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useState, useEffect, useRef } from "react"; // ✨ 1. Import useRef
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, differenceInCalendarDays, format } from 'date-fns';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, ArrowUp, ArrowDown, Download, Clock, Check, XCircle } from "lucide-react";
import { ViewOnlySheet } from "./ViewOnlySheet"; // ✨ 1. Import the new ViewOnlySheet
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { pickBy, isEqual } from 'lodash'; // ✨ 3. Import isEqual
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Reports from "./Reports"; // Import the Reports component

// --- TYPES & HELPERS ---
type PageRequest = Omit<FullFinancialRequest, 'user'> & {
    user: { id: number; name: string; };
};

interface ReportFilters {
    type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}
interface ChartData {
    typeChart: { request_type: string, count: number }[];
    statusChart: { status: string, count: number }[];
    amountByTypeChart: { request_type: string, total: number }[];
}

interface AllRequestsPageProps extends PageProps {
    requests: Paginator<PageRequest>;
    charts: ChartData;
    filters: ReportFilters & {
        sort?: string;
        direction?: string;
    };
    request?: FullFinancialRequest;
}

// Helper Functions
export const getStatusBadge = (status: string): VariantProps<typeof badgeVariants>["variant"] => { 
    switch (status) {
        case 'pending_budget': return 'warning';
        case 'pending_accounting': return 'warning';
        case 'pending_cashier': return 'warning';
        case 'completed': return 'success';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
};
const getRowClass = (status: string): string => { 
    switch (status) {
        case 'pending_budget': return 'bg-warning/10 hover:bg-warning/20';
        case 'rejected': return 'bg-destructive/10 hover:bg-destructive/20 opacity-90';
        case 'completed': return 'bg-success/10 hover:bg-success/20';
        case 'pending_accounting':
        case 'pending_cashier':
            return 'bg-blue-500/10 hover:bg-blue-500/20';
        default: return ''; 
    }
};
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = differenceInCalendarDays(new Date(), date);
    if (diffDays < 1) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, "MMM d, yyyy");
};

// --- MAIN COMPONENT ---
export default function AllRequests({ auth, requests, charts, filters, request }: AllRequestsPageProps) {
    
    // --- Modal State ---
const [isSheetOpen, setIsSheetOpen] = useState(!!request);
    useEffect(() => { setIsSheetOpen(!!request); }, [request]);
    const handleSheetOpenChange = (open: boolean) => {
        if (!open) {
            // ✨ FIX: Use 'management.financial.all-requests' route
            router.get(route('management.financial.all-requests'), activeFilters, { 
                preserveState: true, 
                preserveScroll: true 
            });
        }
        setIsSheetOpen(open);
    };

    // --- Unified Filter State ---
    const [activeFilters, setActiveFilters] = useState({
        // ✨ 4. New simplified status filter. It can be 'pending', 'completed', 'rejected', or 'all'
        status: filters.status || 'all',
        type: filters.type || 'all',
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        sort: filters.sort,
        direction: filters.direction,
    });
    const isInitialMount = useRef(true); // Prevent useEffect from running on first load
    useEffect(() => {
        // Don't run on the initial page load
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only apply filters if they have changed from the ones passed by the controller
        if (isEqual(activeFilters, filters)) {
            return;
        }

        // Use a timeout to "debounce" the request, preventing a request on every keystroke
        const handler = setTimeout(() => {
            const cleanFilters = pickBy(activeFilters, value => value !== 'all' && value !== undefined && value !== '');
            router.get(route('management.financial.all-requests'), cleanFilters as any, {
                preserveState: true,
                preserveScroll: false
            });
        }, 300); // 300ms delay

        return () => clearTimeout(handler); // Cleanup timeout on component unmount
    }, [activeFilters, filters]);

    // Helper to update a filter value in state
    const setFilter = (key: keyof typeof activeFilters, value: string | Date | undefined) => {
        const formattedValue = value instanceof Date ? format(value, 'yyyy-MM-dd') : value;
        setActiveFilters(prev => ({ ...prev, [key]: formattedValue }));
    };

    // --- Data Fetching Handlers ---
    const handleApplyFilters = () => {
        const { sort, direction, ...filterValues } = activeFilters;
        const cleanFilters = pickBy(filterValues);
        
        router.get(route('management.financial.all-requests'), cleanFilters, { 
            preserveState: true, 
            preserveScroll: false 
        });
    };
    
   const handleSort = (newSort: string) => {
        let newDirection = 'asc';
        if (activeFilters.sort === newSort && activeFilters.direction === 'asc') {
            newDirection = 'desc';
        }
        // This will trigger the useEffect to apply the sort
        setActiveFilters(prev => ({ ...prev, sort: newSort, direction: newDirection }));
    }

    const handleViewRequest = (id: number) => {
        router.get(route('management.financial.all-requests.show', id), activeFilters, { preserveState: true });
    };

    // This helper passes the correct (non-sort) filters to the Report component
    const getReportFilters = (): ReportFilters => {
        return pickBy({
            status: activeFilters.status,
            type: activeFilters.type,
            start_date: activeFilters.start_date,
            end_date: activeFilters.end_date,
        });
    };

   return (
        <AppLayout user={auth.user!} header="All Financial Requests" page_title="All Financial Requests">
            <Head title="All Financial Requests" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Requests & Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* ✨ 6. REVISED filter inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        onValueChange={(v) => setFilter('status', v)}
                                        defaultValue={activeFilters.status}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">All Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Select
                                        onValueChange={(v) => setFilter('type', v)}
                                        defaultValue={activeFilters.type}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="Reimbursement">Reimbursement</SelectItem>
                                            <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Start Date</Label>
                                    <DatePicker
                                        date={activeFilters.start_date ? new Date(activeFilters.start_date) : undefined}
                                        setDate={(d: Date | undefined) => setFilter('start_date', d)}
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <DatePicker
                                        date={activeFilters.end_date ? new Date(activeFilters.end_date) : undefined}
                                        setDate={(d: Date | undefined) => setFilter('end_date', d)}
                                    />
                                </div>
                                {/* ✨ 7. Apply Filters button is REMOVED */}
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="list">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">Request List ({requests.total})</TabsTrigger>
                            <TabsTrigger value="reports">Reports & Charts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="list">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request List</CardTitle>
                                    <CardDescription>Filtered list of all requests.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                {/* ✨ 8. NEW TABLE HEADER */}
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" /> Time in Stage
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-center">View</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.length > 0 ? (
                                                requests.data.map((req) => (
                                                    <TableRow key={req.id} className={cn("transition-colors", getRowClass(req.status))}>
                                                        <TableCell>{req.user.name}</TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="font-medium">{req.title}</div>
                                                            <div className="text-xs text-muted-foreground">{req.request_type}</div>
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(req.amount)}</TableCell>
                                                        <TableCell><Badge variant={getStatusBadge(req.status)} className="capitalize">{req.status.replace(/_/g, ' ')}</Badge></TableCell>
                                                        {/* ✨ 9. NEW TABLE CELL to display the data */}
                                                        <TableCell>
                                                            {req.time_in_current_status}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button variant="ghost" size="icon" onClick={() => handleViewRequest(req.id)}><Eye className="h-4 w-4" /></Button>
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
                        </TabsContent>

                        <TabsContent value="reports">
                            <Reports charts={charts} filters={getReportFilters()} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {request ? <ViewOnlySheet request={request} /> : <p>Loading...</p>}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}