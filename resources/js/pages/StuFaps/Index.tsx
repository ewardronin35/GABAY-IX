import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react'; // Added router
import AuthenticatedLayout from "@/layouts/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StuFapsDatabaseGrid } from './Partials/StufapDatabaseGrid';
import { StuFapsReportGenerator } from './Partials/StufapReportGenerator';
import { StuFapsImport } from './Partials/StufapImportForm';
import { StuFapsMasterlistGrid } from './Partials/StufapMasterlistGrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/ui/PaginationLinks'; // ✅ Import Pagination
import { FileSpreadsheet, BarChart3, UploadCloud, List, School, ArrowRight, Search, GraduationCap } from 'lucide-react';
import { route } from 'ziggy-js';

// ✅ Added 'heis' to props
export default function StuFapsIndex({ auth, enrollments, heis, filters, stats, academicYears, heiList, semesters }: any) {
    
    // Initialize search with existing filter or empty
    const [heiSearch, setHeiSearch] = useState(filters?.hei_search || '');

    // ✅ Server-Side Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only trigger if the search term changed
            if (heiSearch !== (filters?.hei_search || '')) {
                router.get(
                    route('admin.stufaps.index'),
                    { hei_search: heiSearch }, // Send as 'hei_search' param
                    { 
                        preserveState: true, 
                        preserveScroll: true, 
                        only: ['heis', 'filters'] // Only reload HEI data
                    }
                );
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [heiSearch]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">StuFAPs Management</h2>}
        >
            <Head title="StuFAPs Masterlist" />

            <div className="py-6">
                <div className="max-w-[100vw] mx-auto sm:px-4 lg:px-6">
                    
                    {/* MODULE TITLE */}
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <GraduationCap className="h-8 w-8 text-blue-600" />
                                Student Financial Assistance Programs (StuFAPs)
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage scholarships, masterlists, database records, and generate financial reports.
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="heis" className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <TabsList className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                                <TabsTrigger value="heis" className="gap-2"><School className="h-4 w-4"/> Per HEI</TabsTrigger>
                                <TabsTrigger value="database" className="gap-2"><FileSpreadsheet className="h-4 w-4"/> Database</TabsTrigger>
                                <TabsTrigger value="masterlist" className="gap-2"><List className="h-4 w-4"/> Masterlist</TabsTrigger>
                                <TabsTrigger value="import" className="gap-2"><UploadCloud className="h-4 w-4"/> Import</TabsTrigger>
                                <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4"/> Reports</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* PER HEI TAB (Directory) */}
                        <TabsContent value="heis" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle>HEI Directory</CardTitle>
                                            <CardDescription>View scholars grouped by Higher Education Institution</CardDescription>
                                        </div>
                                        <div className="relative w-full md:w-[300px]">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search HEI..." 
                                                value={heiSearch}
                                                onChange={(e) => setHeiSearch(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                                <TableRow>
                                                    <TableHead>Institution Name</TableHead>
                                                    <TableHead className="w-[150px]">Type</TableHead>
                                                    <TableHead>Scholars</TableHead>
                                                    <TableHead className="text-right w-[150px]">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* ✅ USE heis.data HERE */}
                                                {heis && heis.data.length > 0 ? (
                                                    heis.data.map((hei: any) => (
                                                        <TableRow key={hei.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                            <TableCell className="font-medium">
                                                                {hei.hei_name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{hei.hei_type || 'HEI'}</Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                                    {hei.enrollments_count || 0} Grantees
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Link href={route('admin.stufaps.show-hei', { hei: hei.id })}>
                                                                    <Button size="sm" variant="ghost" className="gap-2 text-xs">
                                                                        View <ArrowRight className="h-3 w-3" />
                                                                    </Button>
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            No HEIs found matching your search.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    {/* ✅ PAGINATION LINKS */}
                                    <div className="mt-4">
                                        <PaginationLinks links={heis.links} />
                                    </div>

                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* OTHER TABS (Unchanged) */}
                        <TabsContent value="database" className="space-y-4">
                            <StuFapsDatabaseGrid 
                                enrollments={enrollments}
                                filters={filters}
                                academicYears={academicYears}
                                heiList={heiList}
                                semesters={semesters} 
                            />
                        </TabsContent>

                        <TabsContent value="masterlist" className="space-y-4">
                            <StuFapsMasterlistGrid records={enrollments} filters={filters} />
                        </TabsContent>

                        <TabsContent value="import">
                            <div className="max-w-2xl mx-auto mt-8">
                                <StuFapsImport />
                            </div>
                        </TabsContent>

                        <TabsContent value="reports">
                            <StuFapsReportGenerator stats={stats} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}