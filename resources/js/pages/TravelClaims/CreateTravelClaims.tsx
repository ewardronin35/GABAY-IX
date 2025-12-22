import React, { useState, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, ScanLine, Map, ScrollText, DollarSign, FileText, Paperclip, BookOpen, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import axios from 'axios';
import { route } from 'ziggy-js';

// --- CUSTOM COMPONENTS ---
import { ItineraryForm } from './components/ItineraryForm';
import { CerrForm } from './components/CerrForm'; 
import AppendixBForm from './components/AppendixBForm';
import RerForm from './components/RerForm';
import TravelReportForm from './components/TravelReportForm'; 
import Attachments from './components/Attachments';

const steps = [
    { id: 1, title: 'Verify', icon: ScanLine },
    { id: 2, title: 'Itinerary', icon: Map },
    { id: 3, title: 'C.E.R.R.', icon: ScrollText },
    { id: 4, title: 'Expense', icon: DollarSign },
    { id: 5, title: 'Appx B', icon: FileText },
    { id: 6, title: 'Report', icon: BookOpen }, 
    { id: 7, title: 'Files', icon: Paperclip },
    { id: 8, title: 'Done', icon: Check },
];

const Step = ({ title, active, done, icon: Icon }: any) => (
    <div className="flex flex-col items-center relative z-10 group min-w-[4rem] sm:min-w-[6rem]">
        <div className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110' : 
              done ? 'bg-emerald-500 border-emerald-500 text-white' : 
              'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-400'}
        `}>
            {done ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <span className={`mt-2 text-[10px] sm:text-xs font-medium text-center transition-colors duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500'}`}>
            {title}
        </span>
    </div>
);

export default function CreateTravelClaims({ auth, prefilledCode }: any) {
    const [currentStep, setCurrentStep] = useState(1);
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState(prefilledCode || '');
    const [orderData, setOrderData] = useState<any>(null);

    // Main Form Data
    const { data, setData, post, processing, errors } = useForm({
        travel_order_id: '',
        itinerary: {} as any, // Explicitly cast to avoid "Property does not exist"
        cerr: {} as any,
        rer: {} as any,
        appendixB: {} as any, // Explicitly cast to allow .attachments access
        report: {} as any,
        attachments: [] as string[], 
    });

    // --- 1. VERIFY CODE ---
    const handleVerify = async () => {
        if (!code) return toast.error("Please enter a code.");
        setVerifying(true);
        try {
            const res = await axios.post('/api/travel-claims/verify', { code });
            setOrderData(res.data.data);
            setData('travel_order_id', res.data.data.id);
            toast.success("Verified: " + res.data.data.destination);
        } catch (err: any) {
            setOrderData(null);
            toast.error(err.response?.data?.error || "Verification failed.");
        } finally {
            setVerifying(false);
        }
    };

    // --- 2. HANDLE CHILD COMPONENT UPDATES ---
const handleComponentChange = useCallback((key: string, value: any) => {
        setData(prev => {
            const prevData = prev as any;
            let updatedData = { ...prevData };

           if (key === 'rer') {
                updatedData.rer = {
                    ...value,
                    items: [{
                        ...value, 
                        description: value.payment_for || 'Reimbursement',
                        amount: value.total || value.amount_figures || 0,
                        date: value.date,
                        or_number: value.rer_no || 'N/A',
                        expense_type: 'Other'
                    }]
                };
            }
            else if (key === 'appendixB') {
                updatedData.appendixB = {
                    ...prevData.appendixB, 
                    ...value           
                };
            }
            else if (key === 'attachments') {
                updatedData.attachments = value; 
                // Merge SAFELY: Keep existing Appendix B data, update only attachments
                updatedData.appendixB = {
                    ...prevData.appendixB,
                    attachments: value
                };
            }
            else if (key === 'preflight_files') {
                 updatedData.appendixB = {
                    ...prevData.appendixB,
                    attachments: [...(prevData.appendixB?.attachments || []), ...value] 
                };
            }
            else {
                updatedData[key] = value;
            }

            return updatedData;
        });
    }, []);

    // --- 3. SUBMIT ---
    const handleSubmit = () => {
        post(route('travel-claims.store'), {
            onSuccess: () => toast.success("Claim Submitted Successfully!"),
            onError: (err) => {
                console.error("VALIDATION ERRORS:", err);
                const firstError = Object.values(err)[0];
                toast.error(`Failed: ${firstError}`);
            },
        });
    };

    const nextStep = () => setCurrentStep(p => Math.min(p + 1, steps.length));
    const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

    return (
        <AuthenticatedLayout user={auth.user} page_title="File Reimbursement">
            <Head title="File Reimbursement" />
            <Toaster />
            
            <div className="w-full max-w-6xl mx-auto py-8 px-4">
                
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Travel Reimbursement</h1>
                    <p className="text-sm text-zinc-500">Step {currentStep}: {steps[currentStep-1].title}</p>
                </div>

                <div className="mb-8 relative px-4">
                    <div className="absolute top-4 sm:top-5 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0"></div>
                    <div className="absolute top-4 sm:top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-0" 
                         style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                    <div className="flex justify-between relative w-full">
                        {steps.map((step) => (
                            <Step key={step.id} {...step} active={step.id === currentStep} done={step.id < currentStep} />
                        ))}
                    </div>
                </div>

                <Card className="min-h-[500px] shadow-lg border-t-4 border-t-indigo-600 dark:bg-zinc-900 dark:border-zinc-800">
                    <CardContent className="p-6">
                        {currentStep === 1 && (
                            <div className="max-w-xl mx-auto space-y-6 pt-10">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold">Enter Travel Order Code</h3>
                                    <p className="text-sm text-zinc-500">Example: TO-2025-12-001</p>
                                </div>
                                <div className="flex gap-3">
                                    <Input 
                                        placeholder="TO-..." 
                                        value={code} 
                                        onChange={e => setCode(e.target.value)} 
                                        className="text-center font-mono uppercase text-lg h-12"
                                        disabled={!!orderData}
                                    />
                                    {orderData ? (
                                        <Button variant="outline" onClick={() => { setOrderData(null); setCode(''); }} className="h-12"><XCircle className="w-4 h-4 mr-2"/> Reset</Button>
                                    ) : (
                                        <Button onClick={handleVerify} disabled={verifying} className="bg-indigo-600 h-12 w-32">
                                            {verifying ? <Loader2 className="animate-spin"/> : "Verify"}
                                        </Button>
                                    )}
                                </div>
                                {orderData && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-center border border-emerald-200">
                                        <p className="font-bold text-emerald-800 dark:text-emerald-400">{orderData.destination}</p>
                                        <p className="text-xs text-emerald-600">{orderData.date_range}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <ItineraryForm 
                                user={auth.user} 
                                initialData={data.itinerary} 
                                onDataChange={(val: any) => handleComponentChange('itinerary', val)} 
                                errors={errors}
                            />
                        )}
                        {currentStep === 3 && (
                            <CerrForm 
                                user={auth.user} 
                                initialData={data.cerr} 
                                onDataChange={(val: any) => handleComponentChange('cerr', val)} 
                            />
                        )}
                        {currentStep === 4 && (
                            <RerForm 
                                user={auth.user} 
                                initialData={data.rer} 
                                onDataChange={(val: any) => handleComponentChange('rer', val)} 
                            />
                        )}
                        {currentStep === 5 && (
                            <AppendixBForm 
                                user={auth.user} 
                                initialData={data.appendixB} 
                                onDataChange={(val: any) => handleComponentChange('appendixB', val)} 
                            />
                        )}
                        {currentStep === 6 && (
                            <TravelReportForm 
                                user={auth.user} // FIX: Added missing user prop
                                itineraryData={data.itinerary} 
                                appendixBData={data.appendixB} 
                                initialData={data.report} 
                                onDataChange={(val: any) => handleComponentChange('report', val)}
                            />
                        )}
                        {currentStep === 7 && (
    <Attachments 
        // Pass the saved file IDs so the component knows about them
        existingFiles={data.attachments} 
        onUpdateFiles={(files: any) => handleComponentChange('attachments', files)} 
    />
)}

                        {currentStep === 8 && (
                            <div className="text-center py-16 space-y-6">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                    <Check className="w-12 h-12" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Ready to Submit</h3>
                                    <p className="text-zinc-500 max-w-md mx-auto mt-2">
                                        Your reimbursement claim for <strong>{orderData?.destination}</strong> is complete. 
                                        Click submit to forward this to the Accounting Unit.
                                    </p>
                                </div>
                                <Button size="lg" onClick={handleSubmit} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] h-12 text-lg">
                                    {processing ? <Loader2 className="animate-spin mr-2"/> : null}
                                    Submit Final Claim
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 flex justify-between border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || processing}>
                            Back
                        </Button>
                        
                        {currentStep < 8 && (
                            <Button 
                                onClick={nextStep} 
                                disabled={(currentStep === 1 && !orderData) || processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Next Step
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}