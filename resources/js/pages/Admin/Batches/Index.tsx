import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
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

// Define the Batch type based on our controller
type Batch = {
    id: number;
    batch_type: 'NOA' | 'PAYROLL';
    batch_status: 'pending_chief' | 'pending_rd' | 'approved' | 'paid' | 'returned';
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

// Helper to format status
const getStatusVariant = (status: Batch['batch_status']) => {
    switch (status) {
        case 'pending_chief':
        case 'pending_rd':
            return 'secondary';
        case 'approved':
            return 'default';
        case 'paid':
            return 'success'; // Assuming you have a 'success' variant
        case 'returned':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function Index({ auth, batches }: PageProps<{ batches: Batch[] }>) {
    return (
        <AppLayout user={auth.user}>
            <Head title="Batch Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>Batch Management</CardTitle>
                                <CardDescription>
                                    Track and manage all NOA and Payroll batches.
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={route('admin.batches.create')}>
                                    Create New Batch
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell>BATCH-{batch.id}</TableCell>
                                            <TableCell>{batch.batch_type}</TableCell>
                                            <TableCell>
                                                {batch.academicPeriod.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(batch.batch_status)}>
                                                    {batch.batch_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {batch.creator.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.remarks}
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