import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { FileSpreadsheet, FileText, ArrowUpDown, List } from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function CoschoMasterlistGrid({ records, filters }: any) {
    
    // --- Sorting Logic ---
    const handleSort = (field: string) => {
        const currentSort = filters?.sort;
        const currentDir = filters?.direction || 'asc';
        const newDir = (currentSort === field && currentDir === 'asc') ? 'desc' : 'asc';

        router.get(route('admin.coscho.index'), {
            ...filters,
            sort: field,
            direction: newDir,
        }, { preserveState: true, preserveScroll: true });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters?.sort !== field) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground opacity-50" />;
        return <ArrowUpDown className={`ml-2 h-3 w-3 text-blue-600 ${filters.direction === 'desc' ? 'transform rotate-180' : ''}`} />;
    };

    if (!records || records.data.length === 0) {
        return (
            <Card className="border-dashed shadow-sm">
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <List className="h-10 w-10 mb-4 opacity-20" />
                    <p>No records found matching your criteria.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col h-[750px]">
            {/* 1. Header (Fixed) */}
            <CardHeader className="pb-3 border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <List className="h-5 w-5 text-blue-600"/> Masterlist Records
                        </CardTitle>
                        <CardDescription>
                            Showing {records.from}-{records.to} of {records.total} beneficiaries
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white dark:bg-zinc-950"
                            onClick={() => window.open(route('admin.coscho.masterlist.excel', filters))}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600"/> Export Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white dark:bg-zinc-950"
                            onClick={() => window.open(route('admin.coscho.masterlist.pdf', filters))}
                        >
                            <FileText className="h-4 w-4 mr-2 text-red-600"/> Export PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* 2. Scrollable Table Content (Flexible) */}
            <CardContent className="p-0 flex-1 overflow-auto relative">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-900 sticky top-0 z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="w-[150px] cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => handleSort('award_number')}>
                                <div className="flex items-center">Award No. <SortIcon field="award_number"/></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Name <SortIcon field="name"/></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => handleSort('hei')}>
                                <div className="flex items-center">HEI <SortIcon field="hei"/></div>
                            </TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead className="text-center">Year</TableHead>
                            <TableHead className="text-right">Grant</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.data.map((record: any) => {
                            const scholar = record.enrollment.scholar;
                            return (
                                <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <TableCell className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {record.enrollment.award_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="uppercase font-semibold text-slate-800 dark:text-slate-200">
                                            {scholar.family_name}, {scholar.given_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground capitalize">
                                            {scholar.sex === 'M' ? 'Male' : 'Female'} • {scholar.address?.town_city || 'No Address'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="truncate max-w-[250px]" title={record.hei?.hei_name || record.enrollment.hei?.hei_name}>
                                            {record.hei?.hei_name || record.enrollment.hei?.hei_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="truncate max-w-[200px]" title={record.course?.course_name}>
                                            {record.course?.course_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{record.year_level}</TableCell>
                                    <TableCell className="text-right font-mono text-emerald-600 font-bold tracking-tight">
                                        {record.grant_amount ? `₱${Number(record.grant_amount).toLocaleString()}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            variant={record.enrollment.status === 'ACTIVE' ? 'default' : 'secondary'} 
                                            className={record.enrollment.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                        >
                                            {record.enrollment.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            
            {/* 3. Pagination Footer (Fixed) */}
            <CardFooter className="p-4 border-t dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 flex-none">
                <PaginationLinks links={records.links} />
            </CardFooter>
        </Card>
    );
}