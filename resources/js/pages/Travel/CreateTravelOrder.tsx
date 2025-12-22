import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    UploadCloud, 
    FileText, 
    ChevronRight, 
    ChevronLeft,
    Check,
    Send,
    PenTool
} from "lucide-react";
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// FilePond for Upload
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType);

// --- TYPES ---

interface TravelOrderForm {
    booking_reference: string;
    base_fare_notes: string;
    official_name: string;
    position: string;
    office_station: string;
    destination: string;
    date_from: string;
    date_to: string;
    purpose: string;
    is_official_business: boolean;
    is_official_time: boolean;
    is_cash_advance: boolean;
    is_reimbursement: boolean;
    est_airfare: string;
    est_registration: string;
    est_allowance: string;
    est_total: number;
    funds_available_amount: string;
    fund_source_id: string;
    memo_file: File | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles?: any[];       
    permissions?: any[]; 
    is_disabled?: boolean;
    [key: string]: any; 
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

// --- STEPS CONFIGURATION ---
const steps = [
    { id: 1, label: 'Upload Authority', icon: UploadCloud },
    { id: 2, label: 'Create Order', icon: PenTool },
    { id: 3, label: 'Travel Details', icon: FileText },
];

export default function CreateTravelOrder({ auth }: PageProps) {
    const [currentStep, setCurrentStep] = useState(1);

    // 1. Form Setup
    const { data, setData, post, processing, errors } = useForm<TravelOrderForm>({
        // Meta
        booking_reference: '',
        base_fare_notes: '',
        
        // Employee Info
        official_name: auth?.user?.name ? auth.user.name.toUpperCase() : '', 
        position: 'Chief Education Program Specialist',
        office_station: 'CHED Region IX',
        
        // Travel Info
        destination: '',
        date_from: '',
        date_to: '',
        purpose: '',
        
        // Checkboxes
        is_official_business: true,
        is_official_time: false,
        is_cash_advance: false,
        is_reimbursement: false,

        // Expenses
        est_airfare: '',
        est_registration: '',
        est_allowance: '',
        est_total: 0,
        
        // Funds
        funds_available_amount: '',
        fund_source_id: '',
        
        // File
        memo_file: null,
    });

    // 2. Auto-Calculate Total
    useEffect(() => {
        const total = 
            Number(data.est_airfare || 0) + 
            Number(data.est_registration || 0) + 
            Number(data.est_allowance || 0);
        
        setData(prevData => ({
            ...prevData,
            est_total: total,
            funds_available_amount: total > 0 
                ? total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : ''
        }));
    }, [data.est_airfare, data.est_registration, data.est_allowance]);

    const handleNext = () => {
        if (currentStep === 1) {
            if (!data.memo_file) {
                toast.error("Please upload the Memo/Authority file first.");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!data.destination || !data.date_from || !data.purpose) {
                toast.error("Please fill in the Destination, Dates, and Purpose.");
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            window.history.back();
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep < 3) {
            handleNext();
            return;
        }

        if (!data.fund_source_id) {
            toast.error("Please select a Source of Funds (at the bottom of the form).");
            return;
        }

        post(route('travel-orders.store'), {
            onSuccess: () => toast.success("Travel Order Submitted Successfully!"),
            onError: (err) => {
                console.error("Validation Errors:", err);
                toast.error("Please check the form for errors.");
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="Create Travel Order">
            <div className="bg-gray-50/50 dark:bg-zinc-950 min-h-screen p-4 sm:p-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    
                    {/* --- 1. STEPPER --- */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-zinc-800 -z-10"></div>
                            {steps.map((step, index) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = step.id < currentStep;
                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300
                                            ${isActive 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110' 
                                                : isCompleted 
                                                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                                                    : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-400'
                                            }`}>
                                            {isCompleted ? <Check className="w-6 h-6" /> : <span className="text-sm font-bold">{step.id}</span>}
                                        </div>
                                        <span className={`mt-3 text-xs sm:text-sm text-center font-bold tracking-wide ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-500'}`}>
                                            {step.label}
                                        </span>
                                        {index < steps.length - 1 && (
                                            <div 
                                                className={`absolute top-1/2 left-1/2 h-1 -z-10 transition-colors duration-300 w-[calc(100%-3rem)]
                                                ${isCompleted ? 'bg-indigo-600' : 'bg-transparent'}`}
                                            ></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- 2. FORM CONTENT --- */}
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-xl border-t-4 border-t-indigo-600 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            
                            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-6 bg-slate-50/30 dark:bg-zinc-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                            {currentStep === 1 ? 'Upload Authority' : 
                                             currentStep === 2 ? 'Create Travel Order' : 
                                             'Authority to Travel'}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {currentStep === 1 
                                                ? 'Please upload the approved Memo or Letter of Authority.' 
                                                : currentStep === 2
                                                ? 'Fill in the details for the Travel Order Memorandum.'
                                                : 'Finalize the financial details and review the document.'}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Ref</div>
                                        <div className="text-sm font-mono font-medium text-gray-600 dark:text-gray-400">TO-REQ-NEW</div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0 sm:p-8 min-h-[400px]">
                                
                                {/* --- STEP 1: UPLOAD --- */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto py-8">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-3 text-blue-800 dark:text-blue-300">
                                            <UploadCloud className="w-5 h-5 shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <span className="font-bold block">Required Action</span>
                                                Upload the signed authority document (PDF/Image) to proceed to the next step.
                                            </div>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-2 bg-gray-50/50 dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                                            <FilePond
                                                files={data.memo_file ? [data.memo_file] : []}
                                                onupdatefiles={(fileItems) => {
                                                    const file = fileItems[0]?.file;
                                                    setData('memo_file', file as File);
                                                }}
                                                allowMultiple={false}
                                                acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
                                                labelIdle='Drag & Drop your Memo here or <span class="filepond--label-action">Browse</span>'
                                                credits={false}
                                            />
                                        </div>
                                        {errors.memo_file && <p className="text-red-500 text-sm text-center font-medium">{errors.memo_file}</p>}
                                    </div>
                                )}

                                {/* --- STEP 2: MEMORANDUM FORM (NEW) --- */}
                                {currentStep === 2 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 max-w-4xl mx-auto pt-4 px-4 md:px-0">
                                        
                                        {/* HEADER - REGIONAL OFFICE IX STYLE */}
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

                                        <h2 className="text-center font-bold text-xl uppercase mb-6 underline underline-offset-4 decoration-2">TRAVEL AUTHORITY</h2>

                                        {/* MEMO BODY */}
                                        <div className="space-y-6">
                                            
                                            {/* TO Section - EDITABLE INPUTS */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">MEMORANDUM TO:</Label>
                                                <div className="space-y-3 pl-0 md:pl-4">
                                                    <Input 
                                                        value={data.official_name}
                                                        onChange={(e) => setData('official_name', e.target.value)}
                                                        className="font-bold text-lg text-zinc-800 dark:text-white uppercase h-10 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                        placeholder="NAME OF OFFICIAL"
                                                    />
                                                    <Input 
                                                        value={data.position}
                                                        onChange={(e) => setData('position', e.target.value)}
                                                        className="text-sm text-zinc-600 dark:text-zinc-300 h-9 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                        placeholder="Position Title"
                                                    />
                                                </div>
                                            </div>

                                            <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-4" />

                                            {/* Form Fields */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Destination / Place to be visited</Label>
                                                    <Input 
                                                        value={data.destination}
                                                        onChange={(e) => setData('destination', e.target.value)}
                                                        placeholder="City, Province or Venue"
                                                        className="h-12 text-base border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-indigo-500"
                                                    />
                                                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-zinc-600 dark:text-zinc-400">Date From</Label>
                                                        <Input 
                                                            type="date"
                                                            value={data.date_from}
                                                            onChange={(e) => setData('date_from', e.target.value)}
                                                            className="h-12 text-base border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-zinc-600 dark:text-zinc-400">Date To</Label>
                                                        <Input 
                                                            type="date"
                                                            value={data.date_to}
                                                            onChange={(e) => setData('date_to', e.target.value)}
                                                            className="h-12 text-base border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-zinc-600 dark:text-zinc-400">Purpose of Travel</Label>
                                                    <Textarea 
                                                        value={data.purpose}
                                                        onChange={(e) => setData('purpose', e.target.value)}
                                                        placeholder="State the official business, workshop name, or reason for travel..."
                                                        className="min-h-[120px] text-base border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none p-4 leading-relaxed"
                                                    />
                                                    {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                                                </div>
                                            </div>

                                            {/* RD Signature - Bottom of Step 2 */}
                                            <div className="mt-16 mb-4">
                                                <div className="font-bold text-base uppercase text-zinc-900 dark:text-white tracking-wide">MARIVIC V. IRIBERRI</div>
                                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Officer-in-Charge, Office of the Director IV</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 3: DETAILS (GOVERNMENT FORM REPLICA) --- */}
                                {currentStep === 3 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                        
                                        {/* --- CHED CENTRAL HEADER SECTION --- */}
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

                                        {/* --- META DATA --- */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-red-600 dark:text-red-500 font-bold uppercase text-xs w-32 shrink-0">Booking Reference</Label>
                                                <Input 
                                                    value={data.booking_reference}
                                                    onChange={(e) => setData('booking_reference', e.target.value)}
                                                    className="h-8 border-zinc-400 dark:border-zinc-600 rounded-none bg-transparent focus:ring-red-500/20" 
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-red-600 dark:text-red-500 font-bold uppercase text-xs w-48 text-right shrink-0">Base Fare x No. of Pax</Label>
                                                <Input 
                                                    value={data.base_fare_notes}
                                                    onChange={(e) => setData('base_fare_notes', e.target.value)}
                                                    className="h-8 border-zinc-400 dark:border-zinc-600 rounded-none bg-transparent focus:ring-red-500/20" 
                                                />
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
                                                    <Input 
                                                        value={data.official_name}
                                                        onChange={(e) => setData('official_name', e.target.value)}
                                                        className="mt-1 border-transparent shadow-none focus-visible:ring-0 font-bold text-lg px-0 h-auto bg-transparent uppercase text-zinc-900 dark:text-white placeholder:text-zinc-300" 
                                                        placeholder="ENTER NAME"
                                                    />
                                                </div>
                                                <div className="col-span-1 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Position</Label>
                                                    <Input 
                                                        value={data.position}
                                                        onChange={(e) => setData('position', e.target.value)}
                                                        className="mt-1 border-transparent shadow-none focus-visible:ring-0 text-center font-medium px-0 h-auto bg-transparent text-zinc-800 dark:text-zinc-200" 
                                                        placeholder="Enter Position" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 2: Office, Dest, Period */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500">
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Office/Station</Label>
                                                    <Input 
                                                        value={data.office_station}
                                                        onChange={(e) => setData('office_station', e.target.value)}
                                                        className="mt-1 border-transparent shadow-none focus-visible:ring-0 px-0 h-auto text-sm bg-transparent" 
                                                    />
                                                </div>
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Destination</Label>
                                                    <Input 
                                                        value={data.destination}
                                                        onChange={(e) => setData('destination', e.target.value)}
                                                        className={`mt-1 border-transparent shadow-none focus-visible:ring-0 px-0 h-auto text-sm bg-transparent ${errors.destination ? 'text-red-500 placeholder:text-red-300' : ''}`}
                                                        placeholder="Enter Destination" 
                                                    />
                                                </div>
                                                <div className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Period of Travel</Label>
                                                    <div className="flex gap-2 items-center mt-1">
                                                        <Input 
                                                            type="date"
                                                            value={data.date_from}
                                                            onChange={(e) => setData('date_from', e.target.value)}
                                                            className="border-none shadow-none focus-visible:ring-0 px-0 h-auto text-sm bg-transparent w-full p-0" 
                                                        />
                                                        <span className="text-zinc-400">-</span>
                                                        <Input 
                                                            type="date"
                                                            value={data.date_to}
                                                            onChange={(e) => setData('date_to', e.target.value)}
                                                            className="border-none shadow-none focus-visible:ring-0 px-0 h-auto text-sm bg-transparent w-full p-0" 
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground block text-center mt-1">(Inclusive of travel time)</span>
                                                </div>
                                            </div>

                                            {/* ROW 3: Purpose & Checkboxes */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500">
                                                <div className="col-span-2 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[10px] text-muted-foreground uppercase mb-2 block tracking-wider">Purpose of Travel</Label>
                                                    <Textarea 
                                                        value={data.purpose}
                                                        onChange={(e) => setData('purpose', e.target.value)}
                                                        className={`min-h-[80px] border-none shadow-none focus-visible:ring-0 resize-none text-sm p-0 leading-tight bg-transparent ${errors.purpose ? 'placeholder:text-red-300' : ''}`}
                                                        placeholder="State the official business..."
                                                    />
                                                </div>
                                                <div className="col-span-1 p-4 space-y-3 flex flex-col justify-center bg-zinc-100 dark:bg-zinc-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="official-business" 
                                                            checked={data.is_official_business}
                                                            onCheckedChange={(c) => setData('is_official_business', c === true)}
                                                            className="border-zinc-500 data-[state=checked]:bg-zinc-800 dark:data-[state=checked]:bg-zinc-200 dark:data-[state=checked]:text-zinc-900"
                                                        />
                                                        <Label htmlFor="official-business" className="font-semibold text-sm cursor-pointer">Official Business</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="official-time"
                                                            checked={data.is_official_time}
                                                            onCheckedChange={(c) => setData('is_official_time', c === true)}
                                                            className="border-zinc-500 data-[state=checked]:bg-zinc-800 dark:data-[state=checked]:bg-zinc-200 dark:data-[state=checked]:text-zinc-900"
                                                        />
                                                        <Label htmlFor="official-time" className="font-semibold text-sm cursor-pointer">Official Time Only</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 4: Expenses Header */}
                                            <div className="border-b border-zinc-800 dark:border-zinc-500 p-1.5 bg-zinc-200 dark:bg-zinc-800 text-center">
                                                <p className="text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-0.5">* authorized to reimburse actual expenses</p>
                                                <p className="font-bold text-lg uppercase tracking-wide">Estimated Expenses</p>
                                            </div>

                                            {/* ROW 5: Expenses Table & Checkboxes */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500 min-h-[120px]">
                                                {/* Expense Columns */}
                                                <div className="text-center p-3 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tighter">Air Fare + Insurance</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.est_airfare}
                                                        onChange={(e) => setData('est_airfare', e.target.value)}
                                                        className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent font-mono text-base" 
                                                        placeholder="0.00" 
                                                    />
                                                </div>
                                                <div className="text-center p-3 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Training / Reg Fee</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.est_registration}
                                                        onChange={(e) => setData('est_registration', e.target.value)}
                                                        className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent font-mono text-base" 
                                                        placeholder="0.00" 
                                                    />
                                                </div>
                                                <div className="text-center p-3 space-y-2 bg-emerald-50/50 dark:bg-emerald-900/10">
                                                    <Label className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Travel Allowance</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.est_allowance}
                                                        onChange={(e) => setData('est_allowance', e.target.value)}
                                                        className="text-right border-none shadow-none focus-visible:ring-0 bg-transparent font-mono text-base" 
                                                        placeholder="0.00" 
                                                    />
                                                    <div className="border-t border-zinc-300 dark:border-zinc-600 pt-2 mt-2">
                                                        <Label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Amount</Label>
                                                        <div className="text-right font-bold text-lg font-mono text-emerald-700 dark:text-emerald-300">
                                                            ₱{data.est_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Side Options */}
                                                <div className="p-4 space-y-4 flex flex-col justify-center bg-zinc-100 dark:bg-zinc-900">
                                                    <Label className="text-xs font-bold mb-1 block uppercase text-zinc-500">Please Check:</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="cash-advance" 
                                                            checked={data.is_cash_advance}
                                                            onCheckedChange={(c) => setData('is_cash_advance', c === true)}
                                                            className="border-zinc-500"
                                                        />
                                                        <Label htmlFor="cash-advance" className="cursor-pointer text-sm">Cash Advance</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="reimbursement" 
                                                            checked={data.is_reimbursement}
                                                            onCheckedChange={(c) => setData('is_reimbursement', c === true)}
                                                            className="border-zinc-500"
                                                        />
                                                        <Label htmlFor="reimbursement" className="cursor-pointer text-sm">Reimbursement</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ROW 6: Signatories - UPDATED */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800 dark:border-zinc-500 divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-500 text-xs">
                                                {/* Column 1: Requested By */}
                                                <div className="p-3 flex flex-col justify-between h-48 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <Label className="uppercase text-muted-foreground text-[10px] tracking-widest">Requested By:</Label>
                                                    <div className="text-center mt-4">
                                                        <div className="font-bold text-lg uppercase tracking-tight">{data.official_name || "NAME OF EMPLOYEE"}</div>
                                                        <div className="text-[10px] text-muted-foreground">{data.position || "Position Title"}</div>
                                                    </div>
                                                    <div className="mt-auto border-t border-dashed border-zinc-400 dark:border-zinc-600 pt-1 flex justify-between items-end">
                                                        <Label className="text-[10px]">Date:</Label>
                                                    </div>
                                                </div>

                                                {/* Column 2: Funds Available */}
                                                <div className="p-3 flex flex-col justify-between h-48 bg-zinc-50/50 dark:bg-zinc-900/30">
                                                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-1">
                                                        <Label className="uppercase text-muted-foreground text-[10px] tracking-widest">Funds Available:</Label>
                                                        <Input 
                                                            value={data.funds_available_amount}
                                                            readOnly
                                                            className="w-28 h-6 text-right font-bold text-xs bg-transparent border-none shadow-none px-0 focus-visible:ring-0 text-emerald-600 dark:text-emerald-400" 
                                                            placeholder="0.00" 
                                                        />
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <div className="font-bold text-base uppercase text-zinc-800 dark:text-zinc-200">KIMBERLY BUHIAN</div>
                                                        <div className="text-[10px] text-zinc-500">Administrative Officer III</div>
                                                        <div className="text-[10px] font-semibold text-zinc-500">Budget Division</div>
                                                    </div>
                                                    
                                                    {/* FUND SOURCE SELECTOR */}
                                                    <div className="mt-auto border-t border-dashed border-zinc-400 dark:border-zinc-600 pt-1">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-[10px] whitespace-nowrap">Source of Funds:</Label>
                                                            <div className="flex-1">
                                                                <Select 
                                                                    onValueChange={(value) => setData('fund_source_id', value)}
                                                                    value={data.fund_source_id}
                                                                >
                                                                    <SelectTrigger className="h-6 text-[10px] border-none shadow-none p-0 bg-transparent focus:ring-0 font-bold italic text-zinc-700 dark:text-zinc-300">
                                                                        <SelectValue placeholder="Select Source..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="1">Local Funds</SelectItem>
                                                                        <SelectItem value="2">GAA Funds</SelectItem>
                                                                        <SelectItem value="3">Trust Funds</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.fund_source_id && <p className="text-[9px] text-red-500">* Required</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3: Approved By */}
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
                                    </div>
                                )}
                            </CardContent>

                            {/* --- FOOTER ACTIONS --- */}
                            <div className="bg-gray-50 dark:bg-zinc-900 px-8 py-6 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center rounded-b-xl">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleBack}
                                    className="border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 h-11 px-6"
                                >
                                    {currentStep === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-2"/> Back</>}
                                </Button>

                                {currentStep < 3 ? (
                                    <Button 
                                        type="button" 
                                        onClick={handleNext} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 shadow-md transition-all"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8 shadow-md hover:shadow-lg transition-all font-bold"
                                    >
                                        {processing ? 'Submitting...' : <><Send className="w-4 h-4 mr-2"/> Submit Request</>}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}