import AppLayout from "@/layouts/app-layout";
import { PageProps, User, FullFinancialRequest, Paginator } from "@/types"; 
import { Head, router } from "@inertiajs/react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, Check, X, ArrowUp, ArrowDown } from "lucide-react"; 
import { ViewRequestSheet } from "../Financial/ViewRequestSheet"; // Re-using your component
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; // Your pagination component
import { pickBy } from 'lodash';
import { useDebounce } from "use-debounce";

// --- TYPES & HELPERS ---

interface FinancialRequest {
    id: number;
    title: string;
    request_type: string;
    amount: number;
    status: string;
    created_at: string;
    remarks: string | null;
    user: User; // The 'user' object is included from our controller
}
interface BudgetQueuePageProps extends PageProps {
    requests: Paginator<FinancialRequest>;
    request?: FullFinancialRequest; // For the modal
    filters: {
        sort?: string;
        direction?: string;
    }
}
type SortConfig = {
    key: keyof FinancialRequest | 'created_at';
    direction: 'asc' | 'desc';
};

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

// --- MAIN BUDGET QUEUE COMPONENT ---
export default function Queue(props: BudgetQueuePageProps) {
    const { auth, requests, request, filters } = props; 
    
    // State for modals
    const [viewingRequest, setViewingRequest] = useState<FullFinancialRequest | null>(null);
    const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [requestToActOn, setRequestToActOn] = useState<FinancialRequest | null>(null);
    const [remarks, setRemarks] = useState("");

    // State for sorting
    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: (filters.sort || 'created_at') as keyof FinancialRequest, 
        direction: (filters.direction || 'desc') as 'asc' | 'desc' 
    });
    const debouncedSort = useDebounce(sortConfig, 300);

    // Re-fetch data when sort changes
    useEffect(() => {
        router.get(route('budget.queue'), pickBy(debouncedSort), {
            preserveState: true,
            preserveScroll: true,
            only: ['requests', 'filters'],
        });
    }, [debouncedSort]);

    // Hook to open view modal
    useEffect(() => {
        if (request) {
            setViewingRequest(request);
            setIsViewSheetOpen(true);
        }
    }, [request]);

    // View handler
    const handleViewRequest = (id: number) => {
        // We use 'financial.show' because our controller logic is there
        router.get(route('financial.show', id), {}, {
            preserveState: true, preserveScroll: true, only: ['request'],
            onError: () => { alert("Error loading request details."); }
        });
    };
    
    const handleSheetOpenChange = (open: boolean) => {
        setIsViewSheetOpen(open);
        if (!open) {
            setViewingRequest(null);
            router.get(route('budget.queue'), {}, {
                preserveState: true, preserveScroll: true, only: ['requests'],
            });
        }
    }

    // --- ACTION HANDLERS ---
    
const handleApprove = (requestItem: FinancialRequest) => {
        router.post(route('budget.approve', requestItem.id), {}, {
            preserveScroll: true,
            // This tells Inertia to only update what's needed
            // The controller sends back the new list, so the item disappears
            only: ['requests', 'flash'],
            onSuccess: () => {
                // The toast will fire automatically from app-layout.tsx
            }
        });
    };
    
    const openRejectModal = (requestItem: FinancialRequest) => {
        setRequestToActOn(requestItem);
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = () => {
        if (!requestToActOn || !remarks) return;
        
        router.post(route('budget.reject', requestToActOn.id), { remarks }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setRemarks("");
            }
        });
    };

    const requestSort = (key: keyof FinancialRequest) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (
            sortConfig.key === key && 
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <AppLayout user={auth.user!} page_title="Budget Approval Queue">
            <Head title="Budget Approval Queue" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Budget Approvals</CardTitle>
                            <CardDescription>
                                Review and approve or reject the following requests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('created_at')}>
                                                Date
                                                {sortConfig.key === 'created_at' && (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('title')}>
                                                Title
                                                {sortConfig.key === 'title' && (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('amount')}>
                                                Amount
                                                {sortConfig.key === 'amount' && (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.data.length > 0 ? (
                                        requests.data.map((requestItem) => (
                                            <TableRow key={requestItem.id} className="border-b">
                                                <TableCell>{formatDate(requestItem.created_at)}</TableCell>
                                                <TableCell>{requestItem.user.name}</TableCell>
                                                <TableCell className="font-medium">{requestItem.title}</TableCell>
                                                <TableCell>{formatCurrency(requestItem.amount)}</TableCell>
                                                <TableCell className="text-center space-x-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleViewRequest(requestItem.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => handleApprove(requestItem)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => openRejectModal(requestItem)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={5} className="text-center">No pending requests.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <PaginationLinks links={requests.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View Modal (Sheet) */}
            <Sheet open={isViewSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {viewingRequest ? (
                        <ViewRequestSheet request={viewingRequest} />
                    ) : (
                        <p>Loading...</p>
                    )}
                </SheetContent>
            </Sheet>

            {/* Reject Modal (Alert) */}
            <AlertDialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this request. This remark
                            will be visible to the user.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Rejection Remarks (Required)</Label>
                        <Textarea 
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="e.g., Exceeds department budget..."
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmReject} disabled={!remarks}>
                            Confirm Rejection
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}