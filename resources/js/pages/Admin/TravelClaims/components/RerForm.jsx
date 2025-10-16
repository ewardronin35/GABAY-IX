import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle } from 'lucide-react';
import { toWords } from 'number-to-words'; // The library we just installed

// The new component for the single receipt form from your image
const SingleReceipt = ({ data, onChange, onRemove, user }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newData = { ...data, [name]: value };

        // Automatically convert number figures to words
        if (name === 'amount_figures') {
            const num = parseFloat(value) || 0;
            const words = toWords(num);
            // Capitalize first letter of each word
            const capitalizedWords = words.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newData.amount_words = num > 0 ? `${capitalizedWords} Pesos Only` : '';
        }
        onChange(newData);
    };

    return (
        <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-lg bg-white dark:bg-slate-950 shadow-md relative">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove Receipt</span>
                </Button>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-4 text-slate-900 dark:text-slate-50">
                REIMBURSEMENT EXPENSE RECEIPT
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <p><span className="font-semibold">Entity Name:</span> CHED RO-IX</p>
                <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
                <p><span className="font-semibold">Fund Cluster:</span> __________</p>
                <p><span className="font-semibold">RER No.:</span> __________</p>
            </div>
            
            <div className="border-y border-slate-300 dark:border-slate-700 py-2">
                <div className="flex items-center gap-4">
                    <Label className="w-32">RECEIVED from</Label>
                    <Input name="received_from" value={data.received_from} onChange={handleChange} className="flex-1" />
                </div>
            </div>

            <div className="border-b border-slate-300 dark:border-slate-700 py-2 grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1">
                    <Input placeholder="(Official Designation)" name="official_designation" value={data.official_designation} onChange={handleChange} />
                    <p className="text-xs text-center text-slate-500">Official Designation</p>
                </div>
                <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-4">
                        <Label className="w-8">of</Label>
                        <Input placeholder="(In Words)" name="amount_words" value={data.amount_words} onChange={handleChange} readOnly className="flex-1 bg-slate-100 dark:bg-slate-800" />
                        <Input placeholder="(P 0.00)" name="amount_figures" type="number" value={data.amount_figures} onChange={handleChange} className="w-32 text-right" />
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="w-8"></span>
                        <p className="text-xs text-center flex-1 text-slate-500">In Words</p>
                        <p className="text-xs text-center w-32 text-slate-500">In Figures</p>
                    </div>
                </div>
            </div>

             <div className="border-b border-slate-300 dark:border-slate-700 py-2 space-y-1">
                <div className="flex items-center gap-4">
                    <Label className="w-32">in payment for</Label>
                    <Input name="payment_for" value={data.payment_for} onChange={handleChange} className="flex-1" />
                </div>
                <p className="text-xs text-center text-slate-500">Payments for subsistence, services, rental or transportation...</p>
            </div>

            <div className="border-b border-slate-300 dark:border-slate-700 py-2 space-y-1">
                <div className="flex items-center gap-4">
                    <Label className="w-16">from</Label>
                    <Input name="from_location" value={data.from_location} onChange={handleChange} className="flex-1" />
                    <Label className="w-8">to</Label>
                    <Input name="to_location" value={data.to_location} onChange={handleChange} className="flex-1" />
                </div>
                <p className="text-xs text-center text-slate-500">...purpose, distance, inclusive points of travel, etc.</p>
            </div>

            <div className="grid grid-cols-2 mt-8 gap-8">
                <div className="space-y-4">
                    <p className="text-center font-semibold">PAYEE</p>
                    <div className="border-t pt-2 border-slate-900 dark:border-slate-400 text-center">{data.received_from}</div>
                    <p className="text-xs text-center text-slate-500">(Name/Signature)</p>
                    <Input placeholder="Address" name="payee_address" value={data.payee_address} onChange={handleChange} />
                    <p className="text-xs text-center text-slate-500">(Address)</p>
                </div>
                <div className="space-y-4">
                    <p className="text-center font-semibold">WITNESS</p>
                    <div className="border-t pt-2 border-slate-900 dark:border-slate-400 text-center">{user?.name || "Eduard Roland P. Donor"}</div>
                    <p className="text-xs text-center text-slate-500">(Name/Signature)</p>
                    <Input placeholder="Address" name="witness_address" value={data.witness_address} onChange={handleChange} />
                     <p className="text-xs text-center text-slate-500">(Address)</p>
                </div>
            </div>
        </div>
    );
};


// This is now the main component that manages all the receipts
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
        if (receipts.length === 1) return; // Can't remove the last one
        setReceipts(prev => prev.filter(r => r.id !== id));
    };
    
    const handleReceiptChange = (index, newData) => {
        const updatedReceipts = [...receipts];
        updatedReceipts[index] = newData;
        setReceipts(updatedReceipts);
    };

    // Pass all data up to the parent component
    useEffect(() => {
        onDataChange({ receipts: receipts });
    }, [receipts, onDataChange]);

    return (
        <div className="max-w-4xl mx-auto my-4 space-y-6">
            {receipts.map((receipt, index) => (
                <SingleReceipt 
                    key={receipt.id} 
                    data={receipt} 
                    user={user}
                    onChange={(newData) => handleReceiptChange(index, newData)}
                    onRemove={() => removeReceipt(receipt.id)}
                />
            ))}
            <div className="flex justify-center">
                 <Button variant="outline" onClick={addReceipt}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Receipt
                </Button>
            </div>
        </div>
    );
};

export default RerForm;