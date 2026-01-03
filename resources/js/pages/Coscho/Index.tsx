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
import { FileSpreadsheet, BarChart3, UploadCloud, List, School, ArrowRight, Search, Landmark, Palmtree } from 'lucide-react';
import { route } from 'ziggy-js';

// Partials
import { CoschoDatabaseGrid } from './Partials/CoschoDatabaseGrid';
import { CoschoMasterlistGrid } from './Partials/CoschoMasterlistGrid';
import { CoschoImportForm } from './Partials/CoschoImportForm';
import { CoschoReportGenerator } from './Partials/CoschoReportGenerator';
import { FilterBar } from './Partials/FilterBar';
export default function CoschoIndex({ auth, records, heis, filters, stats, academicYears, heiList }: any) {
    const [heiSearch, setHeiSearch] = useState(filters?.hei_search || '');

    // Server-side Search for HEIs
    useEffect(() => {
        const timer = setTimeout(() => {
            if (heiSearch !== (filters?.hei_search || '')) {
                router.get(route('admin.coscho.index'), { ...filters, hei_search: heiSearch }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [heiSearch]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="COSCHO Program" />

            <div className="flex h-screen flex-col bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    
                    {/* --- HEADER SECTION --- */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-900/20">
                            <Palmtree className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                COSCHO Program
                            </h2>
                            <p className="text-muted-foreground text-sm font-medium">
                                Scholarship Program for Coconut Farmers and their Families
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="directory" className="space-y-4">
                        <TabsList className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 p-1">
                            <TabsTrigger value="directory" className="gap-2"><School className="h-4 w-4"/> HEI Directory</TabsTrigger>
                            <TabsTrigger value="database" className="gap-2"><FileSpreadsheet className="h-4 w-4"/> Database Editor</TabsTrigger>
                            <TabsTrigger value="masterlist" className="gap-2"><List className="h-4 w-4"/> Masterlist</TabsTrigger>
                            <TabsTrigger value="import" className="gap-2"><UploadCloud className="h-4 w-4"/> Import</TabsTrigger>
                            <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4"/> Reports</TabsTrigger>
                        </TabsList>

                        {/* 1. HEI DIRECTORY (Default View) */}
                        <TabsContent value="directory" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Scholars</CardTitle>
                                        <School className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">{stats.active.toLocaleString()} Active</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Disbursement</CardTitle>
                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-600">₱ {Number(stats.amount).toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle>Participating HEIs</CardTitle>
                                            <CardDescription>Schools with active COSCHO scholars.</CardDescription>
                                        </div>
                                        <div className="relative w-full md:w-72">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search HEI..." className="pl-8" value={heiSearch} onChange={e => setHeiSearch(e.target.value)} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>HEI Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-center">Scholars Enrolled</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {heis.data.map((hei: any) => (
                                                <TableRow key={hei.id}>
                                                    <TableCell className="font-medium">{hei.hei_name}</TableCell>
                                                    <TableCell><Badge variant="outline">{hei.type_of_heis}</Badge></TableCell>
                                                    <TableCell className="text-center font-bold text-blue-600">{hei.enrollments_count}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('admin.coscho.show-hei', hei.id)}>
                                                            <Button size="sm" variant="ghost">View <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {heis.data.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">No HEIs found.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                    {heis?.links && <div className="mt-4"><PaginationLinks links={heis.links} /></div>}
                                </CardContent>
                            </Card>
                        </TabsContent>

                     
  <TabsContent value="database">
                            <CoschoDatabaseGrid 
                                records={records}       
                                filters={filters}           
                                academicYears={academicYears}
                                heiList={heiList} // ✅ ADDED THIS PROP
                            />
                        </TabsContent>

                        {/* 3. MASTERLIST */}
                        <TabsContent value="masterlist">
                            <FilterBar 
                                filters={filters} 
                                academicYears={academicYears} 
                                heiList={heiList} 
                                searchKey="search"
                                semesters={[]}
                                batches={[]}
                            />
                            <div className="mt-4">
                                <CoschoMasterlistGrid records={records} />
                            </div>
                        </TabsContent>

                        {/* 4. IMPORT */}
                        <TabsContent value="import"><div className="max-w-2xl mx-auto mt-8"><CoschoImportForm /></div></TabsContent>
                        
                        {/* 5. REPORTS */}
                        <TabsContent value="reports"><CoschoReportGenerator stats={stats} /></TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
