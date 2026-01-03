import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutDashboard, MapPin, FileText, Clock, Car, Timer, History, CheckCircle, AlertTriangle, Briefcase, Lock, Printer, FileSpreadsheet, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

// Import Partials
import LocatorForm from './Partials/LocatorForm'; 
import LeaveForm from './Partials/LeaveForm'; 
import TripTicketForm from './Partials/TripTicketForm';

export default function UserDashboard({ auth, consumedSeconds, remainingSeconds, activeTrip, locatorHistory, ticketHistory, leaveHistory }: any) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState("dashboard");
    
    // --- PRINTING STATE ---
    const [printData, setPrintData] = useState<any>(null);
    const [printType, setPrintType] = useState<'locator' | 'ticket' | 'leave' | null>(null);

    // --- TOAST NOTIFICATIONS ---
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.warning) toast.warning(flash.warning);
    }, [flash]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const MAX_SECONDS = 14400; // 4 Hours
    const progressPercentage = Math.min(100, (consumedSeconds / MAX_SECONDS) * 100);
    const isOverLimit = remainingSeconds <= 0;
    const isBlocked = !!activeTrip;

    const handleArrival = () => {
        if (confirm("Confirm arrival? This will stop the timer and notify the Administrative Officer.")) {
            router.put(route('locator.arrived', activeTrip.id));
        }
    };

    // --- PRINT HANDLER ---
    const handlePrint = (item: any, type: 'locator' | 'ticket' | 'leave') => {
        setPrintData(item);
        setPrintType(type);
        // Small delay to allow state to update before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Personnel Dashboard" />

            {/* --- MAIN DASHBOARD CONTENT (Hidden during Print) --- */}
            <div className="py-8 container mx-auto space-y-6 max-w-7xl px-4 print:hidden">
                
                {/* HEADER */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Personnel Dashboard
                        </h2>
                        <p className="text-sm text-muted-foreground">Manage travel locators, leave applications, and vehicle requests.</p>
                    </div>
                </div>

                {/* MAIN TABS */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                   <TabsList className="grid w-fit min-w-[600px] grid-cols-5 h-10 mb-4 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
                        <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4"/> Dashboard</TabsTrigger>
                        <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4"/> My Records</TabsTrigger>
                        <TabsTrigger value="leave" className="gap-2"><FileText className="h-4 w-4"/> Leave Form</TabsTrigger>
                        <TabsTrigger value="locator" className="gap-2"><MapPin className="h-4 w-4"/> Locator Slip</TabsTrigger>
                        <TabsTrigger value="ticket" className="gap-2"><Car className="h-4 w-4"/> Trip Ticket</TabsTrigger>
                    </TabsList>

                    {/* --- TAB 1: DASHBOARD --- */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-l-4 border-l-blue-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2"><Clock className="w-4 h-4" /> Monthly Allowance</CardTitle></CardHeader>
                                <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">4h 0m</div></CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-amber-500 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2"><Timer className="w-4 h-4" /> Time Consumed</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{formatTime(consumedSeconds)}</div>
                                    <Progress value={progressPercentage} className="h-2 mt-2 bg-slate-100 dark:bg-zinc-800" />
                                </CardContent>
                            </Card>
                            <Card className={`border-l-4 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${isOverLimit ? "border-l-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-l-emerald-500"}`}>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2"><History className="w-4 h-4" /> Remaining Balance</CardTitle></CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold ${isOverLimit ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                        {isOverLimit ? "0h 0m" : formatTime(remainingSeconds)}
                                    </div>
                                    {isOverLimit && <div className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> LIMIT EXCEEDED</div>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Active Trip & Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {activeTrip ? (
                                    activeTrip.status === 'pending' ? (
                                        <Card className="border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 shadow-lg">
                                            <CardContent className="pt-6 text-center space-y-4">
                                                <Hourglass className="h-12 w-12 text-yellow-500 mx-auto animate-pulse" />
                                                <div>
                                                    <h3 className="font-semibold text-lg dark:text-slate-200">Waiting for Admin Approval</h3>
                                                    <p className="text-muted-foreground text-sm">Your locator slip to <span className="font-bold">{activeTrip.destination}</span> is pending.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card className="border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-lg">
                                            <div className="bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest text-center py-1">Trip In Progress</div>
                                            <CardContent className="pt-6 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Destination</div>
                                                        <div className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><MapPin className="h-6 w-6 text-emerald-500" />{activeTrip.destination}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Departure</div>
                                                        <div className="text-xl font-mono text-slate-700 dark:text-slate-300">{new Date(activeTrip.time_departure).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                                <Button onClick={handleArrival} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-bold shadow-lg shadow-emerald-500/20">
                                                    <CheckCircle className="mr-2 h-6 w-6"/> I HAVE ARRIVED
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                ) : (
                                    <Card className="h-full flex items-center justify-center border-dashed p-8 bg-slate-50 dark:bg-zinc-900/50 dark:border-zinc-800">
                                        <div className="text-center">
                                            <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full inline-block mb-4"><MapPin className="h-8 w-8 text-slate-400" /></div>
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No Active Trip</h3>
                                            <Button onClick={() => setActiveTab("locator")} className="mt-4">Create Locator Slip</Button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full flex flex-col dark:bg-zinc-900 dark:border-zinc-800">
                                    <CardHeader className="pb-3 border-b dark:border-zinc-800">
                                        <CardTitle className="text-md font-bold flex items-center gap-2"><History className="h-4 w-4"/> Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 overflow-auto flex-1">
                                        <Table>
                                            <TableHeader><TableRow className="dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50"><TableHead className="h-8 text-xs font-bold">Details</TableHead><TableHead className="h-8 text-xs font-bold text-right">Status</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {locatorHistory.slice(0, 5).map((slip: any) => (
                                                    <TableRow key={slip.id} className="dark:border-zinc-800">
                                                        <TableCell className="py-3">
                                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{slip.destination}</div>
                                                            <div className="text-xs text-muted-foreground truncate w-32">{slip.purpose}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-3"><Badge variant="outline" className="text-[10px]">{slip.status}</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB 2: MY RECORDS (HISTORY) --- */}
                    <TabsContent value="history" className="animate-in fade-in space-y-6">
                        <Tabs defaultValue="locators">
                            <TabsList className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 w-full justify-start h-12 p-1">
                                <TabsTrigger value="locators">Locator Slips</TabsTrigger>
                                <TabsTrigger value="tickets">Trip Tickets</TabsTrigger>
                                <TabsTrigger value="leaves">Leave Applications</TabsTrigger>
                            </TabsList>

                            {/* 1. Locator History */}
                            <TabsContent value="locators" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>Locator Slips History</CardTitle></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Destination</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {locatorHistory.map((item: any) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">
                                                            {new Date(item.date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell>{item.destination}</TableCell>
                                                        <TableCell>
                                                            {item.time_departure ? new Date(item.time_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </TableCell>
                                                        <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="outline" onClick={() => handlePrint(item, 'locator')}>
                                                                <Printer className="h-3 w-3 mr-1"/> Print
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* 2. Trip Tickets History */}
                            <TabsContent value="tickets" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>Vehicle Trip Tickets History</CardTitle></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Date of Travel</TableHead><TableHead>Destination</TableHead><TableHead>Vehicle / Driver</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {ticketHistory.map((item: any) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">
                                                            {new Date(item.date_of_travel).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell>{item.destination}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-xs">{item.vehicle_plate}</div>
                                                            <div className="text-[10px] text-muted-foreground">{item.driver_name}</div>
                                                        </TableCell>
                                                        <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="outline" onClick={() => handlePrint(item, 'ticket')}>
                                                                <Printer className="h-3 w-3 mr-1"/> Print
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* 3. Leave Applications History */}
                            <TabsContent value="leaves" className="mt-4">
                                <Card>
                                    <CardHeader><CardTitle>Leave Applications History</CardTitle></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Date Filed</TableHead><TableHead>Leave Type</TableHead><TableHead>Inclusive Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {leaveHistory.map((item: any) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">
                                                            {new Date(item.date_of_filing || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell className="capitalize">{item.leave_type.replace(/_/g, ' ')}</TableCell>
                                                        <TableCell>
                                                            <div className="text-xs">
                                                                {new Date(item.inclusive_date_start).toLocaleDateString()} - {new Date(item.inclusive_date_end).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">{item.working_days} working day(s)</div>
                                                        </TableCell>
                                                        <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="outline" onClick={() => handlePrint(item, 'leave')}>
                                                                <Printer className="h-3 w-3 mr-1"/> Print
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* --- OTHER FORMS --- */}
                    <TabsContent value="leave" className="animate-in fade-in">
                        {isBlocked && <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 p-4 mb-4 rounded-lg flex items-center gap-3"><Lock className="h-5 w-5 text-amber-600" /><div className="text-amber-800 dark:text-amber-200 text-sm"><strong>Restricted:</strong> Complete your active trip first.</div></div>}
                        <div className={isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}><LeaveForm auth={auth} /></div>
                    </TabsContent>
                    <TabsContent value="locator" className="animate-in fade-in">
                        {isBlocked && <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 p-4 mb-4 rounded-lg flex items-center gap-3"><Lock className="h-5 w-5 text-red-600" /><div className="text-red-800 dark:text-red-200 text-sm"><strong>Action Blocked:</strong> You already have an active trip.</div></div>}
                        <div className={isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}>
                            <LocatorForm auth={auth} remainingSeconds={remainingSeconds} onRedirectToLeave={() => setActiveTab("leave")}/>
                        </div>
                    </TabsContent>
                    <TabsContent value="ticket" className="animate-in fade-in">
                        {isBlocked && <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 p-4 mb-4 rounded-lg flex items-center gap-3"><Lock className="h-5 w-5 text-red-600" /><div className="text-red-800 dark:text-red-200 text-sm"><strong>Action Blocked:</strong> You have an active trip.</div></div>}
                        <div className={isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}><TripTicketForm auth={auth} /></div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ================================================================================================= */}
            {/* === PRINTABLE TEMPLATES (Visible only when Printing) === */}
            {/* ================================================================================================= */}
            {printData && (
                <div className="hidden print:block font-serif p-8 bg-white text-black max-w-[210mm] mx-auto">
                    
                    {/* --- 1. TRIP TICKET PRINT TEMPLATE (Matches Screenshot) --- */}
                    {printType === 'ticket' && (
                        <div className="border-t-4 border-t-black space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                                <img src="/images/ched-logo.png" className="h-20 w-auto" />
                                <div className="text-center">
                                    <h3 className="text-xs font-bold tracking-widest text-slate-600 uppercase">Commission on Higher Education</h3>
                                    <h1 className="text-2xl font-black uppercase tracking-widest">Regional Office IX</h1>
                                    <div className="mt-1 font-bold uppercase tracking-widest text-xl border-2 border-black py-1 px-4 inline-block">
                                        Vehicle Trip Ticket
                                    </div>
                                </div>
                                <img src="/images/bagong-pilipinas-logo.png" className="h-20 w-auto" />
                            </div>

                            {/* Header Info */}
                            <div className="text-right font-bold text-sm mb-4">
                                <span className="mr-2">Date:</span> 
                                <span className="border-b border-black px-4">{printData.date_of_travel}</span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex gap-2 items-end">
                                    <span className="font-bold whitespace-nowrap">Driver's Name:</span>
                                    <div className="border-b border-black w-full uppercase font-bold pl-2">{printData.driver_name}</div>
                                </div>
                                <div className="flex gap-4 items-center justify-end">
                                    <span className="font-bold">Vehicle:</span>
                                    {['Personal Vehicle', 'Mitsubishi Adventure', 'Toyota Innova'].map(v => (
                                        <div key={v} className="flex items-center gap-1">
                                            <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
                                                {printData.vehicle_plate === v && "✓"}
                                            </div>
                                            <span className="uppercase text-xs">{v.replace('Mitsubishi ', '').replace('Toyota ', '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Table */}
                            <div className="grid grid-cols-4 border-2 border-black divide-x-2 divide-black mt-6">
                                <div className="text-center font-bold uppercase text-xs py-1 border-b border-black bg-slate-100 print:bg-transparent">Authorized Passenger(s)</div>
                                <div className="text-center font-bold uppercase text-xs py-1 border-b border-black bg-slate-100 print:bg-transparent">Signature</div>
                                <div className="text-center font-bold uppercase text-xs py-1 border-b border-black bg-slate-100 print:bg-transparent">Destination</div>
                                <div className="text-center font-bold uppercase text-xs py-1 border-b border-black bg-slate-100 print:bg-transparent">Purpose</div>

                                <div className="h-40 p-2 text-xs border-b border-black whitespace-pre-wrap">{printData.passengers}</div>
                                <div className="h-40 border-b border-black"></div>
                                <div className="h-40 p-2 text-xs border-b border-black whitespace-pre-wrap">{printData.destination}</div>
                                <div className="h-40 p-2 text-xs border-b border-black whitespace-pre-wrap">{printData.purpose}</div>
                            </div>

                            {/* REQUESTED BY & APPROVED BY BOX (Matching Screenshot) */}
                            <div className="border-2 border-t-0 border-black grid grid-cols-2 divide-x-2 divide-black">
                                <div className="p-4 flex flex-col justify-between h-32 relative">
                                    <span className="text-xs font-bold uppercase absolute top-2 left-2">Requested by:</span>
                                    {/* Requester Names */}
                                    <div className="mt-6 space-y-4">
                                        {printData.requesters ? JSON.parse(printData.requesters).map((req: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs border-b border-black pb-1">
                                                <span className="font-bold uppercase">{req.name}</span>
                                                <span className="italic">{req.designation}</span>
                                            </div>
                                        )) : (
                                            <div className="border-b border-black mt-8"></div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mt-1">
                                        <span>Printed Name/s</span>
                                        <span>Position/Designation</span>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col justify-end items-center h-32 text-center">
                                    <div className="font-bold uppercase text-black border-b border-black pb-1 mb-1 px-8 w-full">
                                        Janeny B. Domingsil
                                    </div>
                                    <div className="text-[10px] font-bold uppercase">
                                        Officer In-Charge, Chief Administrative Officer
                                    </div>
                                </div>
                            </div>

                            {/* Trip Log Table */}
                            <div className="mt-4 border-2 border-black">
                                <div className="text-center text-[10px] font-bold uppercase border-b border-black">To be filled only by the driver after the end of the trip</div>
                                <div className="grid grid-cols-6 text-[10px] text-center divide-x divide-black border-b border-black font-bold">
                                    <div className="p-1">Trip No.</div>
                                    <div className="p-1">Time</div>
                                    <div className="p-1">Place (Start)</div>
                                    <div className="p-1">Time</div>
                                    <div className="p-1">Place (End)</div>
                                    <div className="p-1">Speedometer</div>
                                </div>
                                {[1,2,3,4,5,6,7].map(n => (
                                    <div key={n} className="grid grid-cols-6 text-[10px] divide-x divide-black border-b border-black last:border-0 h-6">
                                        <div className="text-center font-bold">{n}</div>
                                        <div></div><div></div><div></div><div></div><div></div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Certification */}
                            <div className="grid grid-cols-2 mt-4 text-xs gap-8">
                                <div className="space-y-1">
                                    <div className="flex justify-between border-b border-black border-dotted"><span>Gasoline Used:</span><span>liters</span></div>
                                    <div className="flex justify-between border-b border-black border-dotted"><span>Balance in Tank:</span><span>liters</span></div>
                                    <div className="flex justify-between border-b border-black border-dotted"><span>Total Distance:</span><span>km.</span></div>
                                </div>
                                <div className="text-center pt-4">
                                    <p className="mb-8 font-bold">I hereby certify that the vehicle was used on official business as stated above.</p>
                                    <div className="border-b border-black w-2/3 mx-auto"></div>
                                    <div className="text-[10px] uppercase font-bold">Driver's Signature</div>
                                    <div className="mt-2 text-[10px]">Date: __________________</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 2. LOCATOR SLIP PRINT TEMPLATE --- */}
                    {printType === 'locator' && (
                        <div className="border-2 border-black p-8 max-w-lg mx-auto mt-10">
                            <h1 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2 mb-6">Personnel Locator Slip</h1>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-bold">Date:</span>
                                    <span className="border-b border-black px-4">{new Date(printData.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="font-bold block mb-1">Name:</span>
                                    <div className="border-b border-black w-full uppercase">{printData.user?.name}</div>
                                </div>
                                <div>
                                    <span className="font-bold block mb-1">Purpose:</span>
                                    <div className="border-b border-black w-full">{printData.purpose}</div>
                                </div>
                                <div>
                                    <span className="font-bold block mb-1">Destination:</span>
                                    <div className="border-b border-black w-full">{printData.destination}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="text-center">
                                        <div className="font-bold border-b border-black">{new Date(printData.time_departure).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                        <div className="text-xs uppercase mt-1">Time Departure</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold border-b border-black h-5">
                                            {printData.time_arrival ? new Date(printData.time_arrival).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                                        </div>
                                        <div className="text-xs uppercase mt-1">Time Arrival</div>
                                    </div>
                                </div>
                                <div className="mt-12 text-center">
                                    <div className="font-bold uppercase border-b border-black w-2/3 mx-auto">ENGR. JANENY B. DOMINGSIL</div>
                                    <div className="text-xs">OIC - Chief Administrative Officer</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 3. LEAVE FORM PRINT TEMPLATE (Basic) --- */}
                    {printType === 'leave' && (
                        <div className="p-4 border border-black">
                            <h1 className="text-center font-bold text-xl mb-4">APPLICATION FOR LEAVE</h1>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>Name: <span className="font-bold uppercase">{printData.last_name}, {printData.first_name}</span></div>
                                <div>Date of Filing: <span className="font-bold">{printData.date_of_filing}</span></div>
                                <div>Position: <span className="font-bold">{printData.position}</span></div>
                                <div>Salary: <span className="font-bold">{printData.salary}</span></div>
                            </div>
                            <div className="border-t border-black pt-4 mb-4">
                                <div className="font-bold mb-2">DETAILS OF APPLICATION</div>
                                <div>Type of Leave: <span className="font-bold uppercase">{printData.leave_type.replace('_', ' ')}</span></div>
                                <div className="mt-2">Working Days: <span className="font-bold">{printData.working_days}</span></div>
                                <div>Inclusive Dates: <span className="font-bold">{printData.inclusive_date_start} to {printData.inclusive_date_end}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}