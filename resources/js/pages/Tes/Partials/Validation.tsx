import { useState } from "react";
import AuthenticatedLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { Search, CheckCircle, Clock, FileCheck, School, List, Sheet, Upload, BarChart3, Filter } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
// Reuse the generic modal from TDP folder (it handles both programs)
import { ValidationModal } from "@/pages/Admin/Tdp/Partials/ValidationModal"; 
import { PageProps } from "@/types";
import { route } from "ziggy-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ValidationPageProps = PageProps & {
    scholars: { data: any[]; links: any[]; meta?: { links: any[] }; };
    academicYears: { id: number; name: string }[];
    batches: string[]; // Array of strings
    courses: { id: number; course_name: string }[];
    filters: {
        status: string;
        search: string;
        academic_year?: string;
        batch?: string;
        course?: string;
    };
};

export default function TesValidation({ auth, scholars, filters, academicYears, batches, courses }: ValidationPageProps) {
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateParams = (key: string, value: string | null) => {
        router.get(
            route("admin.tes.validation.index"), // ✅ TES Route
            { ...filters, [key]: value, page: 1 }, 
            { preserveState: true, replace: true }
        );
    };

    // ✅ NAVIGATE BACK TO TES INDEX
    const onMainTabChange = (value: string) => {
        if (value === "validation") return; 
        router.visit(route("admin.tes.index", { tab: value })); // ✅ TES Route
    };

    const openValidationModal = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setIsModalOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="TES Management">
            <Head title="TES Validation" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tertiary Education Subsidy (TES)</h2>
                </div>

                <div className="space-y-4">
                    {/* ✅ WRAPPED IN TABS (Looks like Index) */}
                    <Tabs value="validation" onValueChange={onMainTabChange}>
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:min-w-0">
                                <TabsTrigger value="hei" className="px-3 flex-1 md:flex-none"><School className="w-4 h-4 mr-2" /> By School</TabsTrigger>
                                <TabsTrigger value="validation" className="px-3 flex-1 md:flex-none"><FileCheck className="w-4 h-4 mr-2" /> Validation</TabsTrigger>
                                <TabsTrigger value="database" className="px-3 flex-1 md:flex-none"><List className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                                <TabsTrigger value="masterlist" className="px-3 flex-1 md:flex-none"><Sheet className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                                <TabsTrigger value="import" className="px-3 flex-1 md:flex-none"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                                <TabsTrigger value="reports" className="px-3 flex-1 md:flex-none"><BarChart3 className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    {/* PAGE CONTENT */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="space-y-4">
                                {/* Sub-Tabs & Search */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <Tabs value={filters.status || 'pending'} onValueChange={(val) => updateParams('status', val)} className="w-full sm:w-[300px]">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" /> Pending</TabsTrigger>
                                            <TabsTrigger value="validated" className="gap-2"><CheckCircle className="h-4 w-4" /> Validated</TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search scholar name..."
                                            defaultValue={filters.search}
                                            onChange={(e) => updateParams('search', e.target.value)} 
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-2 rounded-md border border-dashed">
                                    <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                                    
                                    <Select value={filters.academic_year} onValueChange={(val) => updateParams('academic_year', val === 'all' ? null : val)}>
                                        <SelectTrigger className="w-[180px] h-8 bg-background"><SelectValue placeholder="Academic Year" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            {academicYears.map((ay) => (<SelectItem key={ay.id} value={ay.id.toString()}>{ay.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={filters.batch} onValueChange={(val) => updateParams('batch', val === 'all' ? null : val)}>
                                        <SelectTrigger className="w-[140px] h-8 bg-background"><SelectValue placeholder="Batch" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Batches</SelectItem>
                                            {/* ✅ Map batches as simple strings */}
                                            {batches.map((b) => (<SelectItem key={b} value={String(b)}>Batch {b}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={filters.course} onValueChange={(val) => updateParams('course', val === 'all' ? null : val)}>
                                        <SelectTrigger className="w-[200px] h-8 bg-background"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Courses</SelectItem>
                                            {courses.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.course_name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    {(filters.academic_year || filters.course || filters.batch) && (
                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('admin.tes.validation.index'))} className="h-8 text-destructive">Reset</Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Scholar Name</TableHead>
                                            <TableHead>HEI / School</TableHead>
                                            <TableHead>Award No.</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!scholars.data || scholars.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                    No scholars found matching your filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            scholars.data.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.scholar?.family_name}, {item.scholar?.given_name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {item.hei?.hei_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{item.award_number || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {item.payment_status === 'Validated' ? (
                                                            <Badge className="bg-green-600">Validated</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Pending</Badge>
                                                        )}
                                                    </TableCell>
                                                    
                                                    {/* ✅ ACTION BUTTONS (No NOA here) */}
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            size="sm" 
                                                            variant={item.payment_status === 'Validated' ? "outline" : "default"}
                                                            onClick={() => openValidationModal(item)}
                                                            className={item.payment_status !== 'Validated' ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                        >
                                                            <FileCheck className="h-4 w-4 mr-2" />
                                                            {item.payment_status === 'Validated' ? 'View' : 'Validate'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <PaginationLinks links={scholars.meta?.links || scholars.links || []} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedEnrollment && (
                <ValidationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    enrollmentId={selectedEnrollment.id}
                    program="tes" // ✅ Pass TES here so modal hits TES routes
                />
            )}
        </AuthenticatedLayout>
    );
}