import AppLayout from "@/layouts/app-layout";
import { PageProps, FullFinancialRequest, Paginator } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, differenceInCalendarDays, format } from 'date-fns';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, ArrowUp, ArrowDown, Download } from "lucide-react";
import { BudgetApprovalSheet } from "./BudgetApprovalSheet"; 
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { pickBy } from 'lodash';
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
            router.get(route('budget.all-requests'), activeFilters, { 
                preserveState: true, 
                preserveScroll: true 
            });
        }
        setIsSheetOpen(open);
    };

    // --- Unified Filter State ---
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || 'All',
        type: filters.type || 'All',
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        sort: filters.sort,
        direction: filters.direction,
    });
    
    // Helper to update a filter value in state
    const setFilter = (key: keyof typeof activeFilters, value: string | Date | undefined) => {
        if (value instanceof Date) {
            value = format(value, 'yyyy-MM-dd');
        }
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    // --- Data Fetching Handlers ---
    const handleApplyFilters = () => {
        const { sort, direction, ...filterValues } = activeFilters;
        const cleanFilters = pickBy(filterValues);
        
        router.get(route('budget.all-requests'), cleanFilters, { 
            preserveState: true, 
            preserveScroll: false 
        });
    };
    
    const handleSort = (newSort: string) => {
        let newDirection = 'asc';
        if (activeFilters.sort === newSort && activeFilters.direction === 'asc') {
            newDirection = 'desc';
        }
        const newFilters = pickBy({ ...activeFilters, sort: newSort, direction: newDirection });
        
        router.get(route('budget.all-requests'), newFilters, { 
            preserveState: true, 
            preserveScroll: false 
        });
    }

    const handleViewRequest = (id: number) => {
        router.get(route('budget.all-requests.show', id), activeFilters, { preserveState: true });
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
                    
                    {/* --- UNIFIED FILTER CARD --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Requests & Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Quick status buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Button 
                                    variant={activeFilters.status === 'pending_budget' ? 'default' : 'outline'} 
                                    onClick={() => setFilter('status', 'pending_budget')}
                                >
                                    My Queue
                                </Button>
                                <Button 
                                    variant={activeFilters.status === 'rejected' ? 'default' : 'outline'} 
                                    onClick={() => setFilter('status', 'rejected')}
                                >
                                    Rejected
                                </Button>
                                <Button 
                                    variant={!activeFilters.status || activeFilters.status === 'All' ? 'secondary' : 'outline'} 
                                    onClick={() => setFilter('status', 'All')}
                                >
                                    All Statuses
                                </Button>
                            </div>
                            {/* Main filter inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Type</Label>
                                    <Select 
                                        onValueChange={(v) => setFilter('type', v)} 
                                        defaultValue={activeFilters.type}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Types</SelectItem>
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
                                        onSelect={(d: Date | undefined) => setFilter('start_date', d)} 
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <DatePicker 
                                        date={activeFilters.end_date ? new Date(activeFilters.end_date) : undefined} 
                                        onSelect={(d: Date | undefined) => setFilter('end_date', d)} 
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleApplyFilters} className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- TABS FOR LIST & REPORTS --- */}
                    <Tabs defaultValue="list">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">Request List ({requests.total})</TabsTrigger>
                            <TabsTrigger value="reports">Reports & Charts</TabsTrigger>
                        </TabsList>

                        {/* --- TAB 1: REQUEST LIST --- */}
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
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => handleSort('title')}>
                                                        Title
                                                        {filters.sort === 'title' && (filters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => handleSort('amount')}>
                                                        Amount
                                                        {filters.sort === 'amount' && (filters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => handleSort('status')}>
                                                        Status
                                                        {filters.sort === 'status' && (filters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                     <Button variant="ghost" onClick={() => handleSort('created_at')}>
                                                        Date
                                                        {filters.sort === 'created_at' && (filters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
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
                                                        <TableCell>{formatDateTime(req.created_at)}</TableCell>
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

                        {/* --- TAB 2: REPORTS & CHARTS --- */}
                        <TabsContent value="reports">
                            <Reports charts={charts} filters={getReportFilters()} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* --- Modal (Sheet) --- */}
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {request ? (
                        <BudgetApprovalSheet request={request} />
                    ) : (
                        <p>Loading...</p>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}