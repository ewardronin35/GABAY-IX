import React, { useState } from 'react';
import axios from 'axios';

// Import all your form components
import ItineraryForm from './components/ItineraryForm';
import AppendixBForm from './components/AppendixBForm';
import RerForm from './components/RerForm';
import Attachments from './components/Attachments';

const CreateTravelClaim = () => {
    // Create state for each form's data
    const [itineraryData, setItineraryData] = useState(null);
    const [appendixBData, setAppendixBData] = useState(null);
    const [rerData, setRerData] = useState(null);
    const [attachmentIds, setAttachmentIds] = useState([]);

    const handleFormSubmit = async () => {
        // Simple validation
        if (!itineraryData || !appendixBData || !rerData) {
            alert('Please ensure all forms are filled out.');
            return;
        }

        // Combine all data into one payload for the backend
        // Your backend will need to be updated to handle this structure
        const finalPayload = {
            itinerary: itineraryData,
            appendixB: appendixBData,
            rer: rerData,
            attachments: attachmentIds,
        };

        console.log("Submitting Payload:", finalPayload);

        try {
            // NOTE: You will need to create a new backend endpoint for this combined data
            // For example: '/api/travel-claims'
            const response = await axios.post('/api/travel-claims', finalPayload);
            alert('Travel claim submitted successfully!');
        } catch (error) {
            console.error('Failed to submit travel claim:', error);
            alert('An error occurred. Please check the console.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
            <h1>Create New Travel Claim</h1>
            <p>Fill out all the necessary forms and upload supporting documents.</p>
            
            {/* You could implement a tab system here to switch between forms */}
            
            <ItineraryForm onDataChange={setItineraryData} />
            <AppendixBForm onDataChange={setAppendixBData} />
            <RerForm onDataChange={setRerData} />
            <Attachments onUpdateFiles={setAttachmentIds} />
            
            <div style={{ marginTop: '3rem', textAlign: 'right' }}>
                <button 
                    onClick={handleFormSubmit} 
                    style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Submit Entire Travel Claim
                </button>
            </div>
        </div>
    );
};

export default CreateTravelClaim;