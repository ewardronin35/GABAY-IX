import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { OfficialHeader } from './OfficialHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InputError from '@/components/InputError'; // Adjust path if necessary

// Define the type for a single row in the itinerary table
type ItineraryRow = {
    date: string;
    place: string;
    departure_time: string;
    arrival_time: string;
    transport_means: string;
    fare: number | string; // Allow string temporarily for input
    per_diem: number | string;
    others: number | string;
};

// Define the props for the component
type ItineraryFormProps = {
    onDataChange: (data: any) => void;
    errors?: any; // Keep errors flexible for now
};

// Accept the props with the defined type
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

    const [rows, setRows] = useState<ItineraryRow[]>([ // Specify the state holds an array of ItineraryRow
        { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: 0, per_diem: 0, others: 0 }
    ]);

    // Types are now correctly applied from the event parameter
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRowChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const list = [...rows];
        // Ensure type correctness when updating number fields, allow empty string
        const isNumericField = ['fare', 'per_diem', 'others'].includes(name);
        list[index] = {
            ...list[index],
            [name]: isNumericField ? (value === '' ? '' : value) : value // Keep as string for input
        };
        setRows(list);
    };

    const addRow = () => {
        setRows([...rows, { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: '', per_diem: '', others: '' }]); // Initialize numbers as empty strings
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) return; // Prevent removing the last row
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    // calculateTotal can benefit from explicit typing
    const calculateTotal = (key: keyof Omit<ItineraryRow, 'date' | 'place' | 'departure_time' | 'arrival_time' | 'transport_means'>) => {
        // Ensure values are numbers before summing, treat empty string as 0
        return rows.reduce((total, row) => total + parseFloat(String(row[key] || 0)), 0).toFixed(2);
    };

    // useEffect hook remains the same logic, but ensures numbers are parsed correctly before sending
    useEffect(() => {
        const fullPayload = {
            ...formData,
            items: rows.map(row => ({ // Ensure numeric fields are numbers for the payload
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
    }, [formData, rows, onDataChange]);
  
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="p-8 border rounded-md bg-background text-foreground">
                    <OfficialHeader />

                    <div className="text-center my-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider">Itinerary of Travel</h2>
                    </div>

                    {/* Form fields with error display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm border-t border-b py-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                                <InputError message={errors['itinerary.name']} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" name="position" value={formData.position} onChange={handleInputChange} />
                                <InputError message={errors['itinerary.position']} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="official_station">Official Station</Label>
                                <Input id="official_station" name="official_station" value={formData.official_station} onChange={handleInputChange} />
                                <InputError message={errors['itinerary.official_station']} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="date_of_travel">Date of Travel</Label>
                                <Input id="date_of_travel" name="date_of_travel" placeholder="e.g., October 16-19, 2025" value={formData.date_of_travel} onChange={handleInputChange} />
                                <InputError message={errors['itinerary.date_of_travel']} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="purpose">Purpose of Travel</Label>
                                <Textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleInputChange} rows={5} />
                                <InputError message={errors['itinerary.purpose']} />
                            </div>
                        </div>
                    </div>

                    {/* Table section with error display */}
                    <div className="mt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Departure</TableHead>
                                    <TableHead>Arrival</TableHead>
                                    <TableHead>Transport</TableHead>
                                    <TableHead>Fare</TableHead>
                                    <TableHead>Per Diem</TableHead>
                                    <TableHead>Others</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} />
                                            <InputError message={errors[`itinerary.items.${index}.date`]} />
                                        </TableCell>
                                        <TableCell>
                                            <Input name="place" value={row.place} onChange={e => handleRowChange(index, e)} />
                                             <InputError message={errors[`itinerary.items.${index}.place`]} />
                                        </TableCell>
                                        <TableCell><Input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell>
                                            <Input name="transport_means" value={row.transport_means} onChange={e => handleRowChange(index, e)} />
                                            <InputError message={errors[`itinerary.items.${index}.transport_means`]} />
                                        </TableCell>
                                        <TableCell>
                                            {/* Keep type="number" but handle value as string/number */}
                                            <Input type="number" name="fare" value={row.fare} onChange={e => handleRowChange(index, e)} step="0.01" min="0"/>
                                            <InputError message={errors[`itinerary.items.${index}.fare`]} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" name="per_diem" value={row.per_diem} onChange={e => handleRowChange(index, e)} step="0.01" min="0"/>
                                            <InputError message={errors[`itinerary.items.${index}.per_diem`]} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" name="others" value={row.others} onChange={e => handleRowChange(index, e)} step="0.01" min="0"/>
                                            <InputError message={errors[`itinerary.items.${index}.others`]} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="destructive" size="sm" onClick={() => removeRow(index)} disabled={rows.length === 1}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button variant="outline" size="sm" onClick={addRow} className="mt-4">
                            Add Day / Row
                        </Button>
                         <InputError message={errors['itinerary.items']} className="mt-2"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
// Use named export
export { ItineraryForm };

