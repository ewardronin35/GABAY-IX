// components/ItineraryForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { OfficialHeader } from './OfficialHeader'; // Make sure path is correct
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, MapPin, Calendar, Clock, Bus, Wallet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InputError from '@/components/InputError'; 

// Types
type ItineraryRow = {
    date: string;
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
};

const ItineraryForm = ({ onDataChange, errors = {} }: ItineraryFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        official_station: 'CHEDRO-IX, Z.C.',
        fund_cluster: '',
        itinerary_no: '',
        date_of_travel: '',
        purpose: ''
    });

    const [rows, setRows] = useState<ItineraryRow[]>([
        { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: '', per_diem: '', others: '' }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRowChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const list = [...rows];
        list[index] = { ...list[index], [name]: value };
        setRows(list);
    };

    const addRow = () => {
        setRows([...rows, { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: '', per_diem: '', others: '' }]);
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) return;
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    const calculateTotal = (key: string) => {
        return rows.reduce((total, row: any) => total + parseFloat(String(row[key] || 0)), 0).toFixed(2);
    };

    useEffect(() => {
        const fullPayload = {
            ...formData,
            items: rows.map(row => ({
                ...row,
                fare: parseFloat(String(row.fare || 0)),
                per_diem: parseFloat(String(row.per_diem || 0)),
                others: parseFloat(String(row.others || 0)),
            })),
            total_fare: calculateTotal('fare'),
            total_per_diem: calculateTotal('per_diem'),
            total_others: calculateTotal('others'),
            grand_total: (
                parseFloat(calculateTotal('fare')) +
                parseFloat(calculateTotal('per_diem')) +
                parseFloat(calculateTotal('others'))
            ).toFixed(2),
        };
        onDataChange(fullPayload);
    }, [formData, rows]);

    return (
        <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardContent className="p-0 sm:pt-6">
                <div className="p-4 sm:p-8 border-0 sm:border rounded-md bg-background text-foreground">
                    <OfficialHeader />

                    <div className="text-center my-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider">Itinerary of Travel</h2>
                    </div>

                    {/* --- Responsive Form Inputs --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-t border-b py-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900" />
                                <InputError message={errors['itinerary.name']} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" name="position" value={formData.position} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900" />
                                <InputError message={errors['itinerary.position']} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="official_station">Official Station</Label>
                                <Input id="official_station" name="official_station" value={formData.official_station} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900" />
                                <InputError message={errors['itinerary.official_station']} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_of_travel">Date of Travel</Label>
                                <Input id="date_of_travel" name="date_of_travel" placeholder="e.g., Oct 16-19, 2025" value={formData.date_of_travel} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900" />
                                <InputError message={errors['itinerary.date_of_travel']} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Travel</Label>
                                <Textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleInputChange} rows={5} className="bg-slate-50 dark:bg-slate-900" />
                                <InputError message={errors['itinerary.purpose']} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Daily Itinerary</h3>
                            <Button onClick={addRow} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                <PlusCircle className="h-4 w-4" /> <span className="hidden sm:inline">Add Day</span>
                            </Button>
                        </div>

                        {/* --- MOBILE VIEW: Cards --- */}
                        <div className="block md:hidden space-y-4">
                            {rows.map((row, index) => (
                                <Card key={index} className="relative border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                                        onClick={() => removeRow(index)}
                                        disabled={rows.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</Label>
                                                <Input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Place</Label>
                                                <Input name="place" value={row.place} onChange={e => handleRowChange(index, e)} className="h-8" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Departure</Label>
                                                <Input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} className="h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Arrival</Label>
                                                <Input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} className="h-8" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Bus className="w-3 h-3" /> Transport</Label>
                                            <Input name="transport_means" placeholder="e.g. Bus/Plane" value={row.transport_means} onChange={e => handleRowChange(index, e)} className="h-8" />
                                        </div>

                                        <Separator className="my-2" />
                                        
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Fare</Label>
                                                <Input type="number" name="fare" placeholder="0.00" value={row.fare} onChange={e => handleRowChange(index, e)} className="h-8 text-right" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Per Diem</Label>
                                                <Input type="number" name="per_diem" placeholder="0.00" value={row.per_diem} onChange={e => handleRowChange(index, e)} className="h-8 text-right" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Others</Label>
                                                <Input type="number" name="others" placeholder="0.00" value={row.others} onChange={e => handleRowChange(index, e)} className="h-8 text-right" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* --- DESKTOP VIEW: Table --- */}
                        <div className="hidden md:block rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[130px]">Date</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead className="w-[100px]">Dep</TableHead>
                                        <TableHead className="w-[100px]">Arr</TableHead>
                                        <TableHead>Transport</TableHead>
                                        <TableHead className="w-[100px]">Fare</TableHead>
                                        <TableHead className="w-[100px]">Per Diem</TableHead>
                                        <TableHead className="w-[100px]">Others</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} className="h-9 px-2" /></TableCell>
                                            <TableCell><Input name="place" value={row.place} onChange={e => handleRowChange(index, e)} className="h-9 px-2" /></TableCell>
                                            <TableCell><Input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} className="h-9 px-2" /></TableCell>
                                            <TableCell><Input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} className="h-9 px-2" /></TableCell>
                                            <TableCell><Input name="transport_means" value={row.transport_means} onChange={e => handleRowChange(index, e)} className="h-9 px-2" /></TableCell>
                                            <TableCell><Input type="number" name="fare" value={row.fare} onChange={e => handleRowChange(index, e)} className="h-9 px-2 text-right" /></TableCell>
                                            <TableCell><Input type="number" name="per_diem" value={row.per_diem} onChange={e => handleRowChange(index, e)} className="h-9 px-2 text-right" /></TableCell>
                                            <TableCell><Input type="number" name="others" value={row.others} onChange={e => handleRowChange(index, e)} className="h-9 px-2 text-right" /></TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeRow(index)} disabled={rows.length === 1} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <InputError message={errors['itinerary.items']} className="mt-2"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export { ItineraryForm };