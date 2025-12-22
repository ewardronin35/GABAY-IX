// components/CerrForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Printer } from "lucide-react";

// --- TYPES ---
interface CerrItem {
    id: string; 
    particulars: string;
    amount: number | string;
}

interface CerrData {
    employee_name: string;
    employee_no: string;
    office: string;
    division: string;
    purpose: string;
    items: CerrItem[];
    total: number;
    // Footer fields
    employee_position: string;
    supervisor_name: string;
    supervisor_position: string;
    date_employee: string;
    date_supervisor: string;
}

interface Props {
    user?: { name: string };
    onDataChange?: (data: CerrData) => void;
    initialData?: Partial<CerrData>;
}

export function CerrForm({ user, onDataChange, initialData }: Props) {
    // 1. Initialize State
    const [formData, setFormData] = useState<CerrData>({
        employee_name: initialData?.employee_name || user?.name || '', 
        employee_no: initialData?.employee_no || '',
        office: initialData?.office || 'CHEDRO-IX, ZC',
        division: initialData?.division || '',
        purpose: initialData?.purpose || '',
        items: initialData?.items || [
            { id: '1', particulars: '', amount: '' },
        ],
        total: initialData?.total || 0,
        employee_position: initialData?.employee_position || '',
        supervisor_name: initialData?.supervisor_name || 'MARIVIC V. IRIBERRI',
        supervisor_position: initialData?.supervisor_position || 'Officer In-Charge, Office of the Director IV',
        date_employee: initialData?.date_employee || '',
        date_supervisor: initialData?.date_supervisor || '',
    });

    const onDataChangeRef = useRef(onDataChange);

    useEffect(() => {
        onDataChangeRef.current = onDataChange;
    }, [onDataChange]);


    // 2. Sync Logic
    useEffect(() => {
        const newTotal = formData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        
        let payload = formData;

        if (newTotal !== formData.total) {
            payload = { ...formData, total: newTotal };
            setFormData(payload); 
        }

        if (onDataChangeRef.current) {
            onDataChangeRef.current(payload);
        }

    }, [
        formData.items, 
        formData.employee_name, 
        formData.office, 
        formData.purpose, 
        formData.supervisor_name,
    ]);

    // 3. Handlers
    const updateItem = (index: number, field: keyof CerrItem, value: any) => {
        const newItems = [...formData.items];
        const updatedValue = (field === 'amount') ? (value === '' ? '' : parseFloat(value) || 0) : value;
        newItems[index] = { ...newItems[index], [field]: updatedValue };
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({ 
            ...formData, 
            items: [...formData.items, { id: Math.random().toString(), particulars: '', amount: '' }] 
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) {
            setFormData({ ...formData, items: [{ id: '1', particulars: '', amount: '' }] });
            return;
        }
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

    const MIN_ROWS = 12;

    return (
        <div className="flex flex-col items-center gap-4 py-8 w-full print:p-0">
            
            {/* PAPER CONTAINER */}
            <div className="w-full max-w-[8.5in] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-sm shadow-xl dark:shadow-none border border-zinc-200 dark:border-zinc-700 print:shadow-none print:w-full print:dark:bg-white print:dark:text-black print:border-black">
                
                {/* --- HEADER SECTION --- */}
                <div className="p-4 relative">
                    <div className="absolute top-4 right-4 font-bold text-xs uppercase text-zinc-600 dark:text-zinc-400 print:text-black">ANNEX A</div>
                    
                    <div className="flex items-center justify-center mb-4 pt-2">
                         <div className="w-12 h-12 mr-3 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full print:hidden">
                            <img
                                src="/chedlogo.png"
                                alt="CHED Logo"
                                loading="lazy"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="text-center leading-tight">
                            <h3 className="font-extrabold text-base uppercase text-indigo-700 dark:text-indigo-400">Commission on Higher Education</h3>
                            <p className="text-sm font-medium">Western Mindanao, Regional Office IX</p>
                            <p className="text-xs">Baliwasan Chico, Zamboanga City</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-zinc-300 dark:border-zinc-700 mt-4 pt-2 pb-1 text-center bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100 print:border-black">
                        <h1 className="font-bold text-lg leading-tight">CERTIFICATION OF EXPENSES NOT REQUIRING RECEIPTS</h1>
                        <p className="text-xs italic text-zinc-600 dark:text-zinc-400 print:text-black">Pursuant to COA Circular No. 2017-001- dated June 19, 2017</p>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="border-t border-b border-zinc-300 dark:border-zinc-700 print:border-black">
                    
                    {/* ROW 1: Name and Emp No */}
                    <div className="flex border-b border-zinc-300 dark:border-zinc-700 print:border-black">
                        <div className="w-32 p-2 border-r border-zinc-300 dark:border-zinc-700 print:border-black font-semibold text-xs flex items-center bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                            Name of Employee
                        </div>
                        <div className="flex-1 border-r border-zinc-300 dark:border-zinc-700 print:border-black p-1">
                            <input 
                                type="text" 
                                className="w-full uppercase font-bold text-sm outline-none bg-transparent dark:text-white print:text-black"
                                value={formData.employee_name}
                                onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                                placeholder="FULL NAME"
                                aria-label="Employee Name"
                            />
                        </div>
                        <div className="w-24 p-2 border-r border-zinc-300 dark:border-zinc-700 print:border-black font-semibold text-xs flex items-center leading-none bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                            Employee No.
                        </div>
                        <div className="w-32 p-1">
                             <input 
                                type="text" 
                                className="w-full text-sm outline-none bg-transparent dark:text-white print:text-black"
                                value={formData.employee_no}
                                onChange={(e) => setFormData({...formData, employee_no: e.target.value})}
                                aria-label="Employee Number" // FIX: Accessibility Label
                            />
                        </div>
                    </div>

                    {/* ROW 2: Office */}
                    <div className="flex border-b border-zinc-300 dark:border-zinc-700 print:border-black">
                        <div className="w-32 p-2 border-r border-zinc-300 dark:border-zinc-700 print:border-black font-semibold text-xs flex items-center bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                            Office
                        </div>
                        <div className="flex-1 p-1">
                            <input 
                                type="text" 
                                className="w-full text-sm outline-none bg-transparent dark:text-white print:text-black"
                                value={formData.office}
                                onChange={(e) => setFormData({...formData, office: e.target.value})}
                                aria-label="Office" // FIX: Accessibility Label
                            />
                        </div>
                    </div>

                    {/* ROW 3: Division */}
                    <div className="flex border-b border-zinc-300 dark:border-zinc-700 print:border-black h-8">
                        <div className="w-32 p-2 border-r border-zinc-300 dark:border-zinc-700 print:border-black font-semibold text-xs flex items-center bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                            Division
                        </div>
                        <div className="flex-1 p-1">
                            <input 
                                type="text" 
                                className="w-full text-sm outline-none bg-transparent dark:text-white print:text-black"
                                value={formData.division}
                                onChange={(e) => setFormData({...formData, division: e.target.value})}
                                aria-label="Division" // FIX: Accessibility Label
                            />
                        </div>
                    </div>

                    {/* --- EXPENSE TABLE --- */}
                    <div className="flex border-b border-zinc-400 dark:border-zinc-600 print:border-black bg-zinc-100 dark:bg-zinc-700 print:bg-zinc-100">
                        <div className="flex-1 border-r border-zinc-400 dark:border-zinc-600 print:border-black text-center font-bold text-xs p-2 uppercase text-indigo-800 dark:text-indigo-300">
                            Particulars
                        </div>
                        <div className="w-40 text-center font-bold text-xs p-2 uppercase text-indigo-800 dark:text-indigo-300">
                            Amount (₱)
                        </div>
                    </div>

                    {/* Items */}
                    <div className="min-h-[250px] divide-y divide-zinc-200 dark:divide-zinc-700 print:divide-black">
                        {formData.items.map((item, index) => (
                            <div key={item.id} className="flex h-8 group relative hover:bg-zinc-50/70 dark:hover:bg-zinc-800/70">
                                <div className="flex-1 border-r border-zinc-200 dark:border-zinc-700 print:border-black px-2 py-1">
                                    <input 
                                        type="text" 
                                        className="w-full h-full text-sm outline-none bg-transparent font-medium dark:text-white print:text-black"
                                        value={item.particulars}
                                        onChange={(e) => updateItem(index, 'particulars', e.target.value)}
                                        placeholder="Description of expense"
                                        aria-label={`Particulars Row ${index + 1}`} // FIX: Accessibility Label
                                    />
                                </div>
                                <div className="w-40 px-2 py-1 text-center relative">
                                    <input 
                                        type="number" 
                                        className="w-full h-full text-center text-sm outline-none bg-transparent dark:text-white print:text-black"
                                        value={item.amount}
                                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                        placeholder="0.00"
                                        aria-label={`Amount Row ${index + 1}`} // FIX: Accessibility Label
                                    />
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 print:hidden text-red-500 hover:bg-red-100 rounded p-1"
                                        aria-label={`Remove Item ${index + 1}`} // FIX: Accessibility Label
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Row */}
                    <div className="flex border-t border-b border-zinc-400 dark:border-zinc-600 print:border-black bg-indigo-50 dark:bg-zinc-700 print:bg-zinc-200">
                        <div className="flex-1 border-r border-zinc-400 dark:border-zinc-600 print:border-black text-right font-bold text-sm p-2 pr-4 text-indigo-900 dark:text-indigo-200">
                            TOTAL
                        </div>
                        <div className="w-40 text-center font-bold text-base p-2 dark:text-white print:text-black font-mono">
                             {formData.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                    </div>

                    {/* --- PURPOSE SECTION --- */}
                    <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black">
                        <div className="font-semibold text-xs p-2 border-b border-zinc-300 dark:border-zinc-700 print:border-black bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                            Purpose
                        </div>
                        <div className="h-24 p-2">
                             <textarea 
                                className="w-full h-full resize-none text-center italic font-bold text-base outline-none bg-transparent pt-4 dark:text-white print:text-black"
                                value={formData.purpose}
                                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                                placeholder="Enter the purpose of expense here"
                                aria-label="Purpose" // FIX: Accessibility Label
                            />
                        </div>
                    </div>

                     {/* --- FOOTER GRID --- */}
                     <div className="flex divide-x divide-zinc-300 dark:divide-zinc-700 print:divide-black border-t border-zinc-300 dark:border-zinc-700 print:border-black">
                        
                        {/* COLUMN 1: CERTIFIED CORRECT */}
                        <div className="flex-1 flex flex-col">
                            <div className="font-semibold text-xs p-2 border-b border-zinc-300 dark:border-zinc-700 print:border-black bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                                Certified Correct:
                            </div>
                            <div className="h-12 border-b border-zinc-300 dark:border-zinc-700 print:border-black"></div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center">
                                <input 
                                    className="w-full text-center font-bold text-sm uppercase outline-none bg-transparent dark:text-white print:text-black"
                                    value={formData.employee_name}
                                    readOnly 
                                    placeholder="Employee Name"
                                    aria-label="Certified by Employee Name" // FIX: Accessibility Label
                                />
                            </div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center h-8">
                                <input 
                                    className="w-full text-center text-[10px] outline-none bg-transparent dark:text-white print:text-black"
                                    value={formData.employee_position}
                                    onChange={(e) => setFormData({...formData, employee_position: e.target.value})}
                                    placeholder="Position"
                                    aria-label="Employee Position" // FIX: Accessibility Label
                                />
                            </div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center font-semibold text-xs bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                                Employee
                            </div>
                            <div className="flex p-1">
                                <span className="text-xs font-semibold mr-2">Date:</span>
                                <input 
                                    type="text"
                                    className="flex-1 text-xs outline-none bg-transparent dark:text-white print:text-black"
                                    value={formData.date_employee}
                                    onChange={(e) => setFormData({...formData, date_employee: e.target.value})}
                                    placeholder="YYYY-MM-DD"
                                    aria-label="Date Signed by Employee" // FIX: Accessibility Label
                                />
                            </div>
                        </div>

                        {/* COLUMN 2: NOTED BY */}
                        <div className="flex-1 flex flex-col">
                            <div className="font-semibold text-xs p-2 border-b border-zinc-300 dark:border-zinc-700 print:border-black bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                                Noted By:
                            </div>
                            <div className="h-12 border-b border-zinc-300 dark:border-zinc-700 print:border-black"></div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center">
                                <input 
                                    className="w-full text-center font-bold text-sm uppercase outline-none bg-transparent dark:text-white print:text-black"
                                    value={formData.supervisor_name}
                                    onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
                                    placeholder="Supervisor Name"
                                    aria-label="Supervisor Name" // FIX: Accessibility Label
                                />
                            </div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center h-8 flex items-center">
                                <textarea 
                                    className="w-full text-center text-[10px] outline-none resize-none overflow-hidden bg-transparent dark:text-white print:text-black"
                                    rows={2}
                                    value={formData.supervisor_position}
                                    onChange={(e) => setFormData({...formData, supervisor_position: e.target.value})}
                                    placeholder="Supervisor Position"
                                    aria-label="Supervisor Position" // FIX: Accessibility Label
                                />
                            </div>
                            <div className="border-b border-zinc-300 dark:border-zinc-700 print:border-black p-1 text-center font-semibold text-xs bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                                Immediate Supervisor
                            </div>
                            <div className="flex p-1">
                                <span className="text-xs font-semibold mr-2">Date:</span>
                                <input 
                                    type="text"
                                    className="flex-1 text-xs outline-none bg-transparent dark:text-white print:text-black"
                                    value={formData.date_supervisor}
                                    onChange={(e) => setFormData({...formData, date_supervisor: e.target.value})}
                                    placeholder="YYYY-MM-DD"
                                    aria-label="Date Signed by Supervisor" // FIX: Accessibility Label
                                />
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* ACTION BUTTONS (Hidden on Print) */}
            <div className="flex gap-4 print:hidden">
                <Button onClick={addItem} variant="outline" className="gap-2 border-zinc-300 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 text-indigo-600 hover:text-indigo-700">
                    <Plus className="w-4 h-4" /> Add Row
                </Button>
                <Button onClick={() => window.print()} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200">
                    <Printer className="w-4 h-4" /> Print Form
                </Button>
            </div>

            {/* PRINT STYLES */}
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
                    .shadow-xl, .dark .shadow-xl { box-shadow: none !important; border: 1px solid black !important; }
                    input, textarea {
                        border: none !important;
                        outline: none !important;
                        padding: 0 !important;
                        color: black !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        text-align: inherit !important;
                        min-height: auto !important;
                        height: auto !important;
                    }
                    .bg-zinc-50, .dark .bg-zinc-800 { background: #f0f0f0 !important; }
                    .bg-zinc-100, .bg-indigo-50, .dark .bg-zinc-700 { background: #e0e0e0 !important; }
                    .border-zinc-300, .border-zinc-700, .border-zinc-200, .divide-zinc-200, .divide-zinc-700, .divide-x, .divide-y {
                        border-color: black !important;
                        border-width: 1px !important;
                    }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}