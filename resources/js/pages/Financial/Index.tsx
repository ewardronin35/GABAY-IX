import AppLayout from "@/layouts/app-layout";
import { PageProps, User, FullFinancialRequest, Paginator } from "@/types"; 
// --- FIX: Added 'Page' back, as it's used in the 'onSuccess' handler ---
import { Head, Link, useForm, usePage, router, Page } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
// --- FIX: Added 'useMemo' back, as it's used for 'filteredRequests' and 'processedRequests' ---
import { useState, useEffect, FormEventHandler, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import InputError from "@/components/input-error";
import FilePondUploader from "@/components/FilePondUploader";
import { FilePondFile } from 'filepond';
import { ViewRequestSheet } from "./ViewRequestSheet"; 
import { Eye, ArrowUp, ArrowDown } from "lucide-react"; 
import { type VariantProps } from "class-variance-authority";
import { toast } from 'sonner';

import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { request } from "http";
// --- FIX: Removed unused 'pickBy' and error-causing/unused 'useDebounce' ---
// import { pickBy } from 'lodash';
// import { useDebounce } from "@uidotdev/use-debounce";

// --- LIST/INDEX TYPES ---
interface IndexPageProps extends PageProps {
    requests: Paginator<FullFinancialRequest>;
    filters: { [key: string]: string };
    request?: FullFinancialRequest; // This is for the modal
    tab?: string; // --- ADD THIS ---
}
interface FinancialRequest {
    id: number;
    title: string;
    request_type: string;
    amount: number;
    status: string;
    created_at: string;
    remarks: string | null;
    budget_approved_at: string | null;
    accounting_approved_at: string | null;
    cashier_paid_at: string | null;
}
interface IndexPageProps extends PageProps {
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
    key: keyof FinancialRequest;
    direction: 'ascending' | 'descending';
};

// --- HELPERS (Unchanged) ---
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
const requestTypesForm = ["Reimbursement", "Cash Advance", "Liquidation"];
type StatusStyle = {
    badgeVariant: VariantProps<typeof badgeVariants>["variant"];
    rowClass: string; 
    relativeTime: string;
    statusText: string;
}
const getDaysPending = (dateString: string | null): number => {
    if (!dateString) return 0;
    return differenceInCalendarDays(new Date(), new Date(dateString));
};
const getStatusStyle = (request: FinancialRequest): StatusStyle => {
    let statusText = request.status.replace('_', ' ');
    let relativeTime = '';
    let badgeVariant: VariantProps<typeof badgeVariants>["variant"] = "outline";
    let rowClass = "border-b"; 
    let daysPending = 0;
    switch (request.status) {
        case 'pending_budget':
            daysPending = getDaysPending(request.created_at);
            relativeTime = `for ${daysPending} day(s)`;
            break;
        case 'pending_accounting':
            daysPending = getDaysPending(request.budget_approved_at);
            relativeTime = `for ${daysPending} day(s)`;
            break;
        case 'pending_cashier':
            daysPending = getDaysPending(request.accounting_approved_at);
            relativeTime = `for ${daysPending} day(s)`;
            break;
        case 'completed':
            relativeTime = `on ${formatDate(request.cashier_paid_at)}`;
            badgeVariant = "success";
            rowClass = "border-b bg-green-500/10 hover:bg-green-500/20";
            break;
        case 'rejected':
            relativeTime = "See remarks";
            badgeVariant = "destructive";
            rowClass = "border-b bg-red-500/10 hover:bg-red-500/20";
            break;
    }
    if (request.status.startsWith('pending_')) {
        if (daysPending <= 2) {
            badgeVariant = "success";
            rowClass = "border-b bg-green-500/10 hover:bg-green-500/20";
        } else if (daysPending <= 4) {
            badgeVariant = "warning";
            rowClass = "border-b bg-yellow-500/10 hover:bg-yellow-500/20";
        } else if (daysPending <= 7) {
            badgeVariant = "orange";
            rowClass = "border-b bg-orange-500/10 hover:bg-orange-500/20";
        } else {
            badgeVariant = "destructive";
            rowClass = "border-b bg-red-500/10 hover:bg-red-500/20";
        }
    }
    return { badgeVariant, rowClass, relativeTime, statusText };
}
const StatusCell = ({ request }: { request: FinancialRequest }) => {
    const { badgeVariant, relativeTime, statusText } = getStatusStyle(request);
    return (
        <div className="flex flex-col">
            <Badge variant={badgeVariant} className="capitalize">{statusText}</Badge>
            {relativeTime && (<span className="text-xs text-muted-foreground italic mt-1">{relativeTime}</span>)}
        </div>
    );
};

const getAge = (request: FullFinancialRequest): string => {
    let dateToCompare: string | null = null;

    // Determine which date to compare against
    switch (request.status) {
        case 'pending_budget':
            // Age is time since creation
            dateToCompare = request.created_at;
            break;
        case 'pending_accounting':
            // Age is time since budget approval
            dateToCompare = request.budget_approved_at;
            break;
        case 'pending_cashier':
            // Age is time since accounting approval
            dateToCompare = request.accounting_approved_at;
            break;
        default:
            // For 'completed', 'rejected', or other statuses, no age is needed
            return 'N/A';
    }

    if (!dateToCompare) {
        // This is a fallback in case the approval date is missing.
        // It will calculate from the creation date.
        dateToCompare = request.created_at;
    }

    // Use the existing function you import
    return formatDistanceToNow(new Date(dateToCompare), { addSuffix: true });
};
// --- OMITTED HELPERS FOR BREVITY ---


// --- MAIN INDEX COMPONENT ---
export default function Index(props: IndexPageProps) {
    const { auth, requests, request, ziggy } = props; // Destructure all props
    
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const tab = ziggy.query?.tab; 
    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: 'created_at', 
        direction: 'descending' 
    });

    // --- FIX: Removed all client-side pagination state ---
    // (currentPage, ITEMS_PER_PAGE, totalPages, handlePageChange, etc.)
    // This is now handled by the 'PaginationLinks' component and server-side logic.

    const [viewingRequest, setViewingRequest] = useState<FullFinancialRequest | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (request) {
            setViewingRequest(request);
            setIsSheetOpen(true);
        }
    }, [request]); 

    const filteredRequests = useMemo(() => {
        // --- FIX: Access the data array from the paginator object ---
        return requests.data.filter(request => {
            const typeMatch = (typeFilter === 'All') || (request.request_type === typeFilter);
            const statusMatch = (statusFilter === 'All') || (request.status === statusFilter);
            return typeMatch && statusMatch;
        });
    }, [requests, typeFilter, statusFilter]);

    const processedRequests = useMemo(() => {
        // 1. Filter first
        // --- FIX: Access the data array from the paginator object ---
        // This also fixes the implicit 'any' types for 'a' and 'b' in the sort function.
        const filtered = requests.data.filter(request => {
            const typeMatch = (typeFilter === 'All') || (request.request_type === typeFilter);
            const statusMatch = (statusFilter === 'All') || (request.status === statusFilter);
            return typeMatch && statusMatch;
        });

        // 2. Then Sort
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === null) return 1;
                if (bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [requests, typeFilter, statusFilter, sortConfig]);
    
    const handleViewRequest = (id: number) => {
        router.get(route('financial.show', id), {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['request'], 
            onError: () => {
                alert("Error loading request details.");
            }
        });
    };

    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) {
            setViewingRequest(null);
            router.get(route('financial.index'), {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['requests'], 
            });
        }
    }

    // --- (Create Tab logic is unchanged) ---
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "", request_type: "", amount: "", description: "", attachments: [] as string[],
    });
    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
   const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    post(route('financial.store'), {
        preserveScroll: true,
        onSuccess: (page: Page<IndexPageProps>) => { // 'Page' type is now correctly imported
            reset(); 
            setFiles([]);
        },
        onError: (formErrors) => {
            console.error("Form submission errors:", formErrors);
            toast.error('Submission Failed', { 
                description: "Please check the form for errors." 
            });
        }
    });
};
const requestSort = (key: keyof FinancialRequest) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (
            sortConfig && 
            sortConfig.key === key && 
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    const handleProcessFile = (error: any, file: FilePondFile) => {
        if (!error) {
            setData(currentData => ({...currentData, attachments: [...currentData.attachments, file.serverId]}));
        } else { console.error('handleProcessFile: ERROR', error); }
    };
    const handleRemoveFile = (error: any, file: FilePondFile) => {
        if (!error) {
            setData(currentData => ({...currentData, attachments: currentData.attachments.filter(id => id !== file.serverId)}));
        } else { console.error('handleRemoveFile: ERROR', error); }
    };
    const formattedDateTime = currentTime.toLocaleString('en-US', {
         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
         hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
    });
    const isUploading = files.some(file => [1, 2, 3, 7].includes(file.status));
    const userRoles = (auth.user?.roles as string[]) || [];

    // --- COMPONENT RENDER ---
    return (
        <AppLayout user={auth.user!} page_title="My Financial Requests">
            <Head title="My Financial Requests" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <Tabs defaultValue={tab || 'all_requests'} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                            <TabsTrigger value="all_requests">All Requests</TabsTrigger>
                            <TabsTrigger value="create_new">Submit New Request</TabsTrigger>
                        </TabsList>

                        {/* --- TAB 1: ALL REQUESTS (Unchanged) --- */}
                        <TabsContent value="all_requests">
                            <Card>
                                <CardHeader>
                                    <div>
                                        <CardTitle>My Submitted Requests</CardTitle>
                                        <CardDescription>Filter your financial requests and their current status.</CardDescription>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <div className="flex-1">
                                            <Label htmlFor="type_filter">Filter by Type</Label>
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
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => requestSort('created_at')}>
                                                        Date
                                                        {sortConfig.key === 'created_at' && (
                                                            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => requestSort('title')}>
                                                        Title
                                                        {sortConfig.key === 'title' && (
                                                            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => requestSort('amount')}>
                                                        Amount
                                                        {sortConfig.key === 'amount' && (
                                                            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" onClick={() => requestSort('status')}>
                                                        Status
                                                        {sortConfig.key === 'status' && (
                                                            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {/* 'processedRequests' mapping is now correctly typed */}
                                            {processedRequests.length > 0 ? (
                                                processedRequests.map((request) => (
                                                    <TableRow 
                                                        key={request.id} 
                                                        className={getStatusStyle(request).rowClass}
                                                    >
                                                        <TableCell>{formatDate(request.created_at)}</TableCell>
                                                        <TableCell className="font-medium">{request.title}</TableCell>
                                                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                                                        <TableCell><StatusCell request={request} /></TableCell>
                                                        <TableCell className="text-center">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleViewRequest(request.id)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={5} className="text-center">No requests match.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    {/* --- FIX: Use the 'PaginationLinks' component you imported --- */}
                                    <PaginationLinks links={requests.links} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- TAB 2: CREATE NEW (Unchanged) --- */}
                       
                        <TabsContent value="create_new">
                            <form onSubmit={handleFormSubmit}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Submit New Financial Request</CardTitle>
                                        <CardDescription className="flex justify-between items-center">
                                            <span>Fill out the form below and attach supporting documents.</span>
                                            <span className="text-sm text-muted-foreground">{formattedDateTime}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="user_name">Requested By</Label>
                                                <Input id="user_name" value={auth.user?.name} readOnly className="bg-muted" />
                                            </div>
                                            <div>
                                                <Label htmlFor="user_role">User Role</Label>
                                                <Input id="user_role" value={userRoles.join(', ')} readOnly className="bg-muted" />
                                            </div>
                                        </div>
                                        <hr/>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="request_type">Type of Request</Label>
                                                <Select required onValueChange={(value) => setData('request_type', value)} value={data.request_type}>
                                                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {requestTypesForm.map(type => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.request_type} className="mt-2" />
                                            </div>
                                            <div>
                                                <Label htmlFor="amount">Proposed Amount (PHP)</Label>
                                                <Input id="amount" type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                                <InputError message={errors.amount} className="mt-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="title">Payee</Label>
                                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description / Purpose (Optional)</Label>
                                            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label>Attachments (Required)</Label>
                                            <FilePondUploader
                                                files={files}
                                                onUpdateFiles={(fileItems: FilePondFile[]) => setFiles(fileItems)}
                                                onProcessFile={handleProcessFile}
                                                onRemoveFile={handleRemoveFile}
                                            />
                                            <InputError message={errors.attachments || (errors['attachments.0'] ? 'Please upload at least one valid file.' : '')} className="mt-2" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Form will reset on success.</span>
                                        <Button
                                            type="submit"
                                            disabled={ processing || isUploading || data.attachments.length === 0 || !data.request_type }
                                        >
                                            {processing ? 'Submitting...' : (isUploading ? 'Uploading...' : 'Submit to Budget')}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* --- THE SHEET COMPONENT (MODAL) --- */}
                    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                            {viewingRequest ? (
                                <ViewRequestSheet request={viewingRequest} />
                            ) : (
                                <p>Loading...</p>
                            )}
                        </SheetContent>
                    </Sheet>

                </div>
            </div>
        </AppLayout>
    );
}