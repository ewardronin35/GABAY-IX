import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Map, FileText, DollarSign, Check, ScanLine, ScrollText, Paperclip } from 'lucide-react';
import { PageProps } from '@/types';
import axios from 'axios';

// Component Imports
import { TravelDocumentUpload } from './components/TravelDocumentUpload';
import { ItineraryForm } from './components/ItineraryForm';
import { CerrForm } from './components/CerrForm'; 
import AppendixBForm from './components/AppendixBForm';
import RerForm from './components/RerForm';
import Attachments from './components/Attachments';

// Types
interface TravelFormData {
    itinerary: { items?: any[]; [key: string]: any };
    cerr: { [key: string]: any };
    rer: { items?: any[]; [key: string]: any };
    appendixB: { [key: string]: any };
    attachments: any[];
}

const steps = [
    { id: 1, title: 'Verify', icon: ScanLine },
    { id: 2, title: 'Itinerary', icon: Map },
    { id: 3, title: 'C.E.R.R.', icon: ScrollText },
    { id: 4, title: 'Expense', icon: DollarSign },
    { id: 5, title: 'Appx B', icon: FileText },
    { id: 6, title: 'Files', icon: Paperclip },
    { id: 7, title: 'Done', icon: Check },
];

const Step = ({ title, active, done, icon: Icon }: any) => (
    <div className="flex flex-col items-center relative z-10 group min-w-[4.5rem] sm:min-w-[7rem]">
        <div className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${active ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-110' : 
              done ? 'bg-green-500 border-green-500 text-white' : 
              'bg-background border-muted-foreground/30 text-muted-foreground'}
        `}>
            {done ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <span className={`mt-2 text-[10px] sm:text-xs font-medium text-center transition-colors duration-300 ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            {title}
        </span>
    </div>
);

const CreateTravelClaim = ({ auth }: PageProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isVerified, setIsVerified] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    const [formData, setFormData] = useState<TravelFormData>({
        itinerary: {}, cerr: {}, rer: {}, appendixB: {}, attachments: []
    });

    if (!auth.user) return null;

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    // Base handler
    const handleDataChange = useCallback((section: keyof TravelFormData, data: any) => {
        setFormData(prev => ({ ...prev, [section]: data }));
    }, []);

    // FIX: Create stable functions for each child component
    // These specific functions won't change references between renders, breaking the loop.
    const onItineraryChange = useCallback((data: any) => handleDataChange('itinerary', data), [handleDataChange]);
    const onCerrChange = useCallback((data: any) => handleDataChange('cerr', data), [handleDataChange]);
    const onRerChange = useCallback((data: any) => handleDataChange('rer', data), [handleDataChange]);
    const onAppendixBChange = useCallback((data: any) => handleDataChange('appendixB', data), [handleDataChange]);
    const onAttachmentsChange = useCallback((data: any) => handleDataChange('attachments', data), [handleDataChange]);

    const handleFormSubmit = async () => {
        setProcessing(true);
        // Submission logic here...
        setTimeout(() => setProcessing(false), 2000); 
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="Create Claim">
            <div className="w-full max-w-6xl mx-auto py-4 sm:py-10 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-lg sm:text-2xl font-bold text-foreground">New Reimbursement</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Step {currentStep} of {steps.length}: {steps[currentStep-1].title}
                    </p>
                </div>

                {/* Stepper Container */}
                <div className="w-full overflow-x-auto pb-4 mb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
                    <div className="relative flex justify-between items-center min-w-[340px] sm:min-w-full">
                        <div className="absolute top-4 sm:top-5 left-0 w-full h-0.5 bg-muted -z-0"></div>
                        <div 
                            className="absolute top-4 sm:top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0" 
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        {steps.map((step) => (
                            <Step 
                                key={step.id} 
                                {...step}
                                active={step.id === currentStep} 
                                done={step.id < currentStep} 
                            />
                        ))}
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-3 sm:p-6 min-h-[400px]">                    
                    
                    {currentStep === 1 && (
                        <TravelDocumentUpload 
                            onUploadComplete={(verified: boolean) => setIsVerified(verified)} 
                        />
                    )}

                    {currentStep === 2 && (
                        <ItineraryForm onDataChange={onItineraryChange} />
                    )}

                    {currentStep === 3 && (
                        <CerrForm user={auth.user} onDataChange={onCerrChange} />
                    )}

                    {currentStep === 4 && (
                        <RerForm user={auth.user} onDataChange={onRerChange} />
                    )}

                    {currentStep === 5 && (
                        <AppendixBForm user={auth.user} onDataChange={onAppendixBChange} />
                    )}

                     {currentStep === 6 && (
                        <Attachments onUpdateFiles={onAttachmentsChange} />
                    )}

                    {currentStep === 7 && (
                        <div className="text-center py-10">
                            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Ready to Submit</h3>
                            <p className="text-muted-foreground text-sm mt-2">Please review your claim details.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-between pb-10">
                    <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1 || processing}>
                        Back
                    </Button>
                    
                    {currentStep < steps.length ? (
                        <Button 
                            size="sm"
                            onClick={nextStep} 
                            disabled={(currentStep === 1 && !isVerified) || processing}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button 
                            size="sm"
                            onClick={handleFormSubmit} 
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Submit Claim
                        </Button>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
};

export default CreateTravelClaim;