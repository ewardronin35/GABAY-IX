import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// The path to your CHED logo inside the public folder
const CHED_LOGO_PATH = '/chedlogo.png'; 

// --- 5. Smart Input Component (Memoized for Stability) ---
// Define this outside the main component for best practice if possible, 
// but we define it inside to ensure it can be used within the exported component structure
const SmartInput = memo(({ 
    value, 
    field, 
    placeholder, 
    type = "text", 
    className = "",
    isSignature = false,
    onChangeHandler // Stable handleChange function passed here
}) => {
    const baseClass = `
        w-full bg-transparent outline-none px-1 h-6 text-sm transition-colors 
        border-b border-gray-400 dark:border-gray-500 focus:border-indigo-600
        dark:text-white font-serif 
        ${isSignature ? 'border-b-2 border-black/80 dark:border-white/80 h-8 font-semibold uppercase' : ''}
        ${className}
    `;

    const inputHandler = (e) => {
        // Use the stable onChangeHandler passed from the parent
        onChangeHandler(field, e.target.value);
    }

    return (
        <input 
            type={type} 
            value={value}
            onChange={inputHandler}
            placeholder={placeholder}
            className={baseClass}
        />
    );
});


export default function AppendixBForm({ user, onDataChange, initialData }) {
    
    // --- 1. STATE INITIALIZATION FOR APPENDIX 47 ---
    const [formData, setFormData] = useState({
        entity_name: initialData?.entity_name || 'Commission on Higher Education RO-IX',
        fund_cluster: initialData?.fund_cluster || '01', 
        
        travel_order_no: initialData?.travel_order_no || 'N/A', 
        travel_order_date: initialData?.travel_order_date || new Date().toISOString().split('T')[0],
        
        employee_signature_name: initialData?.employee_signature_name || user?.name || 'JOSEPH LOU C. STA TERESA',
          position: initialData?.position || '', 
        // Logic for 'travel_condition'
        travel_condition: initialData?.travel_condition || 'Strictly in accordance with the approved itinerary',
        
        // Status Checkboxes (Visual State)
        status_approved_itinerary: 'X', 
        status_cut_short_refund_or_no: '',
        status_cut_short_refund_date: '',
        status_extended_deviation: '', 

        explanation: initialData?.explanation || '',

        // Checklist
        checked_items: initialData?.checked_items || {
            '1_certificate_of_appearance': 'X',
            '5_memorandum': 'X',
            '6_itinerary_of_travel': 'X',
        },
        
        certified_by_name: initialData?.certified_by_name || 'MARIVIC V. IRIBERRI',
        certified_by_position: initialData?.certified_by_position || 'Officer In-Charge, Office of the Director IV',
    });


    // --- 2. SYNC LOGIC (FIXED) ---
    // Use a ref to store the latest onDataChange function without it being a dependency
    const onDataChangeRef = useRef(onDataChange);
    useEffect(() => {
        onDataChangeRef.current = onDataChange;
    }, [onDataChange]);
    
    // Use a separate useEffect to sync the data to the parent ONLY when formData changes
   useEffect(() => {
        // Prepare the payload exactly how the backend wants it
        const payload = {
            ...formData,
            // Map the visual fields to the required 'name' and 'position' fields if missing
            name: formData.employee_signature_name,
           position: formData.position,
            date_signed_claimant: new Date().toISOString().split('T')[0], // Auto-fill today's date
        };
        onDataChangeRef.current(payload); 
    }, [formData]);

    // --- 3. UNIVERSAL INPUT HANDLER (STABILIZED WITH useCallback) ---
    const handleChange = useCallback((field, value) => {
        // Direct update, relying on React's batching for stability
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []); // Empty dependency array means this function never changes

    // --- 4. CHECKBOX HANDLER (For nested 'checked_items') ---
    const handleChecklistChange = useCallback((key, value) => {
        setFormData(prev => ({
            ...prev,
            checked_items: {
                ...prev.checked_items,
                [key]: value
            }
        }));
    }, []); // Empty dependency array means this function never changes

    
    // --- 6. Checkbox Component for Appendix 47 ---
    const CheckboxInput = ({ checkedValue, field, isChecklist = false }) => {
        // Toggles between checked value ('X') and unchecked ('')
        const toggle = () => {
            const newValue = checkedValue === 'X' ? '' : 'X';
            
            if (isChecklist) {
                handleChecklistChange(field, newValue);
            } else {
                // Special handling for the cut short field to automatically populate placeholders
                if (field === 'status_cut_short_refund_or_no') {
                     handleChange('status_cut_short_refund_or_no', newValue === 'X' ? 'N/A' : ''); 
                     handleChange('status_cut_short_refund_date', newValue === 'X' ? 'N/A' : ''); 
                } else {
                    handleChange(field, newValue);
                }
            }
        };
        
        const baseClass = `w-4 h-4 border border-black dark:border-white flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-900`;

        return (
            <div className={baseClass} onClick={toggle}>
                {checkedValue === 'X' && (
                    <span className="text-black dark:text-white text-xs font-bold">X</span>
                )}
            </div>
        );
    };


    return (
        <div className={`flex flex-col items-center gap-6 p-8 print:p-0 transition-colors duration-300 w-full font-serif`}>
            
            {/* --- TOOLBAR --- (Hidden on print) */}
            <div className="flex gap-4 w-full max-w-[8.5in] justify-end print:hidden">
                <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200">
                    <Printer className="w-4 h-4" /> Print Form (Appendix 47)
                </Button>
            </div>
            
            {/* --- FORM CONTAINER (Paper Look - Appendix 47) --- */}
            <div className="w-full max-w-[8.5in] bg-white text-black border-2 border-black shadow-xl p-8 relative print:shadow-none print:border-black dark:bg-zinc-900 dark:text-white text-base">
                
                {/* --- OFFICIAL HEADER --- */}
                <div className="flex justify-center items-start pt-4 relative">
                    {/* Logo and Entity Name */}
                    <div className="absolute left-0 top-0">
                        <img 
                            src={CHED_LOGO_PATH} 
                            alt="CHED Logo" 
                            className="w-16 h-16 object-contain print:w-12 print:h-12" 
                        />
                    </div>

                    <div className="text-center leading-tight">
                        <p className="text-xs font-semibold">Republic of the Philippines</p>
                        <p className="text-sm font-semibold">Office of the President</p>
                        <p className="text-lg font-extrabold text-red-700 dark:text-red-500">COMMISSION ON HIGHER EDUCATION</p>
                        <p className="text-sm font-semibold">Region IX, Zamboanga Peninsula</p>
                        <p className="text-sm">Zamboanga City</p>
                    </div>

                    {/* Appendix 47 Label */}
                    <div className="absolute right-0 top-0 text-sm font-semibold">
                        Appendix 47
                    </div>
                </div>

                {/* --- MAIN TITLE --- */}
                <div className="text-center pt-8 pb-8">
                    <h1 className="font-extrabold text-xl uppercase tracking-wider">
                        Certificate of Travel Completed
                    </h1>
                </div>

                {/* --- HEADER FIELDS --- */}
                <div className="grid grid-cols-2 gap-4 pb-4 text-sm">
                    <div className="flex items-center">
                        <span className="font-semibold mr-2 w-24">Entity Name:</span>
                        <SmartInput field="entity_name" value={formData.entity_name} className="flex-1 font-normal" onChangeHandler={handleChange} />
                    </div>
                    <div className="flex items-center justify-end">
                        <span className="font-semibold mr-2">Fund Cluster:</span>
                        <SmartInput field="fund_cluster" value={formData.fund_cluster} className="w-24 text-center font-normal" onChangeHandler={handleChange} />
                    </div>
                </div>

                {/* --- CERTIFICATION STATEMENT --- */}
                <div className="pt-4 leading-relaxed text-sm">
                    <p>I hereby certify that I have completed the travel authorized in the Travel Order/Itinerary <SmartInput isSignature={true} field="employee_signature_name" value={formData.employee_signature_name} className="inline-block w-96 text-center text-sm" onChangeHandler={handleChange} /> </p>
                    <p className="mt-2">
                        {/* FIX: Mapped to travel_order_no */}
                        Travel No. <SmartInput field="travel_order_no" value={formData.travel_order_no} className="inline-block w-40 text-center text-sm" onChangeHandler={handleChange} /> 
                        {/* FIX: Mapped to travel_order_date */}
                        dated <SmartInput field="travel_order_date" value={formData.travel_order_date} className="inline-block w-24 text-center text-sm" onChangeHandler={handleChange} /> under conditions indicated below:
                    </p>
                    {/* Status Checkboxes */}
                    <div className="pl-4 pt-4 space-y-3">
                        {/* 1. Strictly in accordance */}
                        <div className="flex items-center space-x-2">
                            <CheckboxInput 
                                checkedValue={formData.status_approved_itinerary} 
                                field="status_approved_itinerary" 
                            />
                            <p>Strictly in accordance with the approved itinerary.</p>
                        </div>

                        {/* 2. Cut short / Refund */}
                        <div className="flex items-center space-x-2">
                            <CheckboxInput 
                                checkedValue={formData.status_cut_short_refund_or_no ? 'X' : ''} 
                                field="status_cut_short_refund_or_no" 
                            />
                            <p>
                                Cut short as explained below. Excess in payment in the amount of 
                                <span className="inline-block mx-2 border-b border-black dark:border-white w-24"></span> was refunded on O.R. No. 
                                <SmartInput field="status_cut_short_refund_or_no" value={formData.status_cut_short_refund_or_no} className="inline-block w-24 text-center text-sm" onChangeHandler={handleChange} />
                            </p>
                        </div>
                        <div className="pl-6">
                            <p>
                                dated <SmartInput field="status_cut_short_refund_date" value={formData.status_cut_short_refund_date} className="inline-block w-24 text-center text-sm" onChangeHandler={handleChange} />
                            </p>
                        </div>
                        
                        {/* 3. Extended / Deviation */}
                        <div className="flex items-center space-x-2 pt-3">
                            <CheckboxInput 
                                checkedValue={formData.status_extended_deviation} 
                                field="status_extended_deviation" 
                            />
                            <p>Extended as explained below, additional itinerary was submitted</p>
                        </div>
                        <div className="pl-6">
                            <p>Other deviation as explained below.</p>
                        </div>
                    </div>
                </div>

                {/* --- EXPLANATION/JUSTIFICATION --- */}
                <div className="pt-6">
                    <p className="text-sm font-bold mb-1">Explanation or Justifications:</p>
                    <div className="border border-black dark:border-white h-12 p-1">
                        <SmartInput field="explanation" value={formData.explanation} className="h-full border-none p-0 text-sm" placeholder="Enter explanation here..." onChangeHandler={handleChange} />
                    </div>
                </div>

                {/* --- EVIDENCE CHECKLIST --- */}
                <div className="pt-8 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-bold mb-2">Evidence of travel hereto attached:</p>
                        <p className="font-bold mb-1">Please check:</p>

                        <div className="space-y-1">
                            {/* Checklist Column 1 */}
                            {[
                                { num: '1.', label: 'Certificate of Appearance', field: '1_certificate_of_appearance' },
                                { num: '2.', label: 'Bus tickets', field: '2_bus_tickets' },
                                { num: '3.', label: 'Plane tickets', field: '3_plane_tickets' },
                                { num: '4.', label: 'Boat tickets', field: '4_boat_tickets' },
                            ].map(item => (
                                <div key={item.num} className="flex items-center">
                                    <CheckboxInput 
                                        checkedValue={formData.checked_items[item.field]} 
                                        field={item.field} 
                                        isChecklist={true}
                                    />
                                    <span className="ml-2 w-8 text-right">{item.num}</span>
                                    <span className="ml-2">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10">
                        <div className="space-y-1">
                            {/* Checklist Column 2 */}
                            {[
                                { num: '5.', label: 'Memorandum', field: '5_memorandum' },
                                { num: '6.', label: 'Itinerary of Travel', field: '6_itinerary_of_travel' },
                                { num: '7.', label: 'Travel Report', field: '7_travel_report' },
                            ].map(item => (
                                <div key={item.num} className="flex items-center">
                                    <CheckboxInput 
                                        checkedValue={formData.checked_items[item.field]} 
                                        field={item.field} 
                                        isChecklist={true}
                                    />
                                    <span className="ml-2 w-8 text-right">{item.num}</span>
                                    <span className="ml-2">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- SIGNATURES --- */}
                <div className="mt-12">
                    
                    {/* Employee Signature */}
                    <div className="text-right mb-12">
                        <p className="text-sm font-semibold mb-2">Respectfully submitted:</p>
                        <div className="inline-block w-80 text-center">
                            <SmartInput 
                                field="employee_signature_name"
                                value={formData.employee_signature_name}
                                className="w-full text-center uppercase text-sm"
                                isSignature={true}
                                onChangeHandler={handleChange} 
                            />
                            {/* FIX: POSITION INPUT - EMPTY BY DEFAULT */}
                           <SmartInput 
                                field="position"
                                value={formData.position}
                                className="w-full text-center text-xs mt-1"
                                placeholder="Enter Position"
                                onChangeHandler={handleChange} 
                            />
                            <p className="text-xs text-center pt-1">
                                Employee
                            </p>
                        </div>
                    </div>
                    
                    {/* Final Certification */}
                    <p className="text-sm italic mb-4">
                        On evidence and information of which I have knowledge, the travel was actually undertaken.
                    </p>

                    {/* Approving Officer Signature */}
                    <div className="flex justify-end mt-12">
                        <div className="w-96">
                            <SmartInput 
                                field="certified_by_name"
                                value={formData.certified_by_name}
                                className="w-full text-center uppercase text-base"
                                isSignature={true}
                                onChangeHandler={handleChange} 
                            />
                            <SmartInput 
                                field="certified_by_position"
                                value={formData.certified_by_position}
                                className="w-full text-center text-sm mt-1"
                                isSignature={true}
                                onChangeHandler={handleChange} 
                            />
                            <p className="text-xs text-center mt-1">
                                Signature over Printed Name and Official Designation
                            </p>
                        </div>
                    </div>

                </div>

            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0.5in; }
                    
                    /* Force black/white/serif for document printing */
                    body, .dark, .dark * {
                        -webkit-print-color-adjust: exact !important; 
                        color: black !important;
                        background: white !important;
                        font-family: 'Times New Roman', Times, serif !important; 
                        box-shadow: none !important;
                        border-color: black !important;
                        font-size: 11pt;
                    }
                    
                    /* Reset all digital borders/shadows/rings */
                    .shadow-xl, .dark .shadow-xl { box-shadow: none !important; border: 2px solid black !important; }
                    
                    input, select {
                        border: none !important;
                        outline: none !important;
                        padding: 0 !important;
                        color: black !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        text-align: inherit !important;
                        min-height: auto !important;
                        height: auto !important;
                        border-bottom: 1px solid black !important; /* Retain the input line */
                    }

                    /* Use black for all visible grid lines */
                    .border-black, .border-zinc-700, .border-gray-400, .border-dashed, .border-black\\/50, .dark .border-white\\/50 {
                        border-color: black !important;
                    }
                    
                    /* Hide action buttons on print */
                    .print\\:hidden { display: none !important; }

                    /* Hide native date/time icons */
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}