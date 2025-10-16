import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
const ItineraryForm = ({ onDataChange }) => {    const [formData, setFormData] = useState({
        name: '',
        position: '',
        official_station: 'CHEDRO-IX, Z.C.',
        fund_cluster: '',
        itinerary_no: '',
        date_of_travel: '',
        purpose: ''
    });

    const [rows, setRows] = useState([
        { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: 0, per_diem: 0, others: 0 }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const list = [...rows];
        list[index][name] = value;
        setRows(list);
    };

    const addRow = () => {
        setRows([...rows, { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: 0, per_diem: 0, others: 0 }]);
    };

    const removeRow = (index) => {
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    const calculateTotal = (key) => {
        return rows.reduce((total, row) => total + parseFloat(row[key] || 0), 0).toFixed(2);
    };

     React.useEffect(() => {
        const fullPayload = {
            ...formData,
            items: rows,
            // ... calculations
        };
        onDataChange(fullPayload);
    }, [formData, rows, onDataChange]);
  


  return (
        // 👇 2. Wrap the entire form in a Card component
        <Card>
            <CardContent className="pt-6">
                
                {/* This is the area that will look like a document */}
                <div className="p-8 border rounded-md bg-background text-foreground">
                    
                    {/* 👇 3. Add the Official Header at the top */}
                    <OfficialHeader />

                    <div className="text-center my-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider">Itinerary of Travel</h2>
                    </div>

                    {/* 👇 4. Organize fields into a clean grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm border-t border-b py-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" name="position" value={formData.position} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="official_station">Official Station</Label>
                                <Input id="official_station" name="official_station" value={formData.official_station} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="date_of_travel">Date of Travel</Label>
                                <Input id="date_of_travel" name="date_of_travel" placeholder="e.g., October 16-19, 2025" value={formData.date_of_travel} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="purpose">Purpose of Travel</Label>
                                <Textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleInputChange} rows={5} />
                            </div>
                        </div>
                    </div>

                    {/* 👇 5. Style the dynamic table for a cleaner look */}
                    <div className="mt-6">
                        {/* 👇 2. Replace the <table> with <Table> and use the new components */}
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
                                        <TableCell><Input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input name="place" value={row.place} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input name="transport_means" value={row.transport_means} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="number" name="fare" value={row.fare} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="number" name="per_diem" value={row.per_diem} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell><Input type="number" name="others" value={row.others} onChange={e => handleRowChange(index, e)} /></TableCell>
                                        <TableCell className="text-center"><Button variant="destructive" size="sm" onClick={() => removeRow(index)}>Remove</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button variant="outline" size="sm" onClick={addRow} className="mt-4">
                            Add Day / Row
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
export default ItineraryForm;
