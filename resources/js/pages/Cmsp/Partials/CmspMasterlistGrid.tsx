import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { 
    FileSpreadsheet, FileText, Eye, Columns, ArrowUp, ArrowDown, List 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilterBar } from './FilterBar';

// --- COLUMN DEFINITIONS (Sort keys added) ---
const ALL_COLUMNS = [
    { id: 'seq', label: 'Seq', show: true, sortable: false },
    { id: 'lrn', label: 'LRN', show: true, sortKey: 'lrn', sortable: true },
    { id: 'name', label: 'Scholar Name', show: true, sortKey: 'name', sortable: true },
    { id: 'sex', label: 'Sex', show: false, sortable: false },
    { id: 'hei', label: 'School (HEI)', show: true, sortKey: 'hei', sortable: true },
    { id: 'course', label: 'Course', show: true, sortKey: 'course', sortable: true },
    { id: 'year', label: 'Year', show: true, sortable: false },
    { id: 'gwa', label: 'GWA', show: true, sortKey: 'gwa', sortable: true },
    { id: 'status', label: 'Scholarship', show: true, sortable: false },
    { id: 'income', label: 'Income', show: false, sortKey: 'income', sortable: true },
    { id: 'region', label: 'Region', show: false, sortable: false },
    { id: 'province', label: 'Province', show: false, sortable: false },
    { id: 'contact', label: 'Contact', show: false, sortable: false },
    { id: 'email', label: 'Email', show: false, sortable: false },
];

export function CmspMasterlistGrid({ records, filters, heiList = [], academicYears = [], semesters = [] }: any) {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        ALL_COLUMNS.filter(c => c.show).map(c => c.id)
    );

    const toggleColumn = (columnId: string) => {
        setVisibleColumns(prev => 
            prev.includes(columnId) 
                ? prev.filter(id => id !== columnId) 
                : [...prev, columnId]
        );
    };

    // --- SORTING HANDLER ---
    const handleSort = (sortKey: string) => {
        const currentSort = filters.sort_by;
        const currentDir = filters.sort_dir;
        
        let newDir = 'asc';
        if (currentSort === sortKey && currentDir === 'asc') {
            newDir = 'desc';
        }

        router.get(route('admin.cmsp.index'), {
            ...filters,
            sort_by: sortKey,
            sort_dir: newDir,
        }, { preserveState: true, preserveScroll: true });
    };

    // Helper to safely get data
    const getRecordValue = (record: any, columnId: string, index: number) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};

        switch (columnId) {
            case 'seq': return (records.from || 0) + index;
            case 'lrn': return scholar.lrn || '-';
            case 'name': return (
                <div>
                    <span className="font-bold uppercase text-zinc-800 dark:text-zinc-200 block">{scholar.family_name}, {scholar.given_name}</span>
                    {scholar.middle_name && <span className="text-xs text-muted-foreground">{scholar.middle_name}</span>}
                </div>
            );
            case 'sex': return scholar.sex || '-';
            case 'hei': return <span className="truncate block max-w-[200px]" title={record.hei?.hei_name}>{record.hei?.hei_name || enrollment.hei?.hei_name || '-'}</span>;
            case 'course': return <span className="truncate block max-w-[150px]" title={record.course?.course_name}>{record.course?.course_name || '-'}</span>;
            case 'year': return record.year_level || '-';
            case 'gwa': return <span className="font-mono font-bold text-amber-600">{record.gwa || '-'}</span>;
            case 'status': return <Badge variant="outline">{enrollment.scholarship_type || 'Merit'}</Badge>;
            case 'income': return scholar.family_income ? `₱${Number(scholar.family_income).toLocaleString()}` : '-';
            case 'region': return address.region_name || '-';
            case 'province': return address.province?.name || address.province || '-';
            case 'contact': return scholar.contact_no || scholar.mobile_no || '-';
            case 'email': return scholar.email_address || '-';
            default: return '-';
        }
    };

    return (
        <div className="space-y-4">
            {/* TOOLBAR & FILTERS */}
            <Card className="border-none shadow-sm bg-white dark:bg-zinc-950">
                <CardHeader className="p-4 pb-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <List className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Masterlist View</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Column Toggler */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-2">
                                        <Columns className="h-4 w-4" /> Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px] h-[300px] overflow-y-auto">
                                    <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {ALL_COLUMNS.map((col) => (
                                        <DropdownMenuCheckboxItem
                                            key={col.id}
                                            checked={visibleColumns.includes(col.id)}
                                            onCheckedChange={() => toggleColumn(col.id)}
                                        >
                                            {col.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                            {/* Export Buttons */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 text-green-600 border-green-200 hover:bg-green-50" onClick={() => window.open(route('admin.cmsp.export.excel', filters), '_blank')}>
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Export Excel</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50" onClick={() => window.open(route('admin.cmsp.export.pdf', filters), '_blank')}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Export PDF</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    
                    {/* INTEGRATED FILTER BAR */}
                    <div className="pt-2">
                        <FilterBar 
                            filters={filters} 
                            searchKey="search" 
                            academicYears={academicYears} 
                            semesters={semesters} 
                            heiList={heiList} 
                            batches={[]} 
                            courses={[]} 
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* DATA TABLE */}
            <Card className="border dark:border-zinc-800 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow>
                                    {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                                        <TableHead 
                                            key={col.id} 
                                            className={`whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100 ${col.sortable ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''}`}
                                            onClick={() => col.sortable && col.sortKey && handleSort(col.sortKey)}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.label}
                                                {col.sortable && filters.sort_by === col.sortKey && (
                                                    filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records && records.data && records.data.length > 0 ? (
                                    records.data.map((record: any, index: number) => (
                                        <TableRow key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                                                <TableCell key={`${record.id}-${col.id}`} className="whitespace-nowrap py-3 align-top">
                                                    {getRecordValue(record, col.id, index)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right align-top">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => {
                                                                const scholarId = record.enrollment?.scholar_id || record.scholar_id;
                                                                if (scholarId) router.get(route('admin.cmsp.show-scholar', scholarId));
                                                            }}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View History</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={visibleColumns.length + 1} className="h-32 text-center text-muted-foreground">
                                            No records match your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {records?.links && (
                        <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50">
                            <PaginationLinks links={records.links} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}