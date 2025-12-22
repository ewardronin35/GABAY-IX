import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// --- FIX: DEFINED OUTSIDE THE COMPONENT ---
// This prevents the component from being destroyed/re-created on every keystroke.
const SmartInput = ({ 
    value, 
    onChange, // Now receives a handler function instead of setting state directly
    placeholder, 
    type = "text", 
    options = [], 
    className = "", 
    center = false 
}) => {
    const baseClass = `
        w-full bg-transparent outline-none px-1 h-6 text-sm font-bold transition-colors focus:ring-0
        border-b border-black dark:border-gray-400 dark:text-white
        ${center ? 'text-center' : 'text-left'} 
        ${className}
    `;

    if (type === 'select') {
        return (
            <select 
                value={value}
                onChange={onChange}
                className={`${baseClass} appearance-none cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/10`}
            >
                <option value="" disabled className='text-zinc-500 dark:bg-zinc-700'>{placeholder || "Select..."}</option>
                {options.map(opt => (
                    <option key={opt} value={opt} className="text-black dark:bg-zinc-700 dark:text-white">{opt}</option>
                ))}
            </select>
        );
    }

    return (
        <input 
            type={type} 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={baseClass}
        />
    );
};

export default function RerForm({ user, onDataChange, initialData }) {
    
    // --- 1. STATE INITIALIZATION ---
    const [formData, setFormData] = useState({
        entity_name: initialData?.entity_name || 'Commission on Higher Education RO-IX',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        fund_cluster: initialData?.fund_cluster || '01',
        rer_no: initialData?.rer_no || '',
        received_from: initialData?.received_from || user?.name || '', 
        designation: initialData?.designation || '',
        amount_words: initialData?.amount_words || '', 
        amount_figures: initialData?.amount_figures || '', 
        payment_for: initialData?.payment_for || '', 
        origin: initialData?.origin || '', 
        destination: initialData?.destination || '', 
        payee_name: initialData?.payee_name || '',
        payee_address: initialData?.payee_address || '',
        witness_name: initialData?.witness_name || '',
        witness_address: initialData?.witness_address || ''
    });

    const onDataChangeRef = useRef(onDataChange);

    useEffect(() => {
        onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    // --- 2. SYNC LOGIC ---
// --- 2. SYNC LOGIC ---
    useEffect(() => {
        const amountStr = String(formData.amount_figures).replace(/[^0-9.]/g, '');
        const total = parseFloat(amountStr) || 0;
        
        // Pass the raw form data AND the calculated total
        const fullPayload = {
            ...formData,
            total: total
        };

        if (onDataChangeRef.current) {
            onDataChangeRef.current(fullPayload);
        }
    }, [formData]);

    // --- 3. UNIVERSAL HANDLER ---
    // This handles the logic that used to be inside SmartInput
    const handleFieldChange = (field, e) => {
        let val = e.target.value;

        // Specific formatting logic for amount figures
        if (field === 'amount_figures') {
             val = val.replace(/[^0-9.]/g, ''); 
             const parts = val.split('.');
             if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
             }
        }
        
        setFormData(prev => ({...prev, [field]: val}));
    };

    return (
        <div className={`flex flex-col items-center gap-6 p-8 print:p-0 transition-colors duration-300 w-full`}>
            
            <div className="flex gap-4 w-full max-w-[8.5in] justify-end print:hidden">
                <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200">
                    <Printer className="w-4 h-4" /> Print Form
                </Button>
            </div>
            
            <div className="w-full max-w-[8.5in] bg-white text-black font-mono border-2 border-black dark:border-zinc-700 shadow-xl p-0 relative print:shadow-none print:border-black print:w-full dark:bg-zinc-900 dark:text-white">
                
                <div className="absolute top-2 right-4 text-xs italic font-sans dark:text-zinc-300 print:text-black">
                    Appendix 46
                </div>

                <div className="pt-10 pb-6 text-center">
                    <h1 className="font-bold text-xl uppercase tracking-wider">REIMBURSEMENT EXPENSE RECEIPT</h1>
                </div>

                {/* --- HEADER GRID --- */}
                <div className="border-y border-black flex dark:border-zinc-700">
                    <div className="flex-1 flex flex-col justify-center border-r border-black p-2 dark:border-zinc-700">
                        <div className="flex items-center text-sm mb-1">
                            <span className="font-bold w-24 min-w-[6rem]">Entity Name:</span>
                            <SmartInput 
                                value={formData.entity_name}
                                onChange={(e) => handleFieldChange('entity_name', e)}
                                className="flex-1 border-b border-dashed border-zinc-500"
                            />
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="font-bold w-24 min-w-[6rem]">Date :</span>
                            <SmartInput 
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleFieldChange('date', e)}
                                className="flex-1 uppercase font-mono border-b border-dashed border-zinc-500"
                            />
                        </div>
                    </div>
                    <div className="w-[35%] flex flex-col justify-center p-2">
                         <div className="flex items-end mb-1">
                            <span className="font-bold text-sm min-w-fit mr-2">Fund Cluster :</span>
                            <div className="flex-1 h-6">
                                <SmartInput 
                                    value={formData.fund_cluster}
                                    onChange={(e) => handleFieldChange('fund_cluster', e)}
                                    className="w-full text-right"
                                    placeholder="e.g. 01"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <span className="font-bold text-sm min-w-fit mr-2">RER No. :</span>
                            <div className="flex-1 h-6">
                                <SmartInput 
                                    value={formData.rer_no}
                                    onChange={(e) => handleFieldChange('rer_no', e)}
                                    className="w-full text-right"
                                    placeholder="Pending"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BODY CONTENT --- */}
                <div className="p-4 border-b border-black text-sm leading-relaxed dark:border-zinc-700">
                    
                    <div className="flex items-end flex-wrap">
                        <span className="mr-2 min-w-fit font-bold">RECEIVED from</span>
                        <div className="flex-1 flex flex-col items-center relative">
                            <SmartInput 
                                value={formData.received_from}
                                onChange={(e) => handleFieldChange('received_from', e)}
                                className="w-full text-center uppercase text-base"
                                placeholder="Employee Name"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                (Name)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end mt-4">
                        <div className="flex-1 flex flex-col items-center mr-2">
                            <SmartInput 
                                value={formData.designation}
                                onChange={(e) => handleFieldChange('designation', e)}
                                className="w-full text-center"
                                placeholder="Official Designation"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                (Official Designation)
                            </span>
                        </div>
                        <span className="mb-2 font-bold min-w-fit">the amount</span>
                    </div>

                    <div className="flex items-end mt-4">
                        <span className="mr-2 mb-2 font-bold min-w-fit">of</span>
                        <div className="flex-[2] flex flex-col items-center mr-2">
                            <SmartInput 
                                value={formData.amount_words}
                                onChange={(e) => handleFieldChange('amount_words', e)}
                                className="w-full text-center text-base"
                                placeholder="Amount in words"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                (In Words)
                            </span>
                        </div>
                        <span className="mb-2 mr-1 font-bold min-w-fit">(P</span>
                        <div className="flex-1 flex flex-col items-center mr-1">
                            <SmartInput 
                                value={formData.amount_figures}
                                onChange={(e) => handleFieldChange('amount_figures', e)}
                                className="w-full text-center text-lg font-mono"
                                placeholder="0.00"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                (in Figures)
                            </span>
                        </div>
                        <span className="mb-2 font-bold min-w-fit">)</span>
                    </div>

                    <div className="flex items-end mt-4">
                        <span className="mr-2 mb-2 font-bold min-w-fit">in payment for</span>
                        <div className="flex-1 flex flex-col items-center">
                            <SmartInput 
                                value={formData.payment_for}
                                onChange={(e) => handleFieldChange('payment_for', e)}
                                className="w-full text-center text-base"
                                placeholder="e.g. Taxi Fare"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                (Payments for subsistence, services,
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end mt-4">
                        <span className="mr-2 mb-2 ml-10 font-bold min-w-fit">from</span>
                        <div className="flex-1 flex flex-col items-center mr-2">
                            <SmartInput 
                                value={formData.origin}
                                onChange={(e) => handleFieldChange('origin', e)}
                                className="w-full text-center text-base"
                                placeholder="Origin"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                rental or transportation should show inclusive dates,
                            </span>
                        </div>
                        <span className="mb-2 mr-2 font-bold min-w-fit">to</span>
                         <div className="flex-1 flex flex-col items-center">
                            <SmartInput 
                                value={formData.destination}
                                onChange={(e) => handleFieldChange('destination', e)}
                                className="w-full text-center text-base"
                                placeholder="Destination"
                            />
                            <span className="text-[10px] italic leading-none mt-1 dark:text-zinc-400 print:text-black">
                                Transportation
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-[10px] italic mt-2 dark:text-zinc-400 print:text-black">
                        purpose, distance, inclusive points of travel, etc.
                    </div>
                </div>

                {/* --- PAYEE SECTION --- */}
                <div className="border-b border-black dark:border-zinc-700">
                    <div className="text-center font-bold py-2 border-b border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">PAYEE</div>
                    
                    <div className="flex px-4 py-2 gap-4 items-end">
                        <div className="w-32 text-sm font-bold min-w-[8rem]">Name/Signature</div>
                        <div className="flex-1">
                            <SmartInput 
                                value={formData.payee_name}
                                onChange={(e) => handleFieldChange('payee_name', e)}
                                className="w-full text-center uppercase text-base"
                                placeholder="Name of Payee"
                            />
                        </div>
                    </div>
                    <div className="flex px-4 pb-4 gap-4 items-end">
                        <div className="w-32 text-sm font-bold min-w-[8rem] text-right">Address</div>
                        <div className="flex-1">
                            <SmartInput 
                                value={formData.payee_address}
                                onChange={(e) => handleFieldChange('payee_address', e)}
                                className="w-full text-sm"
                                placeholder="Address of Payee"
                            />
                        </div>
                    </div>
                </div>

                {/* --- WITNESS SECTION --- */}
                <div className="border-b-2 border-black dark:border-zinc-700">
                     <div className="text-center font-bold py-2 border-b border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">WITNESS</div>
                    
                    <div className="flex px-4 py-2 gap-4 items-end">
                        <div className="w-32 text-sm font-bold min-w-[8rem]">Name/Signature</div>
                        <div className="flex-1">
                            <SmartInput 
                                value={formData.witness_name}
                                onChange={(e) => handleFieldChange('witness_name', e)}
                                className="w-full text-center text-base"
                                placeholder="Name of Witness"
                            />
                        </div>
                    </div>
                    <div className="flex px-4 pb-8 gap-4 items-end">
                        <div className="w-32 text-sm font-bold min-w-[8rem] text-right">Address</div>
                        <div className="flex-1">
                            <SmartInput 
                                value={formData.witness_address}
                                onChange={(e) => handleFieldChange('witness_address', e)}
                                className="w-full text-sm"
                                placeholder="Address of Witness"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0.5in; }
                    body, .dark, .dark * {
                        -webkit-print-color-adjust: exact !important; 
                        color: black !important;
                        background: white !important;
                        font-family: 'Times New Roman', Times, serif !important; 
                        box-shadow: none !important;
                        border-color: black !important;
                        font-size: 11pt;
                    }
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
                        border-bottom: 1px solid black !important; 
                    }
                    .bg-zinc-50, .dark .bg-zinc-800, .print\\:bg-zinc-100 { background: #f0f0f0 !important; }
                    .border-black, .border-zinc-700, .border-gray-400, .border-dashed {
                        border-color: black !important;
                        border-width: 1px !important;
                        border-style: solid !important; 
                    }
                    .print\\:hidden { display: none !important; }
                    input[type="date"]::-webkit-calendar-picker-indicator { display: none; }
                    select { appearance: none; border: none !important; text-align-last: center; padding: 0; }
                }
            `}</style>
        </div>
    );
}