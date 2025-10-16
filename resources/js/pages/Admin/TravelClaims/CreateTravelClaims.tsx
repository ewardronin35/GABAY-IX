import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedLayout from '@/layouts/app-layout';
import { Send, Map, FileText, DollarSign, Paperclip } from 'lucide-react';
import { usePage } from '@inertiajs/react'; // 👈 1. Import usePage to get user data

// 👇 FIX: Use named imports with curly braces for all .jsx components
import ItineraryForm from './components/ItineraryForm';
import AppendixBForm from './components/AppendixBForm';
import RerForm from './components/RerForm';
import Attachments from './components/Attachments';
import TravelReportForm from './components/TravelReportForm';

// 👇 FIX: Renamed component to singular 'CreateTravelClaim'
const CreateTravelClaim = () => {
    const { props } = usePage(); // Get all props passed from Laravel
    const user = props.auth.user; // 👈 3. Extract the user object
    const [itineraryData, setItineraryData] = useState(null);
    const [appendixBData, setAppendixBData] = useState(null);
    const [rerData, setRerData] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [attachmentIds, setAttachmentIds] = useState([]);

    const handleFormSubmit = async () => {
        if (!itineraryData || !appendixBData || !rerData) {
            alert('Please ensure the Itinerary, Appendix B, and RER forms are filled out.');
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

        try {
            await axios.post('/api/travel-claims', finalPayload);
            alert('Travel claim submitted successfully!');
        } catch (error) {
            console.error('Failed to submit travel claim:', error);
            alert('An error occurred. Please check the console for details.');
        }
    };

    return (
        <AuthenticatedLayout user={user} page_title="Create New Travel Claim">
            <Tabs defaultValue="itinerary" className="w-full">
                <TabsList>
                    <TabsTrigger 
                        value="itinerary" 
                        className="flex items-center gap-2 py-2 px-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Map className="h-4 w-4" />
                        Itinerary
                    </TabsTrigger>
                    <TabsTrigger 
                        value="appendixB" 
                        className="flex items-center gap-2 py-2 px-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <FileText className="h-4 w-4" />
                        Appendix B
                    </TabsTrigger>
                    <TabsTrigger 
                        value="rer" 
                        className="flex items-center gap-2 py-2 px-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <DollarSign className="h-4 w-4" />
                        Expenses
                    </TabsTrigger>
                    <TabsTrigger 
                        value="attachments" 
                        className="flex items-center gap-2 py-2 px-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Paperclip className="h-4 w-4" />
                        Attachments
                    </TabsTrigger>
                </TabsList>

                {/* --- All the TabsContent sections are correct --- */}
                <TabsContent value="itinerary">
                    <ItineraryForm onDataChange={setItineraryData} />
                </TabsContent>
                <TabsContent value="appendixB">
                    <AppendixBForm onDataChange={setAppendixBData} />
                </TabsContent>
                <TabsContent value="rer">
                    <RerForm onDataChange={setRerData} />
                </TabsContent>
                <TabsContent value="report">
                    <TravelReportForm 
                        onDataChange={setReportData}
                        itineraryData={itineraryData} 
                        appendixBData={appendixBData} 
                    />
                </TabsContent>
                <TabsContent value="attachments">
                    <Attachments onUpdateFiles={setAttachmentIds} />
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleFormSubmit}>
                            <Send className="mr-2 h-4 w-4" /> 
                            Submit Entire Travel Claim
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default CreateTravelClaim;



