import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, MapPin, Calendar, Car, BellRing, FileSpreadsheet, History as HistoryIcon, BarChart3, AlertTriangle, Eye, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminDashboard({ auth, pending, history, reports, stats }: any) {
    const { flash } = usePage().props;
    
    // State for Viewing Details
    const [viewData, setViewData] = useState<any | null>(null);
    const [viewType, setViewType] = useState<'locator' | 'leave' | 'ticket' | null>(null);

    // State for Confirmation Dialog
    const [confirmAction, setConfirmAction] = useState<{type: 'locator'|'leave'|'ticket', id: number, status: 'approved'|'rejected'} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success('Success', { description: flash.success });
        if (flash.error) toast.error('Error', { description: flash.error });
    }, [flash]);

    // 1. Open Confirmation Dialog (Replaces native confirm)
    const initiateAction = (type: 'locator' | 'leave' | 'ticket', id: number, status: 'approved' | 'rejected') => {
        setConfirmAction({ type, id, status });
    };

    // 2. Execute Action (Called by Dialog)
    const proceedWithAction = () => {
        if (!confirmAction) return;

        setIsProcessing(true);
        const { type, id, status } = confirmAction;

        router.put(route('admin.approvals.update', { type, id }), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmAction(null);
                setIsProcessing(false);
                toast.success(`Request ${status} successfully.`);
            },
            onError: () => {
                setIsProcessing(false);
                toast.error("Failed to update status.");
            }
        });
    };

    const openView = (type: 'locator' | 'leave' | 'ticket', item: any) => {
        setViewType(type);
        setViewData(item);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Approval Center" />

            {/* --- MAIN DASHBOARD CONTENT (Hidden when printing) --- */}
            <div className="py-8 container mx-auto px-4 space-y-8 print:hidden">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <BellRing className="h-8 w-8 text-blue-600" />
                            Approval Center
                        </h2>
                        <p className="text-muted-foreground">Manage approvals, view history, and generate reports.</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-zinc-900">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Badge>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending_total}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved Today</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold text-emerald-600">{stats.approved_today}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Rejected Today</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold text-red-600">{stats.rejected_today}</div></CardContent>
                    </Card>
                </div>

                {/* TABS */}
                <Tabs defaultValue="pending" className="w-full space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg w-fit h-11">
                        <TabsTrigger value="pending" className="gap-2"><BellRing className="h-4 w-4"/> Pending</TabsTrigger>
                        <TabsTrigger value="history" className="gap-2"><HistoryIcon className="h-4 w-4"/> History</TabsTrigger>
                        <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4"/> Monthly Reports</TabsTrigger>
                    </TabsList>

                    {/* === 1. PENDING === */}
                    <TabsContent value="pending" className="space-y-6">
                        {/* LOCATORS */}
                        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-blue-500"/> Locator Slips</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50"><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Details</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {pending.locators.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No pending locator slips.</TableCell></TableRow>}
                                        {pending.locators.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.user?.name}</TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{item.type}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-xs">{item.destination}</div>
                                                    <div className="text-xs text-muted-foreground truncate w-48">{item.purpose}</div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 flex justify-end">
                                                    <Button size="icon" variant="ghost" onClick={() => openView('locator', item)}><Eye className="h-4 w-4 text-slate-500"/></Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => initiateAction('locator', item.id, 'approved')}><Check className="h-3 w-3 mr-1"/> Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => initiateAction('locator', item.id, 'rejected')}><X className="h-3 w-3 mr-1"/> Reject</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* LEAVES */}
                        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-purple-500"/> Leave Applications</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50"><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {pending.leaves.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No pending leaves.</TableCell></TableRow>}
                                        {pending.leaves.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.last_name}, {item.first_name}</TableCell>
                                                <TableCell className="capitalize">{item.leave_type.replace('_', ' ')}</TableCell>
                                                <TableCell>
                                                    {new Date(item.inclusive_date_start).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} to {new Date(item.inclusive_date_end).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                                                    <span className="text-muted-foreground ml-1">({item.working_days} days)</span>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 flex justify-end">
                                                    <Button size="icon" variant="ghost" onClick={() => openView('leave', item)}><Eye className="h-4 w-4 text-slate-500"/></Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => initiateAction('leave', item.id, 'approved')}><Check className="h-3 w-3 mr-1"/> Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => initiateAction('leave', item.id, 'rejected')}><X className="h-3 w-3 mr-1"/> Reject</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* TICKETS */}
                        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Car className="h-4 w-4 text-orange-500"/> Vehicle Trip Tickets</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50"><TableRow><TableHead>Driver</TableHead><TableHead>Vehicle</TableHead><TableHead>Details</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {pending.tickets.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No pending tickets.</TableCell></TableRow>}
                                        {pending.tickets.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">{item.driver_name}</div>
                                                    <div className="text-[10px] text-muted-foreground">Req by: {item.user?.name}</div>
                                                </TableCell>
                                                <TableCell className="capitalize">{item.vehicle_plate.replace('_', ' ')}</TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-xs">{item.destination}</div>
                                                    <div className="text-[10px] text-muted-foreground">{new Date(item.date_of_travel).toLocaleDateString()}</div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 flex justify-end">
                                                    <Button size="icon" variant="ghost" onClick={() => openView('ticket', item)}><Eye className="h-4 w-4 text-slate-500"/></Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => initiateAction('ticket', item.id, 'approved')}><Check className="h-3 w-3 mr-1"/> Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => initiateAction('ticket', item.id, 'rejected')}><X className="h-3 w-3 mr-1"/> Reject</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* === 2. HISTORY === */}
                    <TabsContent value="history">
                        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader><CardTitle>Approval History</CardTitle><CardDescription>Last 50 processed requests.</CardDescription></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                                        <TableRow><TableHead>Type</TableHead><TableHead>Employee</TableHead><TableHead>Info</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.locators.map((item: any) => (
                                            <TableRow key={`loc-${item.id}`}>
                                                <TableCell><Badge variant="outline">Locator</Badge></TableCell>
                                                <TableCell>{item.user?.name}</TableCell>
                                                <TableCell>
                                                    <div className="text-xs">{item.destination}</div>
                                                    <div className="text-[10px] text-muted-foreground">Duration: {item.duration_str}</div>
                                                </TableCell>
                                                <TableCell><Badge variant={item.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{item.status}</Badge></TableCell>
                                                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => openView('locator', item)}><Eye className="h-4 w-4 text-slate-500"/></Button></TableCell>
                                            </TableRow>
                                        ))}
                                        {history.leaves.map((item: any) => (
                                            <TableRow key={`leave-${item.id}`}>
                                                <TableCell><Badge variant="outline" className="border-purple-200 text-purple-700">Leave</Badge></TableCell>
                                                <TableCell>{item.user?.name}</TableCell>
                                                <TableCell className="text-xs">{item.leave_type.replace('_', ' ')} ({item.working_days} days)</TableCell>
                                                <TableCell><Badge variant={item.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{item.status}</Badge></TableCell>
                                                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => openView('leave', item)}><Eye className="h-4 w-4 text-slate-500"/></Button></TableCell>
                                            </TableRow>
                                        ))}
                                        {history.tickets.map((item: any) => (
                                            <TableRow key={`ticket-${item.id}`}>
                                                <TableCell><Badge variant="outline" className="border-orange-200 text-orange-700">Ticket</Badge></TableCell>
                                                <TableCell>{item.driver_name}</TableCell>
                                                <TableCell className="text-xs">{item.destination} ({item.vehicle_plate})</TableCell>
                                                <TableCell><Badge variant={item.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{item.status}</Badge></TableCell>
                                                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => openView('ticket', item)}><Eye className="h-4 w-4 text-slate-500"/></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* === 3. REPORTS === */}
                    <TabsContent value="reports">
                        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Monthly Personnel Report</CardTitle>
                                    <CardDescription>Track monthly allowance (4 hours) and leave balances.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.print()}><FileSpreadsheet className="h-4 w-4 mr-2"/> Print Report</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead className="text-center">Personal Travel (Max 4h)</TableHead>
                                            <TableHead className="text-center">Official Travel</TableHead>
                                            <TableHead className="text-center">Leave Days</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.map((row: any) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-medium">
                                                    {row.name}
                                                    <div className="text-[10px] text-muted-foreground">{row.department}</div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={row.is_over_limit ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                                                        {row.personal_hours} hrs
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground">{row.official_hours} hrs</TableCell>
                                                <TableCell className="text-center">{row.leave_days}</TableCell>
                                                <TableCell className="text-right">
                                                    {row.is_over_limit ? (
                                                        <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3"/> Over Limit</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Within Limit</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* --- VIEW DETAILS DIALOG --- */}
            <Dialog open={!!viewData} onOpenChange={(open) => !open && setViewData(null)}>
                <DialogContent className="sm:max-w-lg dark:bg-zinc-900 dark:border-zinc-800 print:hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {viewType === 'locator' && <MapPin className="h-5 w-5 text-blue-500"/>}
                            {viewType === 'leave' && <Calendar className="h-5 w-5 text-purple-500"/>}
                            {viewType === 'ticket' && <Car className="h-5 w-5 text-orange-500"/>}
                            Request Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the details of this request below.
                        </DialogDescription>
                    </DialogHeader>

                    {viewData && (
                        <div className="space-y-4 text-sm">
                            {/* COMMON FIELDS */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4 dark:border-zinc-800">
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase font-bold">Employee/Requester</span>
                                    <div className="font-medium text-base">{viewData.user?.name || viewData.driver_name}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase font-bold">Status</span>
                                    <Badge className="capitalize mt-1" variant={viewData.status === 'approved' ? 'default' : viewData.status === 'rejected' ? 'destructive' : 'outline'}>{viewData.status}</Badge>
                                </div>
                            </div>

                            {/* LOCATOR SLIP */}
                            {viewType === 'locator' && (
                                <div className="space-y-3">
                                    <div><span className="font-bold">Destination:</span> {viewData.destination}</div>
                                    <div><span className="font-bold">Purpose:</span> {viewData.purpose}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><span className="font-bold">Type:</span> <span className="capitalize">{viewData.type}</span></div>
                                        <div><span className="font-bold">Date:</span> {new Date(viewData.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-800 p-2 rounded">
                                        <div><span className="text-xs text-muted-foreground block">Departure</span>{new Date(viewData.time_departure).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                        <div><span className="text-xs text-muted-foreground block">Arrival</span>{viewData.time_arrival ? new Date(viewData.time_arrival).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</div>
                                    </div>
                                </div>
                            )}

                            {/* LEAVE */}
                            {viewType === 'leave' && (
                                <div className="space-y-3">
                                    <div><span className="font-bold">Leave Type:</span> <span className="capitalize">{viewData.leave_type.replace('_', ' ')}</span></div>
                                    <div><span className="font-bold">Duration:</span> {viewData.working_days} day(s)</div>
                                    <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded text-center">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Inclusive Dates</div>
                                        <div>
                                            {new Date(viewData.inclusive_date_start).toLocaleDateString()} - {new Date(viewData.inclusive_date_end).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {viewData.leave_type === 'sick' && viewData.sick_in_hospital && <div><span className="font-bold">Hospital:</span> {viewData.sick_in_hospital}</div>}
                                    {viewData.leave_type === 'vacation' && viewData.vacation_location_abroad && <div><span className="font-bold">Abroad:</span> {viewData.vacation_location_abroad}</div>}
                                </div>
                            )}

                            {/* TICKET */}
                            {viewType === 'ticket' && (
                                <div className="space-y-3">
                                    <div><span className="font-bold">Driver:</span> {viewData.driver_name}</div>
                                    <div><span className="font-bold">Vehicle:</span> {viewData.vehicle_plate}</div>
                                    <div><span className="font-bold">Destination:</span> {viewData.destination}</div>
                                    <div><span className="font-bold">Purpose:</span> {viewData.purpose}</div>
                                    <div><span className="font-bold">Passengers:</span> {viewData.passengers}</div>
                                    {viewData.requesters && (
                                        <div className="mt-2 border-t pt-2 dark:border-zinc-800">
                                            <span className="font-bold block mb-1">Requested By:</span>
                                            {Array.isArray(viewData.requesters) ? (
                                                viewData.requesters.map((req: any, i: number) => (
                                                    <div key={i} className="text-xs">- {req.name} ({req.designation})</div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-muted-foreground">No specific requester data</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewData(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- CONFIRMATION ACTION DIALOG (Replaces alert) --- */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800 print:hidden">
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to <strong className={confirmAction?.status === 'rejected' ? 'text-red-600' : 'text-emerald-600'}>
                                {confirmAction?.status.toUpperCase()}
                            </strong> this request? 
                            <br/><br/>
                            This will send an email notification to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
                        <Button 
                            variant={confirmAction?.status === 'rejected' ? 'destructive' : 'default'}
                            className={confirmAction?.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            onClick={proceedWithAction}
                            disabled={isProcessing}
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            Confirm {confirmAction?.status === 'approved' ? 'Approval' : 'Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ================================================================================================= */}
            {/* === PRINTABLE MONTHLY REPORT (Visible Only on Print) === */}
            {/* ================================================================================================= */}
            <div className="hidden print:block p-8 bg-white text-black font-serif">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold uppercase">Monthly Personnel Report</h1>
                    <p className="text-sm text-gray-500">Commission on Higher Education - Regional Office IX</p>
                    <p className="text-xs mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <table className="w-full text-sm border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-left">Employee Name</th>
                            <th className="border border-black px-2 py-1 text-center">Department</th>
                            <th className="border border-black px-2 py-1 text-center">Personal Travel (Max 4h)</th>
                            <th className="border border-black px-2 py-1 text-center">Official Travel</th>
                            <th className="border border-black px-2 py-1 text-center">Leave Days</th>
                            <th className="border border-black px-2 py-1 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((row: any) => (
                            <tr key={row.id}>
                                <td className="border border-black px-2 py-1 font-bold">{row.name}</td>
                                <td className="border border-black px-2 py-1 text-center text-xs">{row.department}</td>
                                <td className="border border-black px-2 py-1 text-center font-mono">
                                    {row.personal_hours} hrs
                                </td>
                                <td className="border border-black px-2 py-1 text-center font-mono">{row.official_hours} hrs</td>
                                <td className="border border-black px-2 py-1 text-center">{row.leave_days}</td>
                                <td className="border border-black px-2 py-1 text-center text-xs uppercase font-bold">
                                    {row.is_over_limit ? 'Over Limit' : 'OK'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </AuthenticatedLayout>
    );
}