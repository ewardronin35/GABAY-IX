import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings2, FileSpreadsheet, Download, FileText } from 'lucide-react';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { FilterBar } from './FilterBar';
import { Badge } from '@/components/ui/badge';
import { route } from "ziggy-js";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MsrsMasterlistGrid({ 
    enrollments, 
    filters, 
    academicYears, 
    semesters, 
    heiList,
    courses,
    regions,
    provinces,
    cities,
    districts
}: any) {
    
    // --- COLUMN CONFIGURATION ---
    const [visibleColumns, setVisibleColumns] = useState({
        seq: true,
        award_no: true,
        name: true,
        sex: true,
        region: true,
        province: true,
        district: false,
        city: false,
        barangay: false,
        street: false, 
        hei: true,
        course: true,
        year: true,
        term: true,
    });

    const toggleColumn = (key: string) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const getAddr = (record: any) => record.enrollment?.scholar?.address || {};

    const safeRender = (val: any, fallback = '-') => {
        if (val === null || val === undefined) return fallback;
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (typeof val === 'object') {
            return val.name || val.barangay || val.district || val.congressional_district || fallback;
        }
        return fallback;
    };

    // ✅ EXPORT HANDLER
    const handleExport = (type: 'excel' | 'pdf') => {
        // Construct URL with current search parameters to filter the export
        const currentParams = new URLSearchParams(window.location.search);
        const routeName = type === 'excel' ? 'admin.msrs.export-excel' : 'admin.msrs.export-pdf';
        
        // Redirect to export route
        window.location.href = `${route(routeName)}?${currentParams.toString()}`;
    };

    return (
        <Card className="flex flex-col h-[85vh] w-full border shadow-sm dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden">
            {/* --- HEADER SECTION --- */}
            <CardHeader className="pb-4 border-b shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            MSRS Masterlist
                        </CardTitle>
                        <CardDescription>
                            Consolidated view of scholars. Use "View Columns" to customize the table.
                        </CardDescription>
                    </div>
                    
                    <div className="flex gap-2 ml-auto">
                        {/* ✅ EXPORT BUTTONS */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleExport('excel')}
                        >
                            <Download className="h-4 w-4 text-green-600" />
                            Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleExport('pdf')}
                        >
                            <FileText className="h-4 w-4 text-red-600" />
                            PDF
                        </Button>

                        {/* COLUMN TOGGLER */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                                <DropdownMenuLabel>Personal Info</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem checked={visibleColumns.sex} onCheckedChange={() => toggleColumn('sex')}>Sex</DropdownMenuCheckboxItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Location</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem checked={visibleColumns.region} onCheckedChange={() => toggleColumn('region')}>Region</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.province} onCheckedChange={() => toggleColumn('province')}>Province</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.district} onCheckedChange={() => toggleColumn('district')}>District</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.city} onCheckedChange={() => toggleColumn('city')}>City/Town</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.barangay} onCheckedChange={() => toggleColumn('barangay')}>Barangay</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.street} onCheckedChange={() => toggleColumn('street')}>Street</DropdownMenuCheckboxItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Academic</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem checked={visibleColumns.hei} onCheckedChange={() => toggleColumn('hei')}>HEI Name</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.course} onCheckedChange={() => toggleColumn('course')}>Course</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.term} onCheckedChange={() => toggleColumn('term')}>Semester/AY</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="bg-muted/30 p-2 rounded-lg border">
                    <FilterBar 
                        filters={filters} 
                        searchKey="search" 
                        academicYears={academicYears} 
                        semesters={semesters} 
                        heiList={heiList}
                        courses={courses}
                        regions={regions}
                        provinces={provinces}
                        cities={cities}
                        batches={[]} 
                    />
                </div>
            </CardHeader>

            {/* --- TABLE CONTENT --- */}
            <div className="flex-1 overflow-auto relative bg-white dark:bg-zinc-950">
                <Table className="relative w-full">
                    {/* Sticky Header with Expanded Widths */}
                    <TableHeader className="sticky top-0 bg-white dark:bg-zinc-950 z-20 shadow-sm ring-1 ring-black/5">
                        <TableRow className="hover:bg-transparent border-b">
                            {visibleColumns.seq && <TableHead className="w-[60px] min-w-[60px] text-center font-bold">#</TableHead>}
                            {visibleColumns.award_no && <TableHead className="min-w-[180px] font-bold">Award No</TableHead>}
                            {visibleColumns.name && <TableHead className="min-w-[250px] font-bold">Name</TableHead>}
                            {visibleColumns.sex && <TableHead className="w-[60px] min-w-[60px] text-center font-bold">Sex</TableHead>}
                            
                            {/* Location Group */}
                            {visibleColumns.region && <TableHead className="min-w-[180px]">Region</TableHead>}
                            {visibleColumns.province && <TableHead className="min-w-[200px]">Province</TableHead>}
                            {visibleColumns.district && <TableHead className="min-w-[200px]">District</TableHead>}
                            {visibleColumns.city && <TableHead className="min-w-[200px]">City/Town</TableHead>}
                            {visibleColumns.barangay && <TableHead className="min-w-[200px]">Barangay</TableHead>}
                            {visibleColumns.street && <TableHead className="min-w-[250px]">Street</TableHead>}

                            {/* Academic Group */}
                            {visibleColumns.hei && <TableHead className="min-w-[400px]">HEI</TableHead>}
                            {visibleColumns.course && <TableHead className="min-w-[300px]">Course</TableHead>}
                            {visibleColumns.year && <TableHead className="w-[80px] min-w-[80px] text-center">Year</TableHead>}
                            {visibleColumns.term && <TableHead className="min-w-[180px]">Term</TableHead>}
                        </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                        {enrollments.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={20} className="h-32 text-center text-muted-foreground">
                                    No records found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            enrollments.data.map((record: any, index: number) => {
                                const scholar = record.enrollment?.scholar || {};
                                const addr = getAddr(record);
                                const hei = record.hei || {};

                                return (
                                    <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                                        {visibleColumns.seq && (
                                            <TableCell className="font-mono text-xs text-muted-foreground text-center">
                                                {record.seq || index + 1}
                                            </TableCell>
                                        )}
                                        {visibleColumns.award_no && (
                                            <TableCell className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                {record.enrollment?.award_number || '-'}
                                            </TableCell>
                                        )}
                                        
                                        {visibleColumns.name && (
                                            <TableCell className="font-medium text-sm whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis">
                                                <div className="flex flex-col">
                                                    <span className="truncate">{scholar.family_name}, {scholar.given_name}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">{scholar.middle_name || ''} {scholar.extension_name || ''}</span>
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.sex && (
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1">
                                                    {scholar.sex}
                                                </Badge>
                                            </TableCell>
                                        )}

                                        {/* Location */}
                                        {visibleColumns.region && <TableCell className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                                            {safeRender(addr.region)}
                                        </TableCell>}
                                        {visibleColumns.province && <TableCell className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                            {safeRender(addr.province)}
                                        </TableCell>}
                                        {visibleColumns.district && <TableCell className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                            {safeRender(addr.district)}
                                        </TableCell>}
                                        {visibleColumns.city && <TableCell className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                            {safeRender(addr.city) || safeRender(addr.town_city)}
                                        </TableCell>}
                                        {visibleColumns.barangay && <TableCell className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                            {safeRender(addr.barangay) !== '-' ? safeRender(addr.barangay) : safeRender(addr.barangay_text)}
                                        </TableCell>}
                                        {visibleColumns.street && <TableCell className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]" title={addr.specific_address}>
                                            {addr.specific_address}
                                        </TableCell>}

                                        {/* Academic */}
                                        {visibleColumns.hei && <TableCell className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]" title={hei.hei_name}>
                                            {hei.hei_name}
                                        </TableCell>}
                                        {visibleColumns.course && <TableCell className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]" title={record.course?.course_name}>
                                            {record.course?.course_name}
                                        </TableCell>}
                                        {visibleColumns.year && <TableCell className="text-center text-xs whitespace-nowrap">
                                            {record.year_level}
                                        </TableCell>}
                                        {visibleColumns.term && (
                                            <TableCell className="text-xs whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{record.semester?.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{record.academic_year?.name}</span>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* --- FOOTER --- */}
            <div className="p-4 border-t bg-gray-50 dark:bg-zinc-900 shrink-0">
                <PaginationLinks links={enrollments.links} />
            </div>
        </Card>
    );
}