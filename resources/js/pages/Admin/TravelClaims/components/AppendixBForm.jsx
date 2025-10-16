import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const CHED_LOGO_URL = '/images/ched-logo.png';

// 1. Header now includes the official CHED logo.
const OfficialHeader = () => (
    <div className="flex flex-col items-center text-center mb-8 text-slate-800 dark:text-slate-300">
                 <img src={CHED_LOGO_URL} alt="CHED Logo" className="h-20" />

        <p className="text-sm">Republic of the Philippines</p>
        <p className="font-bold text-slate-900 dark:text-slate-50">COMMISSION ON HIGHER EDUCATION</p>
        <p className="font-semibold">REGIONAL OFFICE IX, ZAMBOANGA CITY</p>
    </div>
);

const AppendixBForm = ({ user, onDataChange }) => {
    // 2. State is updated to handle all the new fields.
    const [formData, setFormData] = useState({
        name: user?.name || '',
        position: user?.position || '',
        official_station: user?.official_station || 'CHEDRO-IX, Z.C.',
        supervisor_name: 'MARIVIC V. IRIBERRI',
        supervisor_designation: 'Officer In-Charge, Office of the Director IV',
        date_signed_claimant: '',
        date_signed_supervisor: '',

        // New fields from the image
        travel_order_no: '',
        travel_order_date: '',
        travel_condition: 'strictly', // Default value for the radio group
        explanation: '',
        attachments: {
            certOfAppearance: true,
            busTickets: false,
            planeTickets: true,
            boatTickets: false,
            memorandum: true,
            itinerary: true,
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };
    
    // Handler for the radio group
    const handleConditionChange = (value) => {
        setFormData(prevState => ({ ...prevState, travel_condition: value }));
    };

    // Handler for the attachment checkboxes
    const handleAttachmentChange = (name) => {
        setFormData(prevState => ({
            ...prevState,
            attachments: {
                ...prevState.attachments,
                [name]: !prevState.attachments[name]
            }
        }));
    };

    useEffect(() => {
        onDataChange(formData);
    }, [formData, onDataChange]);

    return (
        <div className="border border-slate-200 dark:border-slate-800 p-8 rounded-lg bg-white dark:bg-slate-950 shadow-md max-w-4xl mx-auto my-4">
            <OfficialHeader />
            <h2 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-50">
                Appendix B: Certificate of Travel Completed
            </h2>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                <div className="space-y-2"><Label htmlFor="name">Name of Official/Employee</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="position">Position</Label><Input id="position" name="position" value={formData.position} onChange={handleInputChange} /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="official_station">Official Station</Label><Input id="official_station" name="official_station" value={formData.official_station} onChange={handleInputChange} /></div>
            </div>

            <Separator className="my-8" />
            
            {/* 3. This whole section is new, based on your image. */}
            <div className="space-y-6 text-slate-800 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-4">
                    <span>I hereby certify that I have completed the travel authorized in the Travel Order/Itinerary</span>
                    <Input name="travel_order_no" placeholder="Travel No." value={formData.travel_order_no} onChange={handleInputChange} className="w-32" />
                    <span>dated</span>
                    <Input type="date" name="travel_order_date" value={formData.travel_order_date} onChange={handleInputChange} className="w-auto" />
                    <span>under conditions indicated below:</span>
                </div>

                <RadioGroup value={formData.travel_condition} onValueChange={handleConditionChange} className="space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="strictly" id="strictly" /><Label htmlFor="strictly">Strictly in accordance with the approved itinerary.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="cut_short" id="cut_short" /><Label htmlFor="cut_short">Cut short as explained below.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="extended" id="extended" /><Label htmlFor="extended">Extended as explained below, additional itinerary was submitted.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="deviation" id="deviation" /><Label htmlFor="deviation">Other deviation as explained below.</Label></div>
                </RadioGroup>

                <div>
                    <Label htmlFor="explanation">Explanation or Justifications:</Label>
                    <Textarea name="explanation" id="explanation" value={formData.explanation} onChange={handleInputChange} className="mt-2" />
                </div>
                
                <Separator />
                
                <div>
                    <p className="font-semibold mb-4">Evidence of travel hereto attached: Please check:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2"><Checkbox id="certOfAppearance" checked={formData.attachments.certOfAppearance} onCheckedChange={() => handleAttachmentChange('certOfAppearance')} /><Label htmlFor="certOfAppearance">1. Certificate of Appearance</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="memorandum" checked={formData.attachments.memorandum} onCheckedChange={() => handleAttachmentChange('memorandum')} /><Label htmlFor="memorandum">5. Memorandum</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="busTickets" checked={formData.attachments.busTickets} onCheckedChange={() => handleAttachmentChange('busTickets')} /><Label htmlFor="busTickets">2. Bus tickets</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="itinerary" checked={formData.attachments.itinerary} onCheckedChange={() => handleAttachmentChange('itinerary')} /><Label htmlFor="itinerary">6. Itinerary of Travel</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="planeTickets" checked={formData.attachments.planeTickets} onCheckedChange={() => handleAttachmentChange('planeTickets')} /><Label htmlFor="planeTickets">3. Plane tickets</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="boatTickets" checked={formData.attachments.boatTickets} onCheckedChange={() => handleAttachmentChange('boatTickets')} /><Label htmlFor="boatTickets">4. Boat tickets</Label></div>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 flex justify-end">
                <div className="w-full md:w-1/2 text-center">
                    <p className="text-sm text-slate-700 dark:text-slate-400 mb-8">Respectfully submitted:</p>
                    <div className="space-y-2 mb-8">
                         <Label htmlFor="date_signed_claimant">Date Signed by Claimant</Label>
                         <Input id="date_signed_claimant" type="date" name="date_signed_claimant" value={formData.date_signed_claimant} onChange={handleInputChange} className="w-1/2 mx-auto" />
                    </div>
                    <div className="border-b border-slate-900 dark:border-slate-400 w-full mt-16 mb-2"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-400">(Signature of Claimant)</p>
                </div>
            </div>

            <Separator className="my-8" />

            <p className="leading-relaxed text-center text-slate-800 dark:text-slate-300">
                <strong>I HEREBY CERTIFY</strong> that the official named above has completed the travel as stated.
            </p>

             <div className="mt-12 flex justify-end">
                <div className="w-full md:w-1/2 text-center space-y-4">
                    <div className="space-y-2"><Label htmlFor="date_signed_supervisor">Date Signed by Supervisor</Label><Input id="date_signed_supervisor" type="date" name="date_signed_supervisor" value={formData.date_signed_supervisor} onChange={handleInputChange} className="w-1/2 mx-auto" /></div>
                    <div className="border-b border-slate-900 dark:border-slate-400 w-full mt-16 mb-2"></div>
                    <p className="text-sm font-bold uppercase text-slate-900 dark:text-slate-50">{formData.supervisor_name}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-400">{formData.supervisor_designation}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">(Signature of Immediate Supervisor)</p>
                </div>
            </div>

        </div>
    );
};

export default AppendixBForm;