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
import { FileSpreadsheet, BarChart3, UploadCloud, List, School, ArrowRight, Search, Landmark } from 'lucide-react';
import { route } from 'ziggy-js';

import { EstatDatabaseGrid } from './Partials/EstatDatabaseGrid';
import { EstatMasterlistGrid } from './Partials/EstatMasterlistGrid';
import { EstatImportForm } from './Partials/EstatImportForm';
import { EstatReportGenerator } from './Partials/EstatReportGenerator';

export default function EstatIndex({ auth, records, heis, filters, stats, academicYears, heiList }: any) {
    const [heiSearch, setHeiSearch] = useState(filters?.hei_search || '');

    // Server-side Search for HEIs
    useEffect(() => {
        const timer = setTimeout(() => {
            if (heiSearch !== (filters?.hei_search || '')) {
                router.get(route('admin.estatskolar.index'), 
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Estatistikolar Management</h2>}
        >
            <Head title="Estatistikolar Program" />

            <div className="py-6">
                <div className="max-w-[100vw] mx-auto sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Landmark className="h-8 w-8 text-emerald-600" />
                                Estatistikolar Program (Annex E)
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage beneficiaries, monitoring (E-2), and special equity groups (PWD, Solo Parent, IP).
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="heis" className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <TabsList className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                                <TabsTrigger value="heis" className="gap-2"><School className="h-4 w-4"/> HEI Directory</TabsTrigger>
                                <TabsTrigger value="database" className="gap-2"><FileSpreadsheet className="h-4 w-4"/> Database</TabsTrigger>
                                <TabsTrigger value="masterlist" className="gap-2"><List className="h-4 w-4"/> Masterlist</TabsTrigger>
                                <TabsTrigger value="import" className="gap-2"><UploadCloud className="h-4 w-4"/> Import</TabsTrigger>
                                <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4"/> Analytics</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* 1. HEI DIRECTORY (Per HEI) */}
                        <TabsContent value="heis" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle>Participating HEIs</CardTitle>
                                            <CardDescription>Institutions with Estatistikolar grantees.</CardDescription>
                                        </div>
                                        <div className="relative w-full md:w-[300px]">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search School..." 
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
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Scholars</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {heis && heis.data && heis.data.length > 0 ? (
                                                    heis.data.map((hei: any) => (
                                                        <TableRow key={hei.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                            <TableCell className="font-medium">{hei.hei_name}</TableCell>
                                                            <TableCell><Badge variant="outline">{hei.hei_type || 'HEI'}</Badge></TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                                                    {hei.enrollments_count || 0} Grantees
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Link href={route('admin.estatskolar.show-hei', { id: hei.id })}> 
                                                                    <Button size="sm" variant="ghost" className="gap-2 text-xs">
                                                                        View <ArrowRight className="h-3 w-3" />
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

                        {/* 2. DATABASE GRID */}
                        <TabsContent value="database">
                            <EstatDatabaseGrid 
                                records={records}       
                                filters={filters}           
                                academicYears={academicYears}
                                heiList={heiList}
                            />
                        </TabsContent>

                        {/* 3. MASTERLIST */}
                        <TabsContent value="masterlist">
                            <EstatMasterlistGrid records={records} filters={filters} />
                        </TabsContent>

                        {/* 4. IMPORT */}
                        <TabsContent value="import"><div className="max-w-2xl mx-auto mt-8"><EstatImportForm /></div></TabsContent>
                        
                        {/* 5. REPORTS */}
                        <TabsContent value="reports"><EstatReportGenerator stats={stats} /></TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}