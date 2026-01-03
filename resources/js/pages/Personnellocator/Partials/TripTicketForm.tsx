import { useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { FormEventHandler, useState } from 'react';
import { route } from 'ziggy-js';
import { Loader2, Car, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TripTicketForm({ auth }: any) {
    // Visual state for the driver's trip log (not saved to DB yet)
    const [trips, setTrips] = useState(Array(7).fill({
        time_start: '', place_start: '', time_end: '', place_end: '', speedometer: ''
    }));

    const { data, setData, post, processing, errors, reset } = useForm({
        // Controller Required Fields
        driver_name: '', 
        date_of_travel: new Date().toISOString().split('T')[0],
        vehicle_plate: '',
        passengers: '',
        destination: '',
        purpose: '',
        
        // Dynamic Requesters Array
        requesters: [
            { name: auth.user?.name || '', designation: '' }
        ],
        
        // Fuel & Fluids
        gasoline_used: '',
        balance_in_tank: '',
        issued_from_stock: '',
        purchase_outside: '',
        gear_oil: '',
        motor_oil: '',
        brake_fluid: '',
        grease: '',
        distilled_water: '',
        total_distance: '',
    });

    // Handle Requester Change
    const handleRequesterChange = (index: number, field: 'name' | 'designation', value: string) => {
        // Defensive check: ensure requesters exists
        const currentRequesters = data.requesters || [];
        const newRequesters = [...currentRequesters];
        
        // Ensure the index exists
        if (!newRequesters[index]) return;

        newRequesters[index] = { ...newRequesters[index], [field]: value };
        setData('requesters', newRequesters);
    };

    // Add New Requester Row
    const addRequester = () => {
        const currentRequesters = data.requesters || [];
        setData('requesters', [...currentRequesters, { name: '', designation: '' }]);
    };

    // Remove Requester Row
    const removeRequester = (index: number) => {
        const currentRequesters = data.requesters || [];
        if (currentRequesters.length > 1) {
            const newRequesters = currentRequesters.filter((_, i) => i !== index);
            setData('requesters', newRequesters);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('trip-ticket.store'), {
            onSuccess: () => {
                reset();
                // REPLACED: alert() with toast
                toast.success("Trip Ticket Request submitted successfully", {
                    description: "Your request has been sent to the admin for approval."
                });
            },
            onError: (err) => {
                console.error("Submission Error:", err);
                toast.error("Submission Failed", {
                    description: "Please check the red highlighted fields."
                });
            }
        });
    };

    // Helper for dark mode borders
    const borderClass = "border-slate-900 dark:border-slate-400";

    return (
        <Card className="max-w-5xl mx-auto border-t-4 border-t-blue-600 shadow-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <CardContent className="p-8 print:p-0">
                <form onSubmit={submit} className="space-y-6">
                    
                    {/* --- HEADER --- */}
                    <div className={`flex flex-col md:flex-row justify-between items-center border-b-2 ${borderClass} pb-4 mb-6 gap-4`}>
                        <img src="/images/ched-logo.png" alt="CHED" className="h-16 md:h-20 w-auto" />
                        <div className="text-center">
                            <h3 className="text-xs font-serif font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Commission on Higher Education</h3>
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest">Regional Office IX</h1>
                            <div className={`mt-1 font-bold uppercase tracking-widest text-lg md:text-xl border-2 ${borderClass} py-1 px-4 inline-block rounded-sm`}>
                                Vehicle Trip Ticket
                            </div>
                        </div>
                        <img src="/images/bagong-pilipinas-logo.png" alt="Bagong Pilipinas" className="h-16 md:h-20 w-auto" />
                    </div>

                    {/* --- INSTRUCTIONS & DATE --- */}
                    <div className={`flex flex-col md:flex-row justify-between items-end gap-4 border-b ${borderClass} pb-2`}>
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                            To be accomplished by the person requesting the office vehicle
                        </span>
                        <div className="flex items-center gap-2">
                            <Label className="font-bold uppercase text-sm whitespace-nowrap">Date:</Label>
                            <Input 
                                type="date" 
                                value={data.date_of_travel} 
                                onChange={e => setData('date_of_travel', e.target.value)} 
                                className={`w-40 border-x-0 border-t-0 border-b-2 ${borderClass} rounded-none px-0 h-8 font-bold bg-transparent focus-visible:ring-0 dark:text-white`}
                            />
                        </div>
                    </div>
                    <InputError message={errors.date_of_travel} className="text-right" />

                    {/* --- DRIVER & VEHICLE ROW --- */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        {/* Driver Name */}
                        <div className="md:col-span-5">
                            <div className="flex items-end gap-2">
                                <Label className="whitespace-nowrap font-bold text-sm mb-1">Driver's Name:</Label>
                                <Input 
                                    value={data.driver_name} 
                                    onChange={e => setData('driver_name', e.target.value)}
                                    placeholder="Enter driver name"
                                    className={`w-full border-x-0 border-t-0 border-b-2 ${borderClass} rounded-none px-2 h-8 font-bold bg-transparent focus-visible:ring-0 dark:text-white`} 
                                />
                            </div>
                            <InputError message={errors.driver_name} />
                        </div>

                        {/* Vehicle Checkboxes */}
                        <div className="md:col-span-7 flex flex-wrap gap-4 items-center justify-end">
                            <span className="font-bold text-sm mr-2">Vehicle:</span>
                            {['Personal Vehicle', 'Mitsubishi Adventure', 'Toyota Innova'].map((v) => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 p-1 rounded">
                                    <Checkbox 
                                        checked={data.vehicle_plate === v} 
                                        onCheckedChange={() => setData('vehicle_plate', v)} 
                                        className={`border-slate-500 dark:border-slate-400 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100`}
                                    />
                                    <span className="text-sm font-medium uppercase">{v.replace('Mitsubishi ', '').replace('Toyota ', '')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <InputError message={errors.vehicle_plate} className="text-right" />

                    {/* --- MAIN GRID (Passengers, Dest, Purpose) --- */}
                    <div className={`grid grid-cols-4 border-2 ${borderClass} divide-x-2 divide-slate-900 dark:divide-slate-400 mt-6`}>
                        {/* Header Row */}
                        {['Authorized Passenger(s)', 'Signature', 'Destination', 'Purpose'].map((h) => (
                            <div key={h} className={`text-center text-[10px] md:text-xs font-bold uppercase py-1 bg-slate-100 dark:bg-zinc-800 border-b-2 ${borderClass} text-slate-700 dark:text-slate-300`}>
                                {h}
                            </div>
                        ))}

                        {/* Input Row */}
                        <div className="p-0">
                            <Textarea 
                                value={data.passengers}
                                onChange={e => setData('passengers', e.target.value)}
                                className="min-h-[150px] border-none focus-visible:ring-0 rounded-none resize-none p-2 text-sm bg-transparent dark:text-slate-200"
                                placeholder="List names..."
                            />
                        </div>
                        <div className="p-0 bg-slate-50/50 dark:bg-zinc-900/50">
                            {/* Signature Column - Visual Only */}
                            <div className="min-h-[150px] w-full border-none p-2"></div>
                        </div>
                        <div className="p-0">
                            <Textarea 
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                className="min-h-[150px] border-none focus-visible:ring-0 rounded-none resize-none p-2 text-sm bg-transparent dark:text-slate-200"
                                placeholder="Destination..."
                            />
                        </div>
                        <div className="p-0">
                            <Textarea 
                                value={data.purpose}
                                onChange={e => setData('purpose', e.target.value)}
                                className="min-h-[150px] border-none focus-visible:ring-0 rounded-none resize-none p-2 text-sm bg-transparent dark:text-slate-200"
                                placeholder="Purpose..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <InputError message={errors.passengers} className="col-span-1" />
                        <span className="col-span-1"></span>
                        <InputError message={errors.destination} className="col-span-1" />
                        <InputError message={errors.purpose} className="col-span-1" />
                    </div>

                    {/* ================================================================================== */}
                    {/* === REQUESTED BY SECTION (Dynamic Table) === */}
                    {/* ================================================================================== */}
                    <div className="flex flex-col md:flex-row gap-8 mt-6">
                        
                        {/* LEFT: Requested By (The Blue Circled Area) */}
                        <div className={`flex-1 flex flex-col justify-start relative p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                                    Requested by:
                                </span>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={addRequester}
                                    className="h-6 px-2 text-[10px] uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Row
                                </Button>
                            </div>

                            {/* TABLE STRUCTURE */}
                            <div className="w-full">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-2 mb-2 text-[10px] font-bold uppercase text-slate-500 text-center">
                                    <div className="col-span-6">Printed Name</div>
                                    <div className="col-span-5">Position/Designation</div>
                                    <div className="col-span-1"></div>
                                </div>

                                {/* Table Rows - ADDED DEFENSIVE CHECK HERE */}
                                <div className="space-y-3">
                                    {(data.requesters || []).map((req, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end group">
                                            {/* Name Input */}
                                            <div className="col-span-6">
                                                <Input 
                                                    value={req.name}
                                                    onChange={(e) => handleRequesterChange(index, 'name', e.target.value)}
                                                    className={`w-full border-x-0 border-t-0 border-b-2 ${borderClass} rounded-none px-0 h-7 text-sm font-bold text-center bg-transparent focus-visible:ring-0 dark:text-white`}
                                                    placeholder="Name"
                                                />
                                            </div>
                                            
                                            {/* Designation Input */}
                                            <div className="col-span-5">
                                                <Input 
                                                    value={req.designation}
                                                    onChange={(e) => handleRequesterChange(index, 'designation', e.target.value)}
                                                    className={`w-full border-x-0 border-t-0 border-b-2 ${borderClass} rounded-none px-0 h-7 text-xs font-medium text-center bg-transparent focus-visible:ring-0 dark:text-white`}
                                                    placeholder="Designation"
                                                />
                                            </div>

                                            {/* Delete Button (Only if more than 1 row) */}
                                            <div className="col-span-1 flex justify-center pb-1">
                                                {(data.requesters || []).length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeRequester(index)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Approved By (Janeny) */}
                        <div className="flex-1 flex flex-col justify-end items-center p-4 text-center">
                            {/* Hardcoded Approver Name */}
                            <div className={`font-bold uppercase text-slate-900 dark:text-white border-b-2 ${borderClass} pb-1 mb-1 px-8 w-full`}>
                                Janeny B. Domingsil
                            </div>
                            <div className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                                Officer In-Charge, Chief Administrative Officer
                            </div>
                        </div>
                    </div>
                    {/* ================================================================================== */}


                    {/* --- DRIVER TRIP LOGS --- */}
                    <div className="mt-8">
                        <div className={`bg-slate-200 dark:bg-zinc-800 text-center text-[10px] font-bold uppercase py-1 border-2 ${borderClass} border-b-0 text-slate-700 dark:text-slate-300`}>
                            To be filled only by the driver after the end of the trip
                        </div>
                        <div className={`overflow-x-auto border-2 ${borderClass}`}>
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-zinc-800 uppercase font-bold text-center text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className={`border ${borderClass} w-10 py-2`}>Trip No.</th>
                                        <th className={`border ${borderClass} w-20`}>Time</th>
                                        <th className={`border ${borderClass}`}>Place (Start)</th>
                                        <th className={`border ${borderClass} w-20`}>Time</th>
                                        <th className={`border ${borderClass}`}>Place (End)</th>
                                        <th className={`border ${borderClass} w-32`}>Speedometer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.map((trip, index) => (
                                        <tr key={index}>
                                            <td className={`border ${borderClass} text-center font-bold h-8`}>{index + 1}</td>
                                            {['time_start', 'place_start', 'time_end', 'place_end', 'speedometer'].map((field) => (
                                                <td key={field} className={`border ${borderClass} p-0`}>
                                                    <input className="w-full h-full border-none px-2 bg-transparent focus:ring-0 dark:text-white" disabled />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- FUEL & CERTIFICATION --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 text-xs">
                        {/* Left: Fuel Inputs */}
                        <div className="space-y-1">
                            {[
                                { label: 'GASOLINE USED', key: 'gasoline_used', unit: 'liters' },
                                { label: 'BALANCE IN TANK', key: 'balance_in_tank', unit: 'liters' },
                                { label: 'ISSUED FROM STOCK', key: 'issued_from_stock', unit: 'liters' },
                                { label: 'PURCHASE OUTSIDE', key: 'purchase_outside', unit: 'liters' },
                                { label: 'GEAR OIL PUT IN', key: 'gear_oil', unit: 'liters' },
                                { label: 'MOTOR OIL PUT IN', key: 'motor_oil', unit: 'liters' },
                                { label: 'BRAKE FLUID PUT IN', key: 'brake_fluid', unit: 'liters' },
                                { label: 'GREASE ISSUED', key: 'grease', unit: 'liters' },
                                { label: 'DISTILLED WATER', key: 'distilled_water', unit: 'btl.' },
                                { label: 'TOTAL DISTANCE', key: 'total_distance', unit: 'km.' },
                            ].map((item: any) => (
                                <div key={item.key} className="flex items-center gap-2">
                                    <span className="w-40 font-bold text-slate-700 dark:text-slate-400 uppercase truncate">{item.label}</span>
                                    <div className={`flex-1 flex items-center border-b ${borderClass}`}>
                                        <input 
                                            className="w-full border-none h-5 text-right p-0 focus:ring-0 bg-transparent font-mono dark:text-white" 
                                            //@ts-ignore
                                            value={data[item.key]} 
                                            onChange={e => setData(item.key, e.target.value)}
                                        />
                                        <span className="ml-2 text-slate-500 w-8">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: Driver Certification */}
                        <div className="flex flex-col justify-end text-center pb-4">
                            <p className="font-bold uppercase text-slate-700 dark:text-slate-300 mb-8 px-4 leading-tight">
                                I hereby certify that the vehicle was used on official business as stated above.
                            </p>
                            
                            <div className={`mx-auto w-64 border-b ${borderClass} mb-1`}>
                                <div className="h-12"></div> {/* Space for signature */}
                            </div>
                            <div className="font-bold uppercase text-xs text-slate-600 dark:text-slate-400">Driver's Signature</div>

                            <div className="mt-6 flex justify-center items-end gap-2 text-xs font-bold w-fit mx-auto">
                                <span className="mb-1 text-slate-600 dark:text-slate-400">Date:</span>
                                <div className={`border-b ${borderClass} w-32 text-center pb-1 dark:text-white`}>
                                    {data.date_of_travel}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- ACTIONS --- */}
                    <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-zinc-800 gap-3">
                        <Button type="button" variant="outline" onClick={() => window.print()} className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                            <Printer className="h-4 w-4 mr-2" /> Print Ticket
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Car className="h-4 w-4 mr-2"/>}
                            Submit Request
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}