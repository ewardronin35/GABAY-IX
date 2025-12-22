import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    FileText, CheckCircle2, Clock, Printer, Eye, 
    CalendarDays, FileDown, Ban, Search, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// --- TYPES ---
type ApprovalStatus = 'pending_ceps' | 'pending_rd' | 'approved' | 'rejected' | 'Pending' | 'Chief Approved' | 'Approved' | 'Rejected'; 

interface TravelRequest {
    id: number;
    ref_no: string;
    destination: string;
    date_range: string;
    total_cost: number;
    status: ApprovalStatus;
    travel_order_code?: string;
    reimbursement_status: 'Not Started' | 'Processing' | 'Paid';
    created_at: string;
    requester_name?: string; 
}

interface PageProps {
    auth: any;
    requests: TravelRequest[];
    pageTitle?: string;
}

// --- HELPER: Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    
    if (s === 'approved') return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
    if (s === 'rejected') return <Badge variant="destructive" className="gap-1"><Ban className="w-3 h-3" /> Rejected</Badge>;
    if (s.includes('rd') || s === 'chief approved') return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white gap-1"><Clock className="w-3 h-3" /> For RD Approval</Badge>;
    
    return <Badge variant="secondary" className="text-zinc-500 gap-1"><Clock className="w-3 h-3" /> For Chief EPS</Badge>;
};

// --- HELPER: Print Actions ---
const PrintActions = ({ id, status }: { id: number, status: string }) => {
    if (status.toLowerCase() !== 'approved') return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-emerald-600">
                    <Printer className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Print Documents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(route('travel-orders.print-memo', id), '_blank')}>
                    <FileText className="w-4 h-4 mr-2" /> Travel Order (Memo)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(route('travel-orders.print-authority', id), '_blank')}>
                    <FileDown className="w-4 h-4 mr-2" /> Authority to Travel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function TravelOrderList({ auth, requests, pageTitle }: PageProps) {    
    
    // ✨ REAL-TIME LISTENER (Pusher)
    useEffect(() => {
        // Only run this if Echo is configured
        if (window.Echo) {
            const channel = window.Echo.channel('travel-orders');
            channel.listen('TravelOrderUpdated', () => {
                // Reload only the 'requests' prop without full page refresh
                router.reload({ only: ['requests'] });
            });

            return () => {
                window.Echo.leave('travel-orders');
            };
        }
    }, []);

    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // Default to Pending tab
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // --- FILTERING ---
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            // 1. Search Logic
            const matchesSearch = 
                req.ref_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (req.requester_name && req.requester_name.toLowerCase().includes(searchQuery.toLowerCase()));
            
            // 2. Tab Logic
           // 2. Tab Logic
            let matchesTab = true;
            const s = req.status.toLowerCase(); // 'pending', 'chief approved', 'approved', 'rejected'

            if (activeTab === 'pending') {
                // "Pending" tab should show: 'pending' OR 'chief approved' (i.e. anything in progress)
                matchesTab = s === 'pending' || s === 'chief approved' || s.includes('pending');
            } else if (activeTab === 'approved') {
                matchesTab = s === 'approved';
            } else if (activeTab === 'rejected') {
                matchesTab = s === 'rejected';
            }
            // 'all' shows everything
            // 'all' tab shows everything, so matchesTab remains true

            return matchesSearch && matchesTab;
        });
    }, [requests, searchQuery, activeTab]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab]);

    return (
        <AuthenticatedLayout user={auth.user} page_title={pageTitle || "My Travel Requests"}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {pageTitle || "Travel Requests"}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            Manage requests and approvals.
                            {/* Live Indicator */}
                            <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <span className="relative flex h-2 w-2 mr-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live
                            </span>
                        </p>
                    </div>
                    
                    {/* Create Button */}
                    <Link href={route('travel-orders.create')} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <FileText className="w-4 h-4 mr-2" /> Create Request
                        </Button>
                    </Link>
                </div>

                {/* TABS & FILTERS */}
                <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        
                        {/* Tab Triggers */}
                        <TabsList className="grid w-full sm:w-auto grid-cols-4">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-10 bg-white dark:bg-zinc-900"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <TableRow>
                                            <TableHead className="w-[180px] pl-6">Reference</TableHead>
                                            <TableHead className="w-[300px]">Details</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden md:table-cell">Authority Code</TableHead>
                                            <TableHead className="hidden sm:table-cell">Reimbursement</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-48 text-center text-zinc-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FileText className="w-8 h-8 text-zinc-300" />
                                                        <p>No records found in this tab.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedRequests.map((req) => (
                                                <TableRow key={req.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                                    
                                                    {/* REF & DATE */}
                                                    <TableCell className="pl-6 align-top py-4">
                                                        <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{req.ref_no}</div>
                                                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                                            <CalendarDays className="w-3 h-3" /> {req.created_at}
                                                        </div>
                                                        {req.requester_name && (
                                                            <div className="mt-1 text-[10px] text-zinc-500 font-medium">
                                                                by {req.requester_name}
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    {/* DETAILS */}
                                                    <TableCell className="align-top py-4">
                                                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{req.destination}</div>
                                                        <div className="text-xs text-zinc-500 mt-0.5">{req.date_range}</div>
                                                        <div className="mt-2 inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] rounded border border-emerald-100 dark:border-emerald-800">
                                                            Total: ₱ {req.total_cost.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                        </div>
                                                    </TableCell>

                                                    {/* STATUS */}
                                                    <TableCell className="align-top py-4">
                                                        <StatusBadge status={req.status} />
                                                    </TableCell>

                                                    {/* CODE */}
                                                    <TableCell className="hidden md:table-cell align-top py-4">
                                                        {req.status.toLowerCase() === 'approved' ? (
                                                            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300 font-mono text-[10px]">
                                                                {req.travel_order_code || 'Processing...'}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-zinc-400 text-xs italic">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* REIMBURSEMENT */}
                                                    <TableCell className="hidden sm:table-cell align-top py-4">
                                                        <Badge variant="outline" className={`
                                                            ${req.reimbursement_status === 'Paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                                              req.reimbursement_status === 'Processing' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                                              'text-zinc-400 border-zinc-200'}
                                                        `}>
                                                            {req.reimbursement_status}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* ACTIONS */}
                                                   {/* ... inside TableRow ... */}
<TableCell className="text-right pr-6 align-top py-4">
    <div className="flex justify-end gap-2">
        
        {/* EXISTING VIEW BUTTON */}
        <Link href={route('travel-orders.show', req.id)}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50">
                <Eye className="w-4 h-4" />
            </Button>
        </Link>

        {/* EXISTING PRINT ACTIONS */}
        <PrintActions id={req.id} status={req.status} />

        {/* ✨ ADD THIS: OPTIONAL 4 (FILE CLAIM BUTTON) ✨ */}
        {req.status.toLowerCase() === 'approved' && (
            <Link href={route('travel-claims.create', { code: req.travel_order_code })}>
                <Button variant="outline" size="sm" className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-wide">
                    File Claim
                </Button>
            </Link>
        )}

    </div>
</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        
                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs text-zinc-500">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}