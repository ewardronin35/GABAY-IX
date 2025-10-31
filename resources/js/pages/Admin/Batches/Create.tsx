import AppLayout from "@/layouts/app-layout";
import { PageProps, Scholar } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormEventHandler, useState } from "react";
import InputError from "@/components/input-error";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type Period = {
    id: number;
    name: string;
};

// This component uses your existing Scholar type from /types/index.d.ts
export default function Create({
    auth,
    scholars,
    academicPeriods,
}: PageProps<{ scholars: Scholar[]; academicPeriods: Period[] }>) {
    const [selectedScholarIds, setSelectedScholarIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        global_academic_period_id: "",
        batch_type: "PAYROLL",
        program_type: "TES",
        total_amount: 0,
        scholar_ids: [] as number[],
    });

    const toggleScholar = (scholarId: number) => {
        setSelectedScholarIds((prev) => {
            const newIds = prev.includes(scholarId)
                ? prev.filter((id) => id !== scholarId)
                : [...prev, scholarId];
            
            // Update the form data
            setData("scholar_ids", newIds);
            return newIds;
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("admin.batches.store"));
    };

    const filteredScholars = scholars.filter(scholar => 
        data.batch_type === 'PAYROLL' 
            ? scholar.scholar_status === 'Active' 
            : scholar.scholar_status === 'Approved for Award'
    );

    return (
        <AppLayout user={auth.user}>
            <Head title="Create New Batch" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Batch</CardTitle>
                            <CardDescription>
                                Select parameters and scholars to include in this
                                batch for approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Batch Details Form */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="period">
                                            Academic Period
                                        </Label>
                                        <Select
                                            onValueChange={(value) =>
                                                setData(
                                                    "global_academic_period_id",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a period..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicPeriods.map((period) => (
                                                    <SelectItem
                                                        key={period.id}
                                                        value={String(period.id)}
                                                    >
                                                        {period.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.global_academic_period_id} />
                                    </div>
                                    <div>
                                        <Label htmlFor="batch_type">
                                            Batch Type
                                        </Label>
                                        <Select
                                            defaultValue="PAYROLL"
                                            onValueChange={(value) =>
                                                setData("batch_type", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PAYROLL">
                                                    Payroll
                                                </SelectItem>
                                                <SelectItem value="NOA">
                                                    Notice of Award (NOA)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {data.batch_type === 'PAYROLL' && (
                                        <div>
                                            <Label htmlFor="total_amount">Total Amount (PHP)</Label>
                                            <Input 
                                                id="total_amount"
                                                type="number"
                                                value={data.total_amount}
                                                onChange={e => setData('total_amount', parseFloat(e.target.value))}
                                            />
                                            <InputError message={errors.total_amount} />
                                        </div>
                                    )}
                                </div>

                                {/* Scholar Selection Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Select Scholars</CardTitle>
                                        <CardDescription>
                                            Showing scholars eligible for: <strong>{data.batch_type}</strong>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-96 overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Select</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Program</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredScholars.map((scholar) => (
                                                        <TableRow key={scholar.id}>
                                                            <TableCell>
                                                                <Checkbox 
                                                                    checked={selectedScholarIds.includes(scholar.id)}
                                                                    onCheckedChange={() => toggleScholar(scholar.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {scholar.last_name},{" "}
                                                                {scholar.first_name}
                                                            </TableCell>
                                                            <TableCell>{scholar.program}</TableCell>
                                                            <TableCell>{scholar.scholar_status}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <InputError message={errors.scholar_ids} />
                                    </CardContent>
                                </Card>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Submitting..." : "Submit to Chief"}
                                    </Button>
                                    <Link
                                        href={route("admin.batches.dashboard")}
                                        className="text-sm text-gray-600 hover:underline"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}