import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, FileText, DollarSign, Send, Check, ScanLine, UploadCloud, Calculator } from "lucide-react";
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// FilePond for Step 1
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
registerPlugin(FilePondPluginFileValidateType);

// --- STEPPER COMPONENT ---
const steps = [
    { id: 1, title: 'Upload Memo', icon: UploadCloud },
    { id: 2, title: 'Travel Details', icon: MapPin },
    { id: 3, title: 'Budget & Funding', icon: DollarSign },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex justify-between items-center mb-8 px-4 relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        <div className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-10" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
        {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center bg-white dark:bg-gray-900 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.id <= currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-xs font-medium ${step.id <= currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>{step.title}</span>
            </div>
        ))}
    </div>
);

export default function CreateTravel({ auth, saa_list }: any) {    const [step, setStep] = useState(1);
    
    const { data, setData, post, processing, errors } = useForm({
        // Step 1: Memo
        memo_file: null as File | null,
        
        // Step 2: Details
        destination: '',
        date_from: '',
        date_to: '',
        purpose: '',
        
        // Step 3: Budget & SAA
        fund_source_id: '',
        est_airfare: '',
        est_registration: '',
        est_per_diem: '',
        est_terminal: '',
        total_estimated: 0,
    });

    // Auto-calc Total
    useEffect(() => {
        const total = (parseFloat(data.est_airfare) || 0) + 
                      (parseFloat(data.est_registration) || 0) + 
                      (parseFloat(data.est_per_diem) || 0) + 
                      (parseFloat(data.est_terminal) || 0);
        setData('total_estimated', total);
    }, [data.est_airfare, data.est_registration, data.est_per_diem, data.est_terminal]);

    const nextStep = () => {
        // Simple Validation before moving next
        if (step === 1 && !data.memo_file) return toast.error("Please upload a memo first.");
        if (step === 2 && (!data.destination || !data.date_from || !data.date_to)) return toast.error("Please fill in all travel details.");
        setStep(s => s + 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.fund_source_id) return toast.error("Please select a Fund Source (SAA).");

        post(route('travel.store'), {
            forceFormData: true, // Critical for file upload
            onSuccess: () => toast.success("Travel Request Submitted!"),
            onError: () => toast.error("Please check the form for errors.")
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="New Travel Request">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">New Travel Request</h1>
                
                <StepIndicator currentStep={step} />

                <form onSubmit={handleSubmit}>
                    <Card className="min-h-[400px]">
                        <CardContent className="pt-6">
                            
                            {/* --- STEP 1: UPLOAD MEMO --- */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-medium">Upload Authority / Memo</h3>
                                        <p className="text-sm text-muted-foreground">Upload the approved memorandum or travel authority document.</p>
                                    </div>
                                    <div className="border-2 border-dashed rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
                                        <FilePond
                                            files={data.memo_file ? [data.memo_file] : []}
                                            onupdatefiles={(fileItems) => setData('memo_file', fileItems[0]?.file as File)}
                                            allowMultiple={false}
                                            acceptedFileTypes={['application/pdf', 'image/*']}
                                            labelIdle='Drag & Drop your Memo or <span class="filepond--label-action">Browse</span>'
                                            credits={false}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 2: DETAILS --- */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="space-y-2">
                                        <Label>Destination</Label>
                                        <Input placeholder="e.g. Davao City" value={data.destination} onChange={e => setData('destination', e.target.value)} />
                                        {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date From</Label>
                                            <Input type="date" value={data.date_from} onChange={e => setData('date_from', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date To</Label>
                                            <Input type="date" value={data.date_to} onChange={e => setData('date_to', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purpose</Label>
                                        <Textarea placeholder="Reason for travel..." className="min-h-[100px]" value={data.purpose} onChange={e => setData('purpose', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 3: BUDGET & SAA --- */}
                          {step === 3 && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="space-y-2">
                                        <Label className="text-indigo-600 font-semibold">Fund Source (SAA) *</Label>
                                        
                                        {/* ✅ 2. Dynamic Select */}
                                        <Select onValueChange={val => setData('fund_source_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select SAA" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Loop through the list from Controller */}
                                                {saa_list && saa_list.length > 0 ? (
                                                    saa_list.map((saa: any) => (
                                                        <SelectItem key={saa.id} value={String(saa.id)}>
                                                            {saa.saa_number} - {saa.description}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="0" disabled>No Active Funds Found</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.fund_source_id && <p className="text-xs text-red-500">{errors.fund_source_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Est. Airfare</Label><Input type="number" placeholder="0.00" value={data.est_airfare} onChange={e => setData('est_airfare', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Est. Registration</Label><Input type="number" placeholder="0.00" value={data.est_registration} onChange={e => setData('est_registration', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Est. Per Diem</Label><Input type="number" placeholder="0.00" value={data.est_per_diem} onChange={e => setData('est_per_diem', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Est. Terminal</Label><Input type="number" placeholder="0.00" value={data.est_terminal} onChange={e => setData('est_terminal', e.target.value)} /></div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-semibold">Total Estimate</span>
                                        <span className="text-xl font-bold text-green-600">₱{data.total_estimated.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* --- NAVIGATION BUTTONS --- */}
                    <div className="mt-6 flex justify-between">
                        <Button type="button" variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}>
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">Next Step</Button>
                        ) : (
                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
                                {processing ? 'Submitting...' : <><Send className="mr-2 h-4 w-4"/> Submit Request</>}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}