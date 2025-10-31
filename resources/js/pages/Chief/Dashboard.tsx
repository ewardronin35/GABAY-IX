import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import {route} from "ziggy-js";
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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormEventHandler, useState } from "react";
import InputError from "@/components/input-error";

type Batch = {
    id: number;
    batch_type: 'NOA' | 'PAYROLL';
    batch_status: string;
    program_type: string;
    remarks: string | null;
    created_at: string;
    academicPeriod: {
        name: string;
    };
    creator: {
        name: string;
    };
};

// This component handles the "Return Batch" modal
function ReturnBatchDialog({ batchId }: { batchId: number }) {
    const { data, setData, post, processing, errors } = useForm({
        remarks: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("chief.batches.return", batchId), {
            preserveScroll: true,
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Return</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Return Batch (ID: {batchId})</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for returning this batch. It will
                            be sent back to the Scholarship Admin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="remarks" className="sr-only">
                            Remarks
                        </Label>
                        <Textarea
                            id="remarks"
                            value={data.remarks}
                            onChange={(e) => setData("remarks", e.target.value)}
                            placeholder="Type your remarks here..."
                        />
                        <InputError message={errors.remarks} className="mt-2" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? "Returning..." : "Return Batch"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard({
    auth,
    pendingBatches,
}: PageProps<{ pendingBatches: Batch[] }>) {
    
    const { post, processing } = useForm({});

    const endorseBatch = (batchId: number) => {
        post(route("chief.batches.endorse", batchId), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Chief's Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Endorsement</CardTitle>
                            <CardDescription>
                                Review and endorse the following batches to send them
                                to the Regional Director.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingBatches.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No batches pending your review.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {pendingBatches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell>BATCH-{batch.id}</TableCell>
                                            <TableCell>{batch.batch_type}</TableCell>
                                            <TableCell>
                                                {batch.academicPeriod.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.creator.name}
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    onClick={() => endorseBatch(batch.id)}
                                                    disabled={processing}
                                                >
                                                    Endorse
                                                </Button>
                                                <ReturnBatchDialog batchId={batch.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}