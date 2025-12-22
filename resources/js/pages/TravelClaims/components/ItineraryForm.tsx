// components/ItineraryForm.tsx
import React, { useState, useEffect, useRef } from 'react'; // 1. Add useRef
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, Printer, Plane, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// NOTE: Assuming '@/components/ui/' path is correct for shadcn components

// --- TYPES ---
type ItineraryRow = {
    date: string; // YYYY-MM-DD
    place: string;
    departure_time: string;
    arrival_time: string;
    transport_means: string;
    fare: number | string;
    per_diem: number | string;
    others: number | string;
};

type ItineraryFormProps = {
    onDataChange: (data: any) => void;
    errors?: any;
    user?: any;       // <--- ADD THIS LINE
    initialData?: any; // <--- ADD THIS TOO (for the "Don't Reset" logic)
};

// --- HELPER COMPONENT: CUSTOM UNDERLINED INPUT ---
type UnderlinedInputProps = {
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    type?: 'text' | 'number' | 'date';
    center?: boolean;
    disabled?: boolean;
    'aria-label'?: string;
};

const UnderlinedInput = ({ 
    name, 
    value, 
    onChange, 
    placeholder = "", 
    className = "", 
    type = "text", 
    center = false, 
    disabled = false, 
    'aria-label': ariaLabel 
}: UnderlinedInputProps) => (
    <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || name.replace(/_/g, ' ')}
        className={`
            border-t-0 border-l-0 border-r-0 rounded-none h-8 px-0 text-sm font-bold
            focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200
            border-b-2 border-gray-400 dark:border-gray-500
            focus:border-blue-600 dark:focus:border-blue-400 
            bg-transparent print:border-b-0 print:dark:text-black
            ${center ? 'text-center' : 'text-left'} 
            ${className} 
        `}
    />
);

// CHANGE THIS LINE:
const ItineraryForm = ({ onDataChange, errors = {}, user, initialData }: ItineraryFormProps) => {


    const today = new Date().toISOString().split('T')[0];
    // --- 1. STATE INITIALIZATION (MODIFIED) ---
    const [formData, setFormData] = useState({
        entity_name: 'COMMISSION ON HIGHER EDUCATION RO-IX',
        fund_cluster: '01',
        itinerary_no: '2025-12-001',
        name: user?.name || '', 
        position: '',
        official_station: 'CHEDRO-IX, Z.C.',
        date_of_travel: 'DECEMBER 9-13, 2025', 
        purpose: 'You are hereby directed to proceed to Sulu State College (SSC), Jolo, Sulu, to accompany the undersigned and to provide assistance to the CHED Composite Team in the conduct of State Validation Visit to further assess and verify the compliance of SSC for the grant of University Status on December 9-13, 2025, inclusive of travel time.'
    });

    // MODIFIED: Rows contain only a single, blank entry (except for the starting date)
    const [rows, setRows] = useState<ItineraryRow[]>(
        initialData?.items && initialData.items.length > 0 
            ? initialData.items 
            : [{ date: today, place: '', departure_time: '', arrival_time: '', transport_means: '', fare: '', per_diem: '', others: '' }]
    );
    // --- 2. HANDLERS (Unchanged) ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRowChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const list = [...rows];
        
        const newValue = (name === 'fare' || name === 'per_diem' || name === 'others') 
                         ? (value === '' ? '' : parseFloat(value) || 0) 
                         : value;

        list[index] = { ...list[index], [name]: newValue };
        setRows(list);
    };

    const addRow = () => {
        setRows([...rows, { date: today, place: '', departure_time: '', arrival_time: '', transport_means: '', fare: '', per_diem: '', others: '' }]);
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) return;
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    const calculateTotal = (key: keyof ItineraryRow): string => {
        return rows.reduce((total, row) => total + parseFloat(String(row[key] || 0)), 0).toFixed(2);
    };

    // --- 3. SYNC & TOTALS (Unchanged) ---
    const totalFare = calculateTotal('fare');
    const totalPerDiem = calculateTotal('per_diem');
    const totalOthers = calculateTotal('others');
    const grandTotal = (
        parseFloat(totalFare) +
        parseFloat(totalPerDiem) +
        parseFloat(totalOthers)
    ).toFixed(2);
const onDataChangeRef = useRef(onDataChange);


useEffect(() => {
        onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    useEffect(() => {
        const fullPayload = {
            ...formData,
            items: rows.map(row => ({
                ...row,
                fare: parseFloat(String(row.fare || 0)),
                per_diem: parseFloat(String(row.per_diem || 0)),
                others: parseFloat(String(row.others || 0)),
            })),
            total_fare: totalFare,
            total_per_diem: totalPerDiem,
            total_others: totalOthers,
            grand_total: grandTotal,
        };
      
        if (onDataChangeRef.current) {
            onDataChangeRef.current(fullPayload);
        }

    }, [formData, rows, totalFare, totalPerDiem, totalOthers, grandTotal]);


    return (
        <div className="flex flex-col items-center gap-6 p-8 print:p-0 w-full">
            
            <div className="w-full max-w-[8.5in] p-0 relative print:shadow-none print:w-full print:border-0">
                
                {/* Print Button (Hidden in Print) */}
                <div className="flex justify-end mb-4 print:hidden">
                    <Button onClick={() => window.print()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-shadow duration-200">
                        <Printer className="w-4 h-4" /> Print Form
                    </Button>
                </div>
                
                {/* --- MAIN FORM CONTAINER (Shadcn Card) --- */}
                <Card className="shadow-2xl dark:border-zinc-700 rounded-xl overflow-hidden print:shadow-none print:border-black print:rounded-none">
                    
                    {/* Card Header for Title */}
                    <CardHeader className="p-4 border-b-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex flex-row items-center justify-center relative">
                        <Plane className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                        <CardTitle className="text-xl uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                            Itinerary of Travel
                        </CardTitle>
                        <CardDescription className="absolute top-2 right-4 text-xs italic p-1 print:text-black dark:text-gray-400">
                            Appendix 45
                        </CardDescription>
                    </CardHeader>
                    
                    {/* *** Font set to font-sans for modern digital display *** */}
                    <CardContent className="p-0 font-sans"> 
                        
                        {/* INFO GRID (ROW 1: Entity/Fund) */}
                        <div className="grid grid-cols-[3fr_2fr] border-b border-gray-300 dark:border-zinc-700">
                            <div className="p-4 border-r border-gray-300 dark:border-zinc-700 space-y-3">
                                {/* Entity Name */}
                                <div className="grid grid-cols-[110px_1fr] items-center">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Entity Name:</Label>
                                    <UnderlinedInput name="entity_name" value={formData.entity_name} onChange={handleInputChange} aria-label="Entity Name" className="uppercase" />
                                </div>
                                {/* Fund Cluster / No. */}
                                <div className="grid grid-cols-[110px_80px_60px_1fr] items-center">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fund Cluster:</Label>
                                    <UnderlinedInput name="fund_cluster" value={formData.fund_cluster} onChange={handleInputChange} aria-label="Fund Cluster" className="text-center" />
                                    <Label className="text-sm font-semibold text-right pr-2 text-gray-700 dark:text-gray-300">No.:</Label>
                                    <UnderlinedInput name="itinerary_no" value={formData.itinerary_no} onChange={handleInputChange} aria-label="Itinerary Number" className="text-center" />
                                </div>
                            </div>
                            {/* RIGHT SECTION (Travel Period) */}
                            <div className="p-4 flex items-center">
                                <div className="grid grid-cols-[110px_1fr] items-center w-full">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Travel Period:</Label>
                                    <UnderlinedInput name="date_of_travel" value={formData.date_of_travel} onChange={handleInputChange} aria-label="Date of Travel Range" className="uppercase font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* INFO GRID (ROW 2: Name/Position/Purpose) */}
                        <div className="grid grid-cols-[2fr_1fr] border-b-2 border-gray-300 dark:border-zinc-700">
                             {/* LEFT SECTION (Name/Position/Station) */}
                            <div className="p-4 border-r border-gray-300 dark:border-zinc-700 space-y-3">
                                {/* Name */}
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name:</Label>
                                    {/* Name input is now empty by default */}
                                    <UnderlinedInput name="name" value={formData.name} onChange={handleInputChange} aria-label="Traveler Name" className="uppercase" />
                                </div>
                                {/* Position */}
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Position:</Label>
                                    {/* Position input is now empty by default */}
                                    <UnderlinedInput name="position" value={formData.position} onChange={handleInputChange} aria-label="Position" />
                                </div>
                                {/* Station */}
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Station:</Label>
                                    <UnderlinedInput name="official_station" value={formData.official_station} onChange={handleInputChange} aria-label="Official Station" />
                                </div>
                            </div>
                            {/* RIGHT SECTION (Purpose) */}
                            <div className="p-4 flex flex-col">
                                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <MapPin className='w-3 h-3 mr-1'/>Purpose of Travel:
                                </Label>
                                <Textarea 
                                    name="purpose" 
                                    value={formData.purpose} 
                                    onChange={handleInputChange} 
                                    rows={8}
                                    aria-label="Purpose of Travel" 
                                    className="flex-1 p-2 text-xs h-full min-h-[140px] resize-none border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus-visible:ring-blue-500 focus-visible:ring-2 print:text-black dark:text-white"
                                />
                            </div>
                        </div>

                        {/* ITINERARY TABLE */}
                        <div className="w-full overflow-x-auto text-sm">
                            <Table className="w-full">
                                <TableHeader className="bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-100 uppercase text-xs font-semibold border-b border-gray-300 dark:border-zinc-700">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead rowSpan={2} className="w-[10%] text-center border-r border-gray-300 dark:border-zinc-700 h-10 align-middle">Date</TableHead>
                                        <TableHead rowSpan={2} className="w-[20%] border-r border-gray-300 dark:border-zinc-700 h-10 align-middle">Places to be visited (Destination)</TableHead>
                                        <TableHead colSpan={2} className="w-[15%] text-center border-r border-gray-300 dark:border-zinc-700 h-10 align-middle">Time</TableHead>
                                        <TableHead rowSpan={2} className="w-[15%] text-center border-r border-gray-300 dark:border-zinc-700 h-10 align-middle">Means of<br/>Transportation</TableHead>
                                        <TableHead colSpan={3} className="w-[30%] text-center h-10 align-middle">Total Amount (₱)</TableHead>
                                        <TableHead rowSpan={2} className="w-[5%] text-center print:hidden h-10 align-middle"></TableHead>
                                    </TableRow>
                                    <TableRow className="border-b border-gray-300 dark:border-zinc-700 hover:bg-transparent">
                                        <TableHead className="w-[7.5%] text-center border-r border-gray-300 dark:border-zinc-700 pt-0 h-8 align-middle">Departure</TableHead>
                                        <TableHead className="w-[7.5%] text-center border-r border-gray-300 dark:border-zinc-700 pt-0 h-8 align-middle">Arrival</TableHead>
                                        <TableHead className="w-[10%] text-center border-r border-gray-300 dark:border-zinc-700 pt-0 h-8 align-middle">Fare</TableHead>
                                        <TableHead className="w-[10%] text-center border-r border-gray-300 dark:border-zinc-700 pt-0 h-8 align-middle">Per Diem</TableHead>
                                        <TableHead className="w-[10%] text-center border-r border-gray-300 dark:border-zinc-700 pt-0 h-8 align-middle">Others</TableHead>
                                    </TableRow>
                                </TableHeader>
                                
                                <TableBody className="text-xs">
                                    {/* DATA ROWS */}
                                    {rows.map((row, index) => (
                                        <TableRow key={index} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                                            {/* Date */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800">
                                                <Input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} aria-label="Date of Travel" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0" />
                                            </TableCell>
                                            {/* Place */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800">
                                                <Input type="text" name="place" value={row.place} onChange={e => handleRowChange(index, e)} aria-label="Place of Destination" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0" />
                                            </TableCell>
                                            {/* Departure Time */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800 text-center">
                                                <Input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} aria-label="Departure Time" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0 text-center" />
                                            </TableCell>
                                            {/* Arrival Time */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800 text-center">
                                                <Input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} aria-label="Arrival Time" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0 text-center" />
                                            </TableCell>
                                            {/* Transport Means */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800">
                                                <Input type="text" name="transport_means" value={row.transport_means} onChange={e => handleRowChange(index, e)} aria-label="Means of Transportation" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0" />
                                            </TableCell>
                                            {/* Fare */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800 text-right">
                                                <Input type="number" name="fare" value={row.fare} onChange={e => handleRowChange(index, e)} aria-label="Total Amount: Fare" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0 text-right" />
                                            </TableCell>
                                            {/* Per Diem */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800 text-right">
                                                <Input type="number" name="per_diem" value={row.per_diem} onChange={e => handleRowChange(index, e)} aria-label="Total Amount: Per Diem" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0 text-right" />
                                            </TableCell>
                                            {/* Others */}
                                            <TableCell className="p-1 border-r border-gray-200 dark:border-zinc-800 text-right">
                                                <Input type="number" name="others" value={row.others} onChange={e => handleRowChange(index, e)} aria-label="Total Amount: Others" className="h-7 px-1 text-xs bg-transparent border-none focus-visible:ring-0 text-right" />
                                            </TableCell>
                                            {/* Action */}
                                            <TableCell className="p-1 text-center print:hidden">
                                                <Button variant="ghost" size="icon" onClick={() => removeRow(index)} disabled={rows.length === 1} className="h-6 w-6 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    
                                    {/* ADD ROW BUTTON (Hidden from Print) */}
                                    <TableRow className="border-none hover:bg-transparent print:hidden">
                                        <TableCell colSpan={9} className="p-3 text-left">
                                            <Button onClick={addRow} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 shadow-sm">
                                                <PlusCircle className="h-4 w-4" /> Add Day/Item
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    
                                    {/* TOTAL ROW 1: Grand Totals */}
                                    <TableRow className="font-bold bg-indigo-50 dark:bg-zinc-700 text-sm border-t-2 border-gray-400 dark:border-zinc-600 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-zinc-700">
                                        <TableCell colSpan={5} className="p-2 text-right uppercase border-r border-gray-400 dark:border-zinc-600">Grand Totals</TableCell>
                                        <TableCell className="p-2 text-right border-r border-gray-400 dark:border-zinc-600 font-mono">{totalFare}</TableCell>
                                        <TableCell className="p-2 text-right border-r border-gray-400 dark:border-zinc-600 font-mono">{totalPerDiem}</TableCell>
                                        <TableCell className="p-2 text-right border-r border-gray-400 dark:border-zinc-600 font-mono">{totalOthers}</TableCell>
                                        <TableCell className="p-2 text-center font-mono print:hidden"></TableCell> 
                                    </TableRow>
                                    
                                    {/* TOTAL ROW 2: Total Claimed */}
                                    <TableRow className="font-bold bg-indigo-100 dark:bg-zinc-600 text-sm border-t border-gray-400 dark:border-zinc-700 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-100 dark:hover:bg-zinc-600">
                                        <TableCell colSpan={8} className="p-2 text-right uppercase border-r border-gray-400 dark:border-zinc-700">Total Expenses Claimed</TableCell>
                                        <TableCell className="p-2 text-center font-mono">{grandTotal}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* SIGNATORIES */}
                        <div className="grid grid-cols-2 text-xs border-t-2 border-gray-400 dark:border-zinc-700">
                            <div className="p-4 border-r border-gray-400 dark:border-zinc-700">
                                <p className="mb-8 font-medium text-gray-700 dark:text-gray-300">I certify that : (1) I have reviewed the foregoing itinerary, (2) the travel is necessary to the service, (3) the period covered is reasonable and (4) the expenses claimed are proper.</p>
                                <div className="mt-16 text-center space-y-2">
                                    <UnderlinedInput 
                                        name="signature1_name"
                                        value={"JANENY B. DOMINGSIL"}
                                        onChange={() => {}}
                                        className="uppercase font-bold text-sm border-b-2"
                                        center
                                        disabled
                                        aria-label="Signature Officer"
                                    />
                                    <p className='text-gray-600 dark:text-gray-400 text-xs'>Officer in charge, Chief Administrative Officer</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-8">
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Prepared by :</p>
                                    <div className="mt-8 space-y-2">
                                        <UnderlinedInput 
                                            name="prepared_name"
                                            // This value is now determined by formData.name (which is '')
                                            value={formData.name}
                                            onChange={() => {}}
                                            className="uppercase font-bold text-sm border-b-2"
                                            center
                                            aria-label="Prepared by Name"
                                        />
                                        {/* This value is now determined by formData.position (which is '') */}
                                        <p className="font-bold text-gray-700 dark:text-gray-300 text-xs">{formData.position}</p>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Approved by:</p>
                                    <div className="mt-8 space-y-2">
                                        <UnderlinedInput 
                                            name="approved_name"
                                            value={"MARIVIC V. IRIBERRI"}
                                            onChange={() => {}}
                                            className="uppercase font-bold text-sm border-b-2"
                                            center
                                            disabled
                                            aria-label="Approved by Name"
                                        />
                                        <p className='text-gray-600 dark:text-gray-400 text-xs'>Officer In-Charge, Office of the Director IV</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- PRINT STYLES (Ensures clean paper printout) --- */}
            <style>{`
                @media print {
                    @page { margin: 0.5in; }
                    
                    /* Use a formal serif font for printing and force colors */
                    body, .dark, .dark *, .font-sans { 
                        -webkit-print-color-adjust: exact; 
                        color: black !important;
                        background: white !important;
                        font-family: 'Times New Roman', Times, serif !important;
                        text-shadow: none !important;
                        box-shadow: none !important;
                        border-color: black !important;
                        font-size: 11pt; /* Set base font size for printing */
                    }
                    
                    /* Card/Table/Header elements reset to white/light grey with black borders */
                    .shadow-2xl, .dark .shadow-2xl { box-shadow: none !important; border: 1px solid black !important; }
                    .bg-zinc-100 { background: #e5e5e5 !important; }
                    .bg-indigo-50 { background: #f0f0ff !important; }
                    .bg-indigo-100 { background: #ddeeff !important; }
                    .bg-gray-50, .dark .bg-zinc-800 { background: #f8f8f8 !important; }
                    
                    /* Input and Textarea reset (hides digital borders and rings) */
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
                    /* Re-enforce the bottom border for custom inputs that need to look like a line */
                    .border-b-2 { border-bottom: 1px solid black !important; }
                    
                    /* Hide native date/time icons */
                    input[type="date"]::-webkit-calendar-picker-indicator,
                    input[type="time"]::-webkit-calendar-picker-indicator {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export { ItineraryForm };