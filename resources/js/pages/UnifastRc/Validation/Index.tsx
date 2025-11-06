import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState } from 'react';
import {route } from 'ziggy-js';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Loader2, Save } from 'lucide-react';

// --- Define Types ---
interface Scholar {
    id: number;
    family_name: string;
    given_name: string;
}

interface Course {
    course_name: string;
}

interface AcademicRecord {
    id: number;
    scholar: Scholar;
    course: Course;
    year_level: string;
    validation_status: string;
}

interface Hei {
    id: number;
    hei_name: string;
    tdp_academic_records: AcademicRecord[]; // Use snake_case (Laravel auto-converts)
    tes_academic_records: AcademicRecord[]; // Use snake_case (Laravel auto-converts)
}

interface StatusOption {
    value: string;
    label: string;
}

// These props come from your ValidationController
interface ValidationProps extends PageProps {
    tdpHeis: Hei[];
    tesHeis: Hei[];
    validationOptions: StatusOption[];
}

export default function ValidationIndex({ auth, tdpHeis, tesHeis, validationOptions }: ValidationProps) {
    const [isSaving, setIsSaving] = useState(false);
    
    // We store only the *changes* in state
    const [tdpChanges, setTdpChanges] = useState<Record<number, string>>({});
    const [tesChanges, setTesChanges] = useState<Record<number, string>>({});

    // Update TDP changes in state
    const handleTdpStatusChange = (id: number, newStatus: string) => {
        setTdpChanges((prev) => ({ ...prev, [id]: newStatus }));
    };

    // Update TES changes in state
    const handleTesStatusChange = (id: number, newStatus: string) => {
        setTesChanges((prev) => ({ ...prev, [id]: newStatus }));
    };

    // Get the current status for a record (either from state or from original prop)
    const getStatus = (record: AcademicRecord, type: 'tdp' | 'tes') => {
        const changes = type === 'tdp' ? tdpChanges : tesChanges;
        return changes[record.id] || record.validation_status;
    };

    // Send the changes to the backend
    const handleSubmit = () => {
        setIsSaving(true);
        
        // Convert the change objects {1: 'VALIDATED'} to arrays [{id: 1, validation_status: 'VALIDATED'}]
        const tdpPayload = Object.entries(tdpChanges).map(([id, status]) => ({
            id: Number(id),
            validation_status: status,
        }));
        
        const tesPayload = Object.entries(tesChanges).map(([id, status]) => ({
            id: Number(id),
            validation_status: status,
        }));

        router.put(route('unifastrc.validation.bulkUpdate'), {
            tdp_changes: tdpPayload,
            tes_changes: tesPayload,
        }, {
            onSuccess: () => {
                toast.success('Validation statuses saved!');
                // Clear local changes on success
                setTdpChanges({});
                setTesChanges({});
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to save changes.', {
                    description: 'Please check the console for errors.'
                });
            },
            onFinish: () => setIsSaving(false),
        });
    };

    // Helper component to render the table (to avoid repeating code)
    const HeiValidationTable = ({
        records,
        type,
    }: {
        records: AcademicRecord[];
        type: 'tdp' | 'tes';
    }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Scholar Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="w-[200px]">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                    <TableRow key={record.id}>
                        <TableCell>
                            {/* Add checks in case scholar/course is null */ }
                            {record.scholar?.family_name || 'N/A'}, {record.scholar?.given_name || 'N/A'}
                        </TableCell>
                        <TableCell>{record.course?.course_name || 'N/A'}</TableCell>
                        <TableCell>{record.year_level}</TableCell>
                        <TableCell>
                            <Select
                                value={getStatus(record, type)}
                                onValueChange={(newStatus) => {
                                    if (type === 'tdp') {
                                        handleTdpStatusChange(record.id, newStatus);
                                    } else {
                                        handleTesStatusChange(record.id, newStatus);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validationOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    // Main component render
    return (
        <AuthenticatedLayout
            user={auth.user as User}
            page_title="Validation Queue" // Sets the title in the layout
        >
            <Head title="Validation Queue" />
            <Toaster richColors position="top-right" />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        HEI Submission Validation
                    </h2>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <Tabs defaultValue="tdp" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="tdp">TDP Submissions</TabsTrigger>
                        <TabsTrigger value="tes">TES Submissions</TabsTrigger>
                    </TabsList>

                    {/* --- TDP TAB --- */}
                    <TabsContent value="tdp" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tulong Dunong Program (TDP)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {/* Check if there are any HEIs to show */ }
                                    {tdpHeis.length > 0 ? tdpHeis.map((hei) => (
                                        <AccordionItem value={`hei-tdp-${hei.id}`} key={`hei-tdp-${hei.id}`}>
                                            <AccordionTrigger>
                                                {hei.hei_name} ({hei.tdp_academic_records.length} pending)
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <HeiValidationTable
                                                    records={hei.tdp_academic_records}
                                                    type="tdp"
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    )) : <p className="p-4 text-muted-foreground">No pending TDP submissions found.</p>}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TES TAB --- */}
                    <TabsContent value="tes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tertiary Education Subsidy (TES)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {/* Check if there are any HEIs to show */ }
                                    {tesHeis.length > 0 ? tesHeis.map((hei) => (
                                        <AccordionItem value={`hei-tes-${hei.id}`} key={`hei-tes-${hei.id}`}>
                                            <AccordionTrigger>
                                                {hei.hei_name} ({hei.tes_academic_records.length} pending)
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <HeiValidationTable
                                                    records={hei.tes_academic_records}
                                                    type="tes"
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    )) : <p className="p-4 text-muted-foreground">No pending TES submissions found.</p>}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}