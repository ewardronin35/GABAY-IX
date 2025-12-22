import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; 
import { Toaster } from "@/components/ui/sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    CheckCircle2, XCircle, ArrowLeft, Printer, 
    FileText, UserCircle, Info, Loader2, Paperclip, Eye
} from "lucide-react";
import { route } from 'ziggy-js';

interface ViewProps {
    auth: any;
    order: any;
    isApprover: boolean; 
    userRole: 'chief' | 'rd' | 'staff'; 
}

export default function ViewTravelOrder({ auth, order, isApprover, userRole }: ViewProps) {
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // --- ACTIONS ---
    const handleApprove = () => {
        const routeName = userRole === 'rd' ? 'travel-orders.rd-approve' : 'travel-orders.chief-endorse';
        router.post(route(routeName, order.id), {}, {
            onStart: () => setProcessing(true),
            onSuccess: () => {
                toast.success(userRole === 'rd' ? "Approved Final" : "Endorsed Successfully");
                setProcessing(false);
            },
            onError: () => {
                toast.error("Error Processing Request");
                setProcessing(false);
            }
        });
    };

    const handleReject = () => {
        const routeName = userRole === 'rd' ? 'travel-orders.rd-reject' : 'travel-orders.chief-reject';
        router.post(route(routeName, order.id), { reason: rejectReason }, {
            onStart: () => setProcessing(true),
            onSuccess: () => {
                toast.error("Request Rejected");
                setProcessing(false);
                setIsRejectOpen(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Approved': 'bg-emerald-600',
            'Rejected': 'bg-red-600',
            'Chief Approved': 'bg-indigo-600',
            'Pending': 'bg-amber-500',
        };
        return <Badge className={`${styles[status] || 'bg-zinc-500'} text-white`}>{status}</Badge>;
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title={`Review ${order.ref_no}`}>
            <Head title={`Review ${order.ref_no}`} />
            <Toaster />
            
            <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pb-32">
                
                {/* HEADER */}
                <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => window.history.back()}><ArrowLeft className="w-5 h-5" /></Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{order.ref_no}</h1>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-1"><UserCircle className="w-3 h-3" /> {order.official_name}</div>
                            </div>
                        </div>
                        {order.status === 'Approved' && (
                            <div className="hidden md:flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.open(route('travel-orders.print-memo', order.id), '_blank')}><FileText className="w-3.5 h-3.5 mr-2" /> Memo</Button>
                                <Button variant="outline" size="sm" onClick={() => window.open(route('travel-orders.print-authority', order.id), '_blank')}><Printer className="w-3.5 h-3.5 mr-2" /> Authority</Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-6 space-y-6">
                    {order.status === 'Rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-800"><XCircle className="w-5 h-5" /> <div><h4 className="font-bold text-sm">Rejected</h4><p className="text-sm">{order.rejection_reason}</p></div></div>
                    )}

                    <Tabs defaultValue="memo" className="w-full">
                        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
                            <TabsTrigger value="memo">Memorandum</TabsTrigger>
                            <TabsTrigger value="authority">Authority to Travel</TabsTrigger>
                            <TabsTrigger value="attachment">Attachments</TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            
                            {/* --- TAB 1: MEMORANDUM FORM (Visual Replica) --- */}
                            <TabsContent value="memo">
                                <Card className="shadow-lg border-t-4 border-t-indigo-600 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                    <CardContent className="p-8 space-y-8">
                                        
                                        {/* HEADER */}
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                                            <div className="w-20 h-20 relative">
                                                <img src="/chedlogo.png" alt="CHED Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-sm font-serif text-zinc-600 dark:text-zinc-400 tracking-wide">COMMISSION ON HIGHER EDUCATION</h3>
                                                <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-800 dark:text-white mt-1">REGIONAL OFFICE IX</h1>
                                            </div>
                                            <div className="w-20 h-20 relative">
                                                <img src="/Logo2.png" alt="Bagong Pilipinas Logo" className="w-full h-full object-contain" />
                                            </div>
                                        </div>

                                        <h2 className="text-center font-bold text-xl uppercase mb-6 underline underline-offset-4 decoration-2 dark:text-white">TRAVEL AUTHORITY</h2>

                                        {/* MEMO BODY */}
                                        <div className="space-y-6">
                                            
                                            {/* TO Section */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">MEMORANDUM TO:</Label>
                                                <div className="space-y-3 pl-0 md:pl-4">
                                                    <Input 
                                                        readOnly
                                                        value={order.official_name}
                                                        className="font-bold text-lg text-zinc-800 dark:text-white uppercase h-10 border-transparent bg-transparent p-0"
                                                    />
                                                    <Input 
                                                        readOnly
                                                        value={order.position}
                                                        className="text-sm text-zinc-600 dark:text-zinc-300 h-9 border-transparent bg-transparent p-0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-4" />

                                            {/* Fields */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Destination / Place to be visited</Label>
                                                    <div className="text-base font-medium dark:text-white">{order.destination}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Dates</Label>
                                                    <div className="text-base font-medium dark:text-white">{order.date_range}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Purpose of Travel</Label>
                                                    <div className="min-h-[80px] text-base border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 leading-relaxed whitespace-pre-wrap dark:text-zinc-100">
                                                        {order.purpose}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Signature */}
                                            <div className="mt-16 mb-4">
                                                <div className="font-bold text-base uppercase text-zinc-900 dark:text-white tracking-wide">MARIVIC V. IRIBERRI</div>
                                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Officer-in-Charge, Office of the Director IV</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* --- TAB 2: AUTHORITY TO TRAVEL (Visual Replica with Dark Mode) --- */}
                            <TabsContent value="authority">
                                <Card className="shadow-lg border-t-4 border-t-emerald-600 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                    <CardContent className="p-0 sm:p-8">
                                        
                                        {/* HEADER */}
                                        <div className="flex justify-between items-center mb-6 px-4">
                                            <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center overflow-hidden">
                                                <img src="/chedlogo.png" alt="CHED Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <h1 className="font-bold text-lg md:text-xl uppercase tracking-wide dark:text-white">Commission on Higher Education</h1>
                                                <p className="text-xs text-muted-foreground">Higher Education Development Center (HEDC) Building</p>
                                                <p className="text-xs text-muted-foreground">C.P. Garcia Ave., Diliman, Quezon City</p>
                                            </div>
                                            <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center overflow-hidden">
                                                <img src="/Logo2.png" alt="Bagong Pilipinas Logo" className="w-full h-full object-contain" />
                                            </div>
                                        </div>

                                        <h2 className="text-center font-bold text-xl uppercase mb-4 dark:text-white tracking-widest border-b-2 border-zinc-200 dark:border-zinc-700 pb-2 mx-auto w-fit">
                                            Authority to Travel
                                        </h2>

                                        {/* --- MAIN FORM GRID --- */}
                                        <div className="border-2 border-zinc-800 dark:border-zinc-500 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950">
                                            
                                            {/* ROW 1: Name & Position */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500">
                                                <div className="col-span-2 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name of Official/Employee</Label>
                                                    <div className="mt-1 font-bold text-lg uppercase text-zinc-900 dark:text-white">
                                                        {order.official_name}
                                                    </div>
                                                </div>
                                                <div className="col-span-1 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Position</Label>
                                                    <div className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                                                        {order.position}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 2: Office, Dest, Period */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500">
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Office/Station</Label>
                                                    <div className="mt-1 text-sm">CHED Region IX</div>
                                                </div>
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Destination</Label>
                                                    <div className="mt-1 text-sm font-semibold">{order.destination}</div>
                                                </div>
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Period of Travel</Label>
                                                    <div className="mt-1 text-sm">{order.date_range}</div>
                                                </div>
                                            </div>

                                            {/* ROW 3: Purpose & Checkboxes */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500">
                                                <div className="col-span-2 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase mb-2 block tracking-wider">Purpose of Travel</Label>
                                                    <div className="text-sm leading-tight">{order.purpose}</div>
                                                </div>
                                                <div className="col-span-1 p-4 space-y-3 flex flex-col justify-center bg-zinc-100 dark:bg-zinc-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox checked disabled className="border-zinc-500" />
                                                        <Label className="font-semibold text-sm">Official Business</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox disabled className="border-zinc-500" />
                                                        <Label className="font-semibold text-sm">Official Time Only</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 4: Expenses Header */}
                                            <div className="border-b border-zinc-800 dark:border-zinc-500 p-1.5 bg-zinc-200 dark:bg-zinc-800 text-center">
                                                <p className="text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-0.5">* authorized to reimburse actual expenses</p>
                                                <p className="font-bold text-lg uppercase tracking-wide">Estimated Expenses</p>
                                            </div>

                                            {/* ROW 5: Expenses Table */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500 min-h-[120px]">
                                                {/* Expense Columns */}
                                                <div className="text-center p-3 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tighter">Air Fare + Insurance</Label>
                                                    <div className="font-mono text-base">₱ {Number(order.est_airfare).toLocaleString()}</div>
                                                </div>
                                                <div className="text-center p-3 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Training / Reg Fee</Label>
                                                    <div className="font-mono text-base">₱ {Number(order.est_registration).toLocaleString()}</div>
                                                </div>
                                                <div className="text-center p-3 space-y-2 bg-emerald-50/50 dark:bg-emerald-900/10">
                                                    <Label className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Travel Allowance</Label>
                                                    <div className="font-mono text-base">₱ {Number(order.est_allowance).toLocaleString()}</div>
                                                    
                                                    <div className="border-t border-zinc-300 dark:border-zinc-600 pt-2 mt-2">
                                                        <Label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Amount</Label>
                                                        <div className="text-right font-bold text-lg font-mono text-emerald-700 dark:text-emerald-300">
                                                            ₱ {Number(order.est_total).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkboxes */}
                                                <div className="p-4 space-y-4 flex flex-col justify-center bg-zinc-100 dark:bg-zinc-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox disabled className="border-zinc-500" />
                                                        <Label className="text-sm">Cash Advance</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox disabled className="border-zinc-500" />
                                                        <Label className="text-sm">Reimbursement</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 6: Signatories */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500 text-xs">
                                                {/* Column 1 */}
                                                <div className="p-3 flex flex-col justify-between h-48 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="uppercase text-muted-foreground text-[10px] tracking-widest">Requested By:</Label>
                                                    <div className="text-center mt-4">
                                                        <div className="font-bold text-lg uppercase tracking-tight">{order.official_name}</div>
                                                        <div className="text-[10px] text-muted-foreground">{order.position}</div>
                                                    </div>
                                                    <div className="mt-auto border-t border-dashed border-zinc-400 dark:border-zinc-600 pt-1 flex justify-between items-end">
                                                        <Label className="text-[10px]">Date:</Label>
                                                    </div>
                                                </div>

                                                {/* Column 2 */}
                                                <div className="p-3 flex flex-col justify-between h-48 bg-zinc-50/50 dark:bg-zinc-900/30">
                                                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-1">
                                                        <Label className="uppercase text-muted-foreground text-[10px] tracking-widest">Funds Available:</Label>
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <div className="font-bold text-base uppercase text-zinc-800 dark:text-zinc-200">KIMBERLY BUHIAN</div>
                                                        <div className="text-[10px] text-zinc-500">Administrative Officer III</div>
                                                        <div className="text-[10px] font-semibold text-zinc-500">Budget Division</div>
                                                    </div>
                                                    <div className="mt-auto border-t border-dashed border-zinc-400 dark:border-zinc-600 pt-1">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-[10px] whitespace-nowrap">Source of Funds:</Label>
                                                            <div className="font-bold italic text-zinc-700 dark:text-zinc-300">{order.fund_source}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3 */}
                                                <div className="p-3 flex flex-col justify-between h-48 bg-zinc-50/50 dark:bg-zinc-900/30">
                                                    <Label className="uppercase text-muted-foreground text-[10px] tracking-widest">Approved By:</Label>
                                                    <div className="text-center mt-4">
                                                        <div className="font-bold text-base uppercase text-zinc-800 dark:text-zinc-200">MARIVIC V. IRIBERRI</div>
                                                        <div className="text-[10px] text-zinc-500">Officer-in-Charge</div>
                                                        <div className="text-[10px] text-zinc-500">Office of the Director IV</div>
                                                    </div>
                                                    <div className="mt-auto border-t border-dashed border-zinc-400 dark:border-zinc-600 pt-1 flex justify-between items-end">
                                                        <Label className="text-[10px]">Date:</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 7: Footer Arranger Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500 h-28 bg-white dark:bg-zinc-950">
                                                <div className="p-3 relative">
                                                    <Label className="text-red-600 dark:text-red-500 font-bold text-[10px] uppercase tracking-wide">Assigned Travel Arranger:</Label>
                                                    <div className="absolute bottom-4 left-4 right-4 border-b border-zinc-800 dark:border-zinc-500 h-8"></div>
                                                </div>
                                                <div className="p-3 relative">
                                                    <Label className="text-red-600 dark:text-red-500 font-bold text-[10px] uppercase tracking-wide">Approved for Issuance of Airline Ticket:</Label>
                                                    <div className="absolute bottom-4 left-4 right-4 border-b border-zinc-800 dark:border-zinc-500 h-8"></div>
                                                </div>
                                            </div>
                                            {/* ROW 8: Received By */}
                                            <div className="p-3 h-20 relative border-t border-zinc-800 dark:border-zinc-500 bg-white dark:bg-zinc-950">
                                                <Label className="text-red-600 dark:text-red-500 font-bold text-[10px] uppercase tracking-wide">Airline Ticket Received By:</Label>
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* --- TAB 3: ATTACHMENTS --- */}
                            <TabsContent value="attachment">
                                <Card className="shadow-lg border-t-4 border-t-blue-500 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                    <CardContent className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                                        {order.memo_url ? (
                                            <>
                                                <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-full"><Paperclip className="w-10 h-10 text-blue-600 dark:text-blue-400" /></div>
                                                <div className="text-center">
                                                    <h3 className="font-bold text-xl dark:text-white">Attached Memorandum</h3>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">This document was uploaded by the requester.</p>
                                                </div>
                                                <Button onClick={() => window.open(order.memo_url, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                                    <Eye className="w-4 h-4 mr-2" /> View Document
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-center text-zinc-400">
                                                <XCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                                <p>No document attached.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* ACTION BAR */}
                {isApprover && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-xl z-40">
                        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <Info className="w-4 h-4" /> Current Status: <strong className="text-zinc-900 dark:text-zinc-100">{order.status}</strong>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                                    <DialogTrigger asChild><Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Reject</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Reject Request</DialogTitle><DialogDescription>Reason for rejection:</DialogDescription></DialogHeader>
                                        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." />
                                        <DialogFooter><Button onClick={handleReject} variant="destructive">Confirm</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700 text-white">{userRole === 'chief' ? 'Endorse' : 'Approve'}</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Approve Request?</AlertDialogTitle><AlertDialogDescription>This will process the request.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleApprove}>Confirm</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}