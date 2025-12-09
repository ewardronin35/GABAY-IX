import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, FileText, DollarSign, Send, Calculator } from "lucide-react";
import { toast } from 'sonner';
import { route } from 'ziggy-js';

export default function CreateTravelOrder({ auth }: any) {
    const { data, setData, post, processing, errors } = useForm({
        destination: '',
        date_from: '',
        date_to: '',
        purpose: '',
        fund_source_id: '', // Links to SAA
        
        // Budget Estimates (From your Excel)
        est_airfare: '',
        est_registration: '',
        est_per_diem: '', // Travel Allowance
        est_terminal: '',
        total_estimated: 0,
    });

    // Auto-calculate Total
    useEffect(() => {
        const total = (parseFloat(data.est_airfare) || 0) + 
                      (parseFloat(data.est_registration) || 0) + 
                      (parseFloat(data.est_per_diem) || 0) + 
                      (parseFloat(data.est_terminal) || 0);
        setData('total_estimated', total);
    }, [data.est_airfare, data.est_registration, data.est_per_diem, data.est_terminal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('superadmin.travel-orders.store'), {
            onSuccess: () => toast.success("Travel Request Submitted! Sent to RD for approval."),
            onError: () => toast.error("Please check the form for errors.")
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="Request Authority to Travel">
            <div className="max-w-4xl mx-auto py-8 px-4">
                
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Request Authority to Travel</h1>
                    <p className="text-muted-foreground">Submit your travel plan. Once approved by the RD, your Travel Order will be generated automatically.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- 1. TRAVEL DETAILS --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4 text-indigo-500" /> Travel Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Destination</Label>
                                <Input 
                                    placeholder="e.g. Ilocandia Cultural Center, City of Batac, Ilocos Norte" 
                                    value={data.destination}
                                    onChange={e => setData('destination', e.target.value)}
                                />
                                {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Inclusive Dates</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative w-full">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="date" className="pl-8" onChange={e => setData('date_from', e.target.value)} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <div className="relative w-full">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="date" className="pl-8" onChange={e => setData('date_to', e.target.value)} />
                                    </div>
                                </div>
                                {errors.date_from && <p className="text-xs text-red-500">{errors.date_from}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Source of Funds (SAA)</Label>
                                <Select onValueChange={val => setData('fund_source_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Project / SAA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">SAA-2025-01 (Regular)</SelectItem>
                                        <SelectItem value="2">SAA-2025-02 (Monitoring)</SelectItem>
                                        {/* Dynamic list from backend will go here */}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Purpose of Travel</Label>
                                <Textarea 
                                    placeholder="e.g. To attend the celebration of the 52nd Founding Anniversary..." 
                                    className="min-h-[100px]"
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">This text will appear on your Travel Order.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- 2. ESTIMATED EXPENSES (Budget) --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4 text-green-600" /> Estimated Expenses
                            </CardTitle>
                            <CardDescription>Breakdown for budget approval.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Airfare / Insurance</Label>
                                    <Input type="number" placeholder="0.00" value={data.est_airfare} onChange={e => setData('est_airfare', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Registration Fee</Label>
                                    <Input type="number" placeholder="0.00" value={data.est_registration} onChange={e => setData('est_registration', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Travel Allowance</Label>
                                    <Input type="number" placeholder="0.00" value={data.est_per_diem} onChange={e => setData('est_per_diem', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Terminal/Misc</Label>
                                    <Input type="number" placeholder="0.00" value={data.est_terminal} onChange={e => setData('est_terminal', e.target.value)} />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center pt-2 bg-muted/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calculator className="h-4 w-4" />
                                    <span className="font-semibold text-sm">Total Estimated Amount</span>
                                </div>
                                <span className="text-xl font-bold text-green-600">
                                    ₱{data.total_estimated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="ghost" type="button" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                            {processing ? 'Submitting...' : (
                                <><Send className="mr-2 h-4 w-4" /> Submit Request</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}