import React, { useState } from 'react';
import axios from 'axios'; // <-- 1. IMPORTED AXIOS
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Send, Map, FileText, DollarSign, Paperclip, Check } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types'; // <-- 2. IMPORTED PageProps
import { route } from 'ziggy-js'; // <-- 3. IMPORTED route

// --- CHILD COMPONENTS ---
// 4. FIXED: Use named imports with curly braces for all components
import { ItineraryForm}  from './components/ItineraryForm';
import AppendixBForm  from './components/AppendixBForm';
import  RerForm  from './components/RerForm';
import  Attachments  from './components/Attachments';
// Note: TravelReportForm is not in your step list, so it's not rendered.

// --- HELPER COMPONENTS FOR THE STEPPER ---
const Step = ({ num, title, active, done }: { num: number, title: string, active: boolean, done: boolean }) => (
    <li className={`flex items-center ${active ? 'text-indigo-600 dark:text-indigo-400' : ''} ${done ? 'text-green-600 dark:text-green-500' : ''}`}>
        <span className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${active ? 'border-indigo-600' : ''} ${done ? 'border-green-600 bg-green-600' : 'border-gray-500'} shrink-0`}>
            {done ? <Check className="w-5 h-5 text-white" /> : <span className={active ? 'font-bold' : ''}>{num}</span>}
        </span>
        <span className="ml-3 hidden sm:inline-block">
            <h3 className="font-medium leading-tight">{title}</h3>
        </span>
    </li>
);

const StepConnector = () => (
    <li className="flex-1">
        <div className="border-t-2 border-gray-300 dark:border-gray-700 mx-4"></div>
    </li>
);


// --- MAIN COMPONENT ---
const CreateTravelClaim = () => {
    // 5. FIXED: Typed usePage to fix the 'props.auth' error
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const totalSteps = 4;

    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState(1);
    
    // Your original state hooks
    const [itineraryData, setItineraryData] = useState(null);
    const [appendixBData, setAppendixBData] = useState(null);
    const [rerData, setRerData] = useState(null);
    const [reportData, setReportData] = useState(null); 
    const [attachmentIds, setAttachmentIds] = useState([]);

    // 6. ADDED: State for validation errors and processing
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    // --- NAVIGATION LOGIC (Unchanged) ---
    const validateStep = (step: number) => {
        if (step === 1 && !itineraryData) {
            alert('Please fill out all required fields in the Itinerary.');
            return false;
        }
        if (step === 2 && !appendixBData) {
            alert('Please fill out all required fields in Appendix B.');
            return false;
        }
        if (step === 3 && !rerData) {
            alert('Please add at least one expense receipt in the RER form.');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // --- 7. FIXED: SUBMISSION LOGIC ---
    const handleFormSubmit = async () => {
        // Final check
        if (!itineraryData || !appendixBData || !rerData) {
            alert('Please ensure the Itinerary, Appendix B, and RER forms are filled out.');
            if (!itineraryData) setCurrentStep(1);
            else if (!appendixBData) setCurrentStep(2);
            else if (!rerData) setCurrentStep(3);
            return;
        }

        const finalPayload = {
            itinerary: itineraryData,
            appendixB: appendixBData,
            rer: rerData,
            report: reportData, 
            attachments: attachmentIds,
        };

        console.log("Submitting Payload:", finalPayload);

        // Reset errors and set processing
        setErrors({});
        setProcessing(true);

        try {
            await axios.post(route('superadmin.travel-claims.store'), finalPayload);
            alert('Travel claim submitted successfully!');
            // Redirect on success
            window.location.href = '/dashboard'; // Or wherever you want to go

        } catch (error: any) {
            console.error('Failed to submit travel claim:', error);

            // This is the 422 Unprocessable Content error handling
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                alert('Please review the form for errors.');

                // Auto-navigate to the first error tab
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                if (firstErrorKey.startsWith('itinerary')) {
                    setCurrentStep(1);
                } else if (firstErrorKey.startsWith('appendixB')) {
                    setCurrentStep(2);
                } else if (firstErrorKey.startsWith('rer')) {
                    setCurrentStep(3);
                }
            } else {
                // A 500 or other error
                alert('An unexpected error occurred. Please check the console.');
            }
        } finally {
            // Always stop processing
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout user={user} page_title="Create New Travel Claim">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                
                {/* --- STEPPER UI --- */}
                <ol className="flex items-center w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                    <Step num={1} title="Itinerary" active={currentStep === 1} done={currentStep > 1} />
                    <StepConnector />
                    <Step num={2} title="Appendix B" active={currentStep === 2} done={currentStep > 2} />
                    <StepConnector />
                    <Step num={3} title="Expenses (RER)" active={currentStep === 3} done={currentStep > 3} />
                    <StepConnector />
                    <Step num={4} title="Attachments" active={currentStep === 4} done={false} />
                </ol>

                {/* --- 8. CONDITIONAL FORM RENDERING (Pass errors) --- */}
                <div className="mt-8">
                    {currentStep === 1 && (
                        <ItineraryForm 
                            onDataChange={setItineraryData} 
                            errors={errors} 
                        />
                    )}

                    {currentStep === 2 && (
                        <AppendixBForm 
                            onDataChange={setAppendixBData} 
                            user={user} 
                            errors={errors} 
                        />
                    )}

                    {currentStep === 3 && (
                        <RerForm 
                            onDataChange={setRerData} 
                            user={user} 
                            errors={errors} 
                        />
                    )}
                    
                    {currentStep === 4 && (
                        <Attachments 
                            onUpdateFiles={setAttachmentIds} 
                            // You can pass errors here too if you validate attachments
                            // errors={errors} 
                        />
                    )}
                </div>

                {/* --- 9. NAVIGATION BUTTONS (Disable while processing) --- */}
                <div className="mt-8 flex justify-between">
                    <Button 
                        variant="outline" 
                        onClick={prevStep} 
                        disabled={currentStep === 1 || processing}
                    >
                        Back
                    </Button>
                    
                    {currentStep < totalSteps ? (
                        <Button onClick={nextStep} disabled={processing}>
                            Next
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleFormSubmit} 
                            className="bg-green-600 hover:bg-green-700" 
                            disabled={processing}
                        >
                            {processing ? 'Submitting...' : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> 
                                    Submit Entire Travel Claim
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreateTravelClaim;
