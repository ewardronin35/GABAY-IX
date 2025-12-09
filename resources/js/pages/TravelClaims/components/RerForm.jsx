// components/RerForm.jsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, Paperclip } from 'lucide-react';
import { toWords } from 'number-to-words'; 

const SingleReceipt = ({ data, onChange, onRemove, user }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newData = { ...data, [name]: value };

        if (name === 'amount_figures') {
            const num = parseFloat(value) || 0;
            const words = toWords(num);
            const capitalizedWords = words.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newData.amount_words = num > 0 ? `${capitalizedWords} Pesos Only` : '';
        }
        onChange(newData);
    };

    return (
        <div className="border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-950 shadow-sm relative transition-all">
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Receipt</span>
                </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    Expense Receipt
                </h3>
            </div>
            
            {/* Header Stats - Grid adjusts from 1 col to 2 cols to 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                <p><span className="font-semibold block text-xs text-muted-foreground uppercase">Entity Name</span> CHED RO-IX</p>
                <p><span className="font-semibold block text-xs text-muted-foreground uppercase">Date</span> {new Date().toLocaleDateString()}</p>
                <p><span className="font-semibold block text-xs text-muted-foreground uppercase">Fund Cluster</span> <span className="border-b border-dotted border-gray-400 px-2 inline-block w-full"></span></p>
                <p><span className="font-semibold block text-xs text-muted-foreground uppercase">RER No.</span> <span className="border-b border-dotted border-gray-400 px-2 inline-block w-full"></span></p>
            </div>
            
            <div className="space-y-4">
                {/* Responsive Row: Received From */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-dashed pb-4">
                    <Label className="w-full sm:w-32 shrink-0">RECEIVED from</Label>
                    <Input name="received_from" value={data.received_from} onChange={handleChange} className="flex-1" placeholder="Name of Payer" />
                </div>

                {/* Responsive Row: Designation & Amount */}
                <div className="flex flex-col md:flex-row gap-4 border-b border-dashed pb-4">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Official Designation</Label>
                        <Input placeholder="(Official Designation)" name="official_designation" value={data.official_designation} onChange={handleChange} />
                    </div>
                    
                    <div className="flex-[2] space-y-1">
                         <Label className="text-xs text-muted-foreground">Amount</Label>
                         <div className="flex flex-col sm:flex-row gap-2">
                             <div className="flex-1">
                                <Input placeholder="(In Words)" name="amount_words" value={data.amount_words} onChange={handleChange} readOnly className="bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm" />
                             </div>
                             <div className="w-full sm:w-32">
                                <Input placeholder="P 0.00" name="amount_figures" type="number" value={data.amount_figures} onChange={handleChange} className="text-right" />
                             </div>
                         </div>
                    </div>
                </div>

                 {/* Payment For */}
                 <div className="space-y-1 border-b border-dashed pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label className="w-full sm:w-32 shrink-0">Payment for</Label>
                        <Input name="payment_for" value={data.payment_for} onChange={handleChange} className="flex-1" placeholder="subsistence, services, rental..." />
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-1 border-b border-dashed pb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                            <Label className="w-16 shrink-0">From</Label>
                            <Input name="from_location" value={data.from_location} onChange={handleChange} className="flex-1" />
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                            <Label className="w-8 shrink-0">To</Label>
                            <Input name="to_location" value={data.to_location} onChange={handleChange} className="flex-1" />
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-8">
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-center font-bold text-xs uppercase tracking-wide mb-4">Payee</p>
                        <div className="border-b border-slate-900 dark:border-slate-400 text-center pb-1 font-medium min-h-[1.5rem]">{data.received_from}</div>
                        <p className="text-xs text-center text-muted-foreground">(Name/Signature)</p>
                        <Input placeholder="Address" name="payee_address" value={data.payee_address} onChange={handleChange} className="mt-2 text-xs" />
                    </div>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-center font-bold text-xs uppercase tracking-wide mb-4">Witness</p>
                        <div className="border-b border-slate-900 dark:border-slate-400 text-center pb-1 font-medium min-h-[1.5rem]">{user?.name || "Eduard Roland P. Donor"}</div>
                        <p className="text-xs text-center text-muted-foreground">(Name/Signature)</p>
                        <Input placeholder="Address" name="witness_address" value={data.witness_address} onChange={handleChange} className="mt-2 text-xs" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const RerForm = ({ onDataChange, user }) => {
    const initialReceiptState = {
        id: 1,
        received_from: '',
        official_designation: '',
        amount_words: '',
        amount_figures: '',
        payment_for: 'Taxi Fare',
        from_location: 'NAIA TERMINAL 3',
        to_location: 'Hotel',
        payee_address: 'Manila City',
        witness_address: 'Zamboanga City'
    };
    
    const [receipts, setReceipts] = useState([initialReceiptState]);

    const addReceipt = () => {
        setReceipts(prev => [...prev, { ...initialReceiptState, id: Date.now() }]);
    };

    const removeReceipt = (id) => {
        if (receipts.length === 1) return;
        setReceipts(prev => prev.filter(r => r.id !== id));
    };
    
    const handleReceiptChange = (index, newData) => {
        const updatedReceipts = [...receipts];
        updatedReceipts[index] = newData;
        setReceipts(updatedReceipts);
    };

   useEffect(() => {
        onDataChange({ items: receipts });
    }, [receipts]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {receipts.map((receipt, index) => (
                <SingleReceipt 
                    key={receipt.id} 
                    data={receipt} 
                    user={user}
                    onChange={(newData) => handleReceiptChange(index, newData)}
                    onRemove={() => removeReceipt(receipt.id)}
                />
            ))}
            <div className="flex justify-center pb-6">
                 <Button variant="outline" onClick={addReceipt} className="shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Receipt
                </Button>
            </div>
        </div>
    );
};

export default RerForm;