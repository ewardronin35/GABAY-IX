import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {route} from 'ziggy-js';
// --- Define Types ---
interface Hei {
    id: number;
    hei_name: string;
}

interface Scholar {
    id: number;
    family_name: string;
    given_name: string;
    middle_name: string;
}

interface AcademicRecord {
    id: number;
    scholar: Scholar;
    year_level: string;
    validation_status: string;
}

// This is a nested object: { "Batch Name": { "Course Name": [Record1, Record2] } }
type GroupedData = Record<string, Record<string, AcademicRecord[]>>;

interface ShowHeiProps extends PageProps {
    hei: Hei;
    groupedData: GroupedData;
    batches: string[];
    filters: {
        batch?: string;
    };
}

export default function ShowHei({ auth, hei, groupedData, batches, filters }: ShowHeiProps) {
    const dataEntries = Object.entries(groupedData);

    const handleBatchFilter = (batch: string) => {
        router.get(
            route('superadmin.tdp.hei.show', { hei: hei.id }),
            { batch: batch === 'all' ? undefined : batch },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user as User}
            page_title={`HEI Profile: ${hei.hei_name}`}
        >
            <Head title={hei.hei_name} />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between">
                    <Link href={route('superadmin.tdp.index')} className="text-sm text-primary hover:underline">
                        &larr; Back to TDP Module
                    </Link>

                    {/* Batch Filter Select */}
                    <div className="w-64">
                        <Select onValueChange={handleBatchFilter} defaultValue={filters.batch || 'all'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by batch..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Batches</SelectItem>
                                {batches.map((batch) => (
                                    <SelectItem key={batch} value={batch}>
                                        {batch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{hei.hei_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dataEntries.length > 0 ? (
                            <Accordion type="multiple" className="w-full">
                                {/* Level 1: Batch */}
                                {dataEntries.map(([batch, courses]) => (
                                    <AccordionItem key={batch} value={batch}>
                                        <AccordionTrigger className="text-xl font-semibold">
                                            Batch: {batch}
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-4">
                                            <Accordion type="multiple" className="w-full">
                                                {/* Level 2: Course */}
                                                {Object.entries(courses).map(([courseName, scholars]) => (
                                                    <AccordionItem key={courseName} value={courseName}>
                                                        <AccordionTrigger className="text-lg">
                                                            {courseName} ({scholars.length} scholars)
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pl-4">
                                                            {/* Level 3: Students Table */}
                                                            <StudentsTable scholars={scholars} />
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="p-8 text-center text-muted-foreground">
                                No scholars found for this HEI{filters.batch ? ` in batch ${filters.batch}` : ''}.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

// --- Students Table Component ---
function StudentsTable({ scholars }: { scholars: AcademicRecord[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scholars.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                {[record.scholar.given_name, record.scholar.family_name].filter(Boolean).join(' ')}
                            </TableCell>
                            <TableCell>{record.year_level}</TableCell>
                            <TableCell>{record.validation_status}</TableCell>
                            <TableCell className="text-right">
                                {/* You can link to your scholar profile page here! */}
                                <Link href={route('superadmin.tdp.scholar.show', { scholar: record.scholar.id })}>
                                    <Button variant="outline" size="xs">
                                        View Profile
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}