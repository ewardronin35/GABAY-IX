import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ScrollText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type CerrItem = {
    id: number;
    date: string;
    particulars: string; // e.g., "Tricycle fare to terminal"
    amount: string;
};

type Props = {
    user?: any;
    onDataChange: (data: any) => void;
};

export function CerrForm({ user, onDataChange }: Props) {
    const [items, setItems] = useState<CerrItem[]>([
        { id: 1, date: '', particulars: '', amount: '' }
    ]);

    // Update parent component whenever local state changes
    useEffect(() => {
        const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        onDataChange({ cerrItems: items, cerrTotal: total });
    }, [items]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), date: '', particulars: '', amount: '' }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: keyof CerrItem, value: string) => {
        setItems(items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ScrollText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Certification of Expenses Not Requiring Receipts</h2>
                    <p className="text-sm text-muted-foreground">For expenses like tricycle, jeepney, or porterage fees where no receipt is issued.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm uppercase">Expenses List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead>Particulars (Purpose)</TableHead>
                                    <TableHead className="w-[150px]">Amount (Php)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Input 
                                                type="date" 
                                                value={item.date}
                                                onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                placeholder="e.g. Tricycle fare from house to terminal" 
                                                value={item.particulars}
                                                onChange={(e) => updateItem(item.id, 'particulars', e.target.value)}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                placeholder="0.00"
                                                value={item.amount}
                                                onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                                                className="h-8 text-right"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={addItem} variant="outline" size="sm" className="gap-2 border-dashed">
                            <Plus className="h-4 w-4" /> Add Expense Row
                        </Button>
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground mr-2">Total CERR:</span>
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="bg-muted/30 p-4 rounded-lg border text-sm">
                        <p className="font-medium mb-2">Certification:</p>
                        <p className="text-muted-foreground italic leading-relaxed">
                            "I hereby certify that the expenses listed above were incurred by me while on official travel and that no receipts were issued for the same."
                        </p>
                        <div className="mt-4 font-semibold">
                            {user?.name || "Employee Name"}
                        </div>
                        <div className="text-xs text-muted-foreground">Claimant</div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}