import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { FileSpreadsheet, BarChart3, UploadCloud, List, School, ArrowRight, Search, Medal } from 'lucide-react';
import { route } from 'ziggy-js';

import { CmspDatabaseGrid } from './Partials/CmspDatabaseGrid';
import { CmspMasterlistGrid } from './Partials/CmspMasterlistGrid';
import { CmspImportForm } from './Partials/CmspImportForm';
import { CmspReportGenerator } from './Partials/CmspReportGenerator';

export default function CmspIndex({ auth, enrollments, heis, filters, stats, academicYears, semesters, heiList }: any) {
    const [heiSearch, setHeiSearch] = useState(filters?.hei_search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (heiSearch !== (filters?.hei_search || '')) {
                router.get(route('admin.cmsp.index'), 
                    { hei_search: heiSearch }, 
                    { preserveState: true, preserveScroll: true, only: ['heis', 'filters'] }
                );
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [heiSearch]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">CMSP Management</h2>}
        >
            <Head title="CMSP Masterlist" />

            <div className="py-6">
                <div className="max-w-[100vw] mx-auto sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Medal className="h-8 w-8 text-amber-500" />
                                CHED Merit Scholarship Program (CMSP)
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage merit-based rankings, scholars, GWA monitoring, and financial records.
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

                        {/* 1. PER HEI TAB */}
                        <TabsContent value="heis" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle>HEI Directory</CardTitle>
                                            <CardDescription>
                                                Showing {heis?.from || 0}-{heis?.to || 0} of {heis?.total || 0} Institutions
                                            </CardDescription>
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
                                                    <TableHead className="w-[200px]">Type</TableHead>
                                                    <TableHead>Scholars</TableHead>
                                                    <TableHead className="text-right w-[150px]">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {heis && heis.data && heis.data.length > 0 ? (
                                                    heis.data.map((hei: any) => (
                                                        <TableRow key={hei.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                            <TableCell className="font-medium">{hei.hei_name}</TableCell>
                                                            <TableCell><Badge variant="outline">{hei.type_of_heis || 'HEI'}</Badge></TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                                                                    {hei.scholars_count || 0} Merit Scholars
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Link href={route('admin.cmsp.show-hei', { id: hei.id })}> 
                                                                    <Button size="sm" variant="ghost" className="gap-2 text-xs">
                                                                        View Scholars <ArrowRight className="h-3 w-3" />
                                                                    </Button>
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No HEIs found.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {heis?.links && <div className="mt-4"><PaginationLinks links={heis.links} /></div>}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 2. DATABASE GRID TAB */}
                        <TabsContent value="database">
                            <CmspDatabaseGrid 
                                records={enrollments}       
                                filters={filters}           
                                academicYears={academicYears}
                                semesters={semesters}       
                                heiList={heiList}
                            />
                        </TabsContent>

                        {/* 3. MASTERLIST TAB (Fixed) */}
                        <TabsContent value="masterlist">
                            <CmspMasterlistGrid 
                                records={enrollments} // Pass 'enrollments' here
                                filters={filters} 
                                heiList={heiList} 
                            />
                        </TabsContent>

                        {/* 4. IMPORT TAB */}
                        <TabsContent value="import"><div className="max-w-2xl mx-auto mt-8"><CmspImportForm /></div></TabsContent>
                        
                        {/* 5. REPORTS TAB */}
                        <TabsContent value="reports"><CmspReportGenerator stats={stats} /></TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}