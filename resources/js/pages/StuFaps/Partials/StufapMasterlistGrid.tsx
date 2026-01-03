import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuCheckboxItem, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
    Search, FileSpreadsheet, FileText, X, Settings2, School, Filter, 
    ArrowUpDown, ArrowUp, ArrowDown 
} from 'lucide-react';

export function StuFapsMasterlistGrid({ records, filters, heiList }: any) {
    // --- 1. CRITICAL FIX: Safe Props Initialization ---
    // If 'filters' is an empty array [], accessing .sort returns the function Array.prototype.sort!
    // We must ensure it's treated as a plain object to avoid the crash.
    const safeFilters = (filters && !Array.isArray(filters)) ? filters : {};
    const safeHeiList = Array.isArray(heiList) ? heiList : [];

    // State
    const [search, setSearch] = useState(safeFilters.search || '');
    const [heiFilter, setHeiFilter] = useState(safeFilters.hei_id || 'all');
    const [yearFilter, setYearFilter] = useState(safeFilters.year_level || 'all');
    const [sexFilter, setSexFilter] = useState(safeFilters.sex || 'all');
    
    // Sort State
    const [sortBy, setSortBy] = useState(safeFilters.sort || 'updated_at');
    const [sortDir, setSortDir] = useState(safeFilters.direction || 'desc');

    const [visibleColumns, setVisibleColumns] = useState({
        award_no: true, code: true, name: true, sex: true, hei: true, 
        course: true, year: true, amount: true, status: true
    });

    // --- 2. DEBOUNCE SEARCH ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (safeFilters.search || '')) {
                applyFilters({ search });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // --- 3. FILTER & SORT LOGIC ---
    const applyFilters = (overrides = {}) => {
        const newFilters = {
            search,
            hei_id: heiFilter,
            year_level: yearFilter,
            sex: sexFilter,
            sort: sortBy,
            direction: sortDir,
            ...overrides
        };

        // Clean up parameters
        const queryParams: any = { _query: { tab: 'masterlist' } };
        
        if (newFilters.search) queryParams.search = newFilters.search;
        if (newFilters.hei_id && newFilters.hei_id !== 'all') queryParams.hei_id = newFilters.hei_id;
        if (newFilters.year_level && newFilters.year_level !== 'all') queryParams.year_level = newFilters.year_level;
        if (newFilters.sex && newFilters.sex !== 'all') queryParams.sex = newFilters.sex;
        if (newFilters.sort) queryParams.sort = newFilters.sort;
        if (newFilters.direction) queryParams.direction = newFilters.direction;

        router.get(route('admin.stufaps.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            only: ['enrollments', 'filters']
        });
    };

    // --- HANDLERS ---
    const handleSort = (column: string) => {
        const newDir = (sortBy === column && sortDir === 'asc') ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
        applyFilters({ sort: column, direction: newDir });
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            search,
            hei_id: heiFilter === 'all' ? '' : heiFilter,
            year_level: yearFilter === 'all' ? '' : yearFilter,
            sex: sexFilter === 'all' ? '' : sexFilter,
            sort: sortBy,
            direction: sortDir
        });
        
        const url = type === 'excel' 
            ? route('admin.stufaps.export.excel') 
            : route('admin.stufaps.export.pdf');

        window.open(`${url}?${params.toString()}`, '_blank');
    };

    const toggleColumn = (col: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    // --- SORT BUTTON COMPONENT ---
    const SortButton = ({ col, label }: { col: string, label: string }) => {
        return (
            <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-3 h-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold"
                onClick={() => handleSort(col)}
            >
                {label}
                {sortBy === col ? (
                    sortDir === 'asc' ? <ArrowUp className="ml-2 h-3.5 w-3.5" /> : <ArrowDown className="ml-2 h-3.5 w-3.5" />
                ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/40" />
                )}
            </Button>
        );
    };

    if (!records || !records.data) return <div className="p-8 text-center text-muted-foreground">Loading data...</div>;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="border-none shadow-sm bg-zinc-50 dark:bg-zinc-900/50">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-3">
                        <div className="relative w-full md:w-[350px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, award no..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="pl-9 bg-white dark:bg-zinc-950"
                            />
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-white dark:bg-zinc-950">
                                        <Settings2 className="mr-2 h-4 w-4" /> Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {Object.keys(visibleColumns).map((key) => (
                                        <DropdownMenuCheckboxItem 
                                            key={key}
                                            checked={visibleColumns[key as keyof typeof visibleColumns]}
                                            onCheckedChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                                            className="capitalize"
                                        >
                                            {key.replace('_', ' ')}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="bg-white dark:bg-zinc-950">
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="bg-white dark:bg-zinc-950">
                                <FileText className="mr-2 h-4 w-4 text-red-600" /> PDF
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center text-sm text-muted-foreground mr-2"><Filter className="h-3 w-3 mr-1" /> Filters:</div>
                        
                        <Select value={heiFilter} onValueChange={(v) => { setHeiFilter(v); applyFilters({ hei_id: v }); }}>
                            <SelectTrigger className="w-[250px] h-8 bg-white dark:bg-zinc-950"><SelectValue placeholder="All Institutions" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Institutions</SelectItem>
                                {safeHeiList.map((hei: any) => <SelectItem key={hei.id} value={String(hei.id)}>{hei.hei_name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); applyFilters({ year_level: v }); }}>
                            <SelectTrigger className="w-[120px] h-8 bg-white dark:bg-zinc-950"><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {[1,2,3,4,5].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={sexFilter} onValueChange={(v) => { setSexFilter(v); applyFilters({ sex: v }); }}>
                            <SelectTrigger className="w-[100px] h-8 bg-white dark:bg-zinc-950"><SelectValue placeholder="Sex" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                            </SelectContent>
                        </Select>

                        {(search || heiFilter !== 'all' || yearFilter !== 'all' || sexFilter !== 'all') && (
                            <Button variant="ghost" size="sm" className="h-8 text-red-500" onClick={() => {
                                setSearch(''); setHeiFilter('all'); setYearFilter('all'); setSexFilter('all');
                                router.get(route('admin.stufaps.index'));
                            }}><X className="h-3 w-3 mr-1" /> Reset</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
                                <TableRow>
                                    {visibleColumns.award_no && <TableHead className="w-[150px]"><SortButton col="award_number" label="Award No" /></TableHead>}
                                    {visibleColumns.code && <TableHead className="w-[100px]"><SortButton col="code" label="Code" /></TableHead>}
                                    {visibleColumns.name && <TableHead><SortButton col="name" label="Scholar Name" /></TableHead>}
                                    {visibleColumns.sex && <TableHead className="w-[60px] text-center">Sex</TableHead>}
                                    {visibleColumns.hei && <TableHead><SortButton col="hei" label="Institution" /></TableHead>}
                                    {visibleColumns.course && <TableHead><SortButton col="course" label="Course" /></TableHead>}
                                    {visibleColumns.year && <TableHead className="text-center w-[80px]"><SortButton col="year" label="Year" /></TableHead>}
                                    {visibleColumns.amount && <TableHead className="text-right"><SortButton col="amount" label="Amount" /></TableHead>}
                                    {visibleColumns.status && <TableHead className="text-center w-[100px]">Status</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records && records.data && records.data.length > 0 ? (
                                    records.data.map((record: any) => {
                                        const scholar = record.enrollment?.scholar;
                                        const fullName = `${scholar?.family_name || ''}, ${scholar?.given_name || ''}`;
                                        const code = record.enrollment?.scholarship_type || '-';

                                        return (
                                            <TableRow key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                {visibleColumns.award_no && <TableCell className="font-mono text-xs text-muted-foreground font-medium">{record.enrollment?.award_number || '-'}</TableCell>}
                                                {visibleColumns.code && <TableCell><Badge variant="outline" className="font-mono text-[10px]">{code}</Badge></TableCell>}
                                                {visibleColumns.name && <TableCell className="font-medium uppercase">{fullName}</TableCell>}
                                                {visibleColumns.sex && <TableCell className="text-center text-xs">{scholar?.sex || '-'}</TableCell>}
                                                {visibleColumns.hei && <TableCell className="max-w-[250px] truncate" title={record.hei?.hei_name}><div className="flex items-center gap-1.5"><School className="h-3 w-3 text-muted-foreground" /><span className="truncate">{record.hei?.hei_name}</span></div></TableCell>}
                                                {visibleColumns.course && <TableCell className="max-w-[200px] truncate">{record.course?.course_name || '-'}</TableCell>}
                                                {visibleColumns.year && <TableCell className="text-center">{record.year_level}</TableCell>}
                                                {visibleColumns.amount && <TableCell className="text-right font-bold text-green-600">₱{Number(record.grant_amount || 0).toLocaleString()}</TableCell>}
                                                {visibleColumns.status && <TableCell className="text-center"><Badge variant={record.validation_status === 'Validated' ? 'default' : 'secondary'} className="text-[10px]">{record.validation_status || 'Pending'}</Badge></TableCell>}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No records found matching your filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="p-4 border-t">
                        <PaginationLinks links={records.links} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}