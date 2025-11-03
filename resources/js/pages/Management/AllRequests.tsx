import AppLayout from "@/layouts/app-layout";
import { PageProps, FullFinancialRequest, Paginator } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, ArrowUp, ArrowDown, Clock } from "lucide-react"; // Removed unused icons
import { ViewOnlySheet } from "./ViewOnlySheet";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { pickBy, isEqual } from 'lodash';
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Reports from "./Reports";

// --- TYPES & HELPERS ---
interface AllRequestsPageProps extends PageProps {
    requests: Paginator<FullFinancialRequest>;
    charts: any;
    filters: {
        status?: string;
        type?: string;
        start_date?: string;
        end_date?: string;
        sort?: string;
        direction?: string;
    };
    request?: FullFinancialRequest | null;
}
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

// Status badge color (this is for the text badge)
const getStatusBadge = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status) {
        case 'completed': return 'success';
        case 'rejected': return 'destructive';
        case 'pending_cashier': return 'warning';
        case 'pending_accounting': return 'warning';
        case 'pending_budget': return 'warning';
        default: return 'outline';
    }
};

// ⬇️ **NEW COLOR-CODING FUNCTION FOR ROWS** ⬇️
const getAgingColorClass = (days: number | null, status: string): string => {
    // Standard colors for non-pending items
    if (status === 'completed') {
        return 'bg-green-50/50 dark:bg-green-900/10';
    }
    if (status === 'rejected') {
        return 'bg-red-50/50 dark:bg-red-900/10 opacity-70';
    }
    
    // Day-based colors for pending items
    if (days === null) return ''; // No color if data is missing

    if (days <= 3)   return 'bg-green-100/50 dark:bg-green-900/20 hover:bg-green-100/70'; // 1–3 days (✅ Green)
    if (days <= 7)   return 'bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-100/70';  // 4–7 days (🔵 Blue)
    if (days <= 14)  return 'bg-yellow-100/50 dark:bg-yellow-900/20 hover:bg-yellow-100/70'; // 8–14 days (🟡 Yellow)
    if (days <= 21)  return 'bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-100/70';// 15–21 days (🟠 Orange)
    
    return 'bg-red-100/50 dark:bg-red-900/20 hover:bg-red-100/70'; // 22+ days (🔴 Red)
};
// ⬆️ **END OF NEW FUNCTION** ⬆️


// --- MAIN COMPONENT ---
export default function AllRequests({ auth, requests, charts, filters, request }: AllRequestsPageProps) {

    const [isSheetOpen, setIsSheetOpen] = useState(!!request);
    useEffect(() => {
        setIsSheetOpen(!!request);
    }, [request]);

    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || 'all',
        type: filters.type || 'all',
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        sort: filters.sort,
        direction: filters.direction,
    });

    const isInitialMount = useRef(true);

    // This useEffect is for FILTERS ONLY (Status, Type, Date)
    // It correctly scrolls to the top.
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        // Only run if the main filters have changed
        const hasFilterChanged = filters.status !== activeFilters.status ||
                                 filters.type !== activeFilters.type ||
                                 filters.start_date !== activeFilters.start_date ||
                                 filters.end_date !== activeFilters.end_date;

        if (!hasFilterChanged) {
            return;
        }

        const handler = setTimeout(() => {
            const cleanFilters = pickBy(activeFilters, value => value !== 'all' && value !== undefined && value !== '');
            router.get(route('management.financial.all-requests'), cleanFilters as any, {
                preserveState: true,
                preserveScroll: false // This is CORRECT for filters, it should scroll up
            });
        }, 300);

        return () => clearTimeout(handler);
    }, [activeFilters.status, activeFilters.type, activeFilters.start_date, activeFilters.end_date]);


    const setFilter = (key: keyof typeof activeFilters, value: string | Date | undefined) => {
        const formattedValue = value instanceof Date ? format(value, 'yyyy-MM-dd') : value;
        setActiveFilters(prev => ({ ...prev, [key]: formattedValue }));
    };

    // ⬇️ **FIX 1: `handleSort` - This function is now fixed**
    // It calls `router.get` itself, preserves scroll, and keeps the modal open.
    const handleSort = (newSort: string) => {
        let newDirection = 'asc';
        if (activeFilters.sort === newSort && activeFilters.direction === 'asc') {
            newDirection = 'desc';
        }

        const newSortState = { sort: newSort, direction: newDirection };
        setActiveFilters(prev => ({ ...prev, ...newSortState })); // Update state

        const allFilters = pickBy({ 
            ...activeFilters, 
            ...newSortState,
            page: requests.current_page 
        });

        // If a request is open, call the 'show' route to keep it open
        const routeName = request 
            ? 'management.financial.all-requests.show' 
            : 'management.financial.all-requests';
            
        const routeParams: any = request 
            ? [request.id, allFilters] 
            : [allFilters];

        router.get(route(routeName, ...routeParams), {
            preserveScroll: true, // ✨ STOPS SCROLL JUMP
            preserveState: true,  // ✨ KEEPS STATE
        });
    }

    // ⬇️ **FIX 2: `handleViewRequest` - This function is now fixed**
    // It passes all filters/page and *removes* `preserveState: true`
    // so the `request` prop can be delivered, which stops the modal from closing.
    const handleViewRequest = (id: number) => {
        const filtersWithPage = pickBy({ ...activeFilters, page: requests.current_page });
        
        router.get(route('management.financial.all-requests.show', id), filtersWithPage, {
            preserveScroll: true, // Keep scroll position
            // ✨ We REMOVE preserveState so the new `request` prop is received
        });
    };

    // ⬇️ **FIX 3: `handleSheetOpenChange` - This function is now fixed**
    // It passes all filters/page and uses `preserveState: true`
    // to smoothly close the modal without losing table state.
    const handleSheetOpenChange = (open: boolean) => {
        if (!open) {
            const filtersWithPage = pickBy({ ...activeFilters, page: requests.current_page });
            
            router.get(route('management.financial.all-requests'), filtersWithPage, {
                preserveScroll: true,
                preserveState: true, // ✨ Keep existing state
            });
        }
        setIsSheetOpen(open);
    };

    const getReportFilters = () => pickBy({
        status: activeFilters.status,
        type: activeFilters.type,
        start_date: activeFilters.start_date,
        end_date: activeFilters.end_date,
    });


    return (
        <AppLayout user={auth.user!} header="All Financial Requests" page_title="All Financial Requests">
            <Head title="All Financial Requests" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

                    {/* --- FILTERS CARD --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Requests & Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- TABS --- */}
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
                                                <TableHead>
                                                    <Button variant="ghost" className="px-1" onClick={() => handleSort('user_name')}>
                                                        User
                                                        {activeFilters.sort === 'user_name' && (activeFilters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" className="px-1" onClick={() => handleSort('title')}>
                                                        Title
                                                        {activeFilters.sort === 'title' && (activeFilters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" className="px-1" onClick={() => handleSort('amount')}>
                                                        Amount
                                                        {activeFilters.sort === 'amount' && (activeFilters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" className="px-1" onClick={() => handleSort('status')}>
                                                        Status
                                                        {activeFilters.sort === 'status' && (activeFilters.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />)}
                                                    </Button>
                                                </TableHead>
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
                                                    <TableRow 
                                                        key={req.id} 
                                                        // ⬇️ **THIS APPLIES THE COLOR-CODING** ⬇️
                                                        className={cn(
                                                            "transition-colors", 
                                                            getAgingColorClass(req.days_in_current_status, req.status)
                                                        )}
                                                    >
                                                        <TableCell>{req.user.name}</TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="font-medium">{req.title}</div>
                                                            <div className="text-xs text-muted-foreground">{req.request_type}</div>
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(req.amount)}</TableCell>
                                                        <TableCell><Badge variant={getStatusBadge(req.status)} className="capitalize">{req.status.replace(/_/g, ' ')}</Badge></TableCell>
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
                    {request ? <ViewOnlySheet request={request} /> : <p>Loading...</p>}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}