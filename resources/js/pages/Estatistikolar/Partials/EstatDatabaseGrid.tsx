// ✅ 1. THEME IMPORTS
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';
// import 'handsontable/dist/handsontable.full.min.css'; // Removed to match CMSP

import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Save, Loader2, FileSpreadsheet, Layers, CalendarRange, Filter, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

registerAllModules();

// --- 1. DATA MAPPING ---
const mapDataToGrid = (records: any[]) => {
    // ✅ Empty Row Fix
    if (!Array.isArray(records) || records.length === 0) {
        return [{
            id: null, seq: '', award_number: '', lrn: '', 
            lname: '', fname: '', mname: '', 
            hei_name: '', program: '', status: ''
        }];
    }
    
    const safeText = (val: any) => (val === null || val === undefined) ? '' : String(val);

    return records.map((record, index) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};

        return {
            id: record.id, 
            seq: index + 1,
            
            // Identifiers
            award_number: safeText(enrollment.award_number),
            lrn: safeText(scholar.lrn), // ✅ LRN Mapped

            // Personal Info
            lname: safeText(scholar.family_name),
            fname: safeText(scholar.given_name),
            mname: safeText(scholar.middle_name),
            extension: safeText(scholar.extension_name),
            sex: safeText(scholar.sex),
            birthdate: safeText(scholar.date_of_birth),
            civil_status: safeText(scholar.civil_status),

            // Academic
            hei_name: safeText(record.hei?.hei_name || enrollment.hei?.hei_name),
            program: safeText(record.course?.course_name),
            year_level: safeText(record.year_level),
            gwa: record.gwa || 0,
            
            // Status
            status: safeText(enrollment.status),
            scholarship_type: safeText(enrollment.scholarship_type),

            // Groups
            is_pwd: scholar.is_pwd === 1 || scholar.is_pwd === true || scholar.is_pwd === 'Yes',
            is_solo: scholar.is_solo_parent === 1 || scholar.is_solo_parent === true || scholar.is_solo_parent === 'Yes',
            is_ip: scholar.is_ip === 'Yes' || scholar.is_ip === true,
            group_type: safeText(scholar.disability || scholar.indigenous_group), 

            // Address
            province: safeText(address.province),
            city: safeText(address.town_city),
            barangay: safeText(address.specific_address),
        };
    });
};

// --- 2. MEMOIZED TABLE (Exact CMSP Style) ---
const MemoizedHotTable = memo(({ data, columns, onAfterChange, forwardRef }: any) => {
    return (
        <>
            <style>{`
                .dark .handsontable, .dark .wtHolder, .dark .htCore { background-color: #09090b !important; color: #e4e4e7 !important; }
                .dark .handsontable th { background-color: #18181b !important; color: #a1a1aa !important; border-color: #27272a !important; }
                .dark .handsontable tbody tr td { background-color: #09090b !important; color: #f8fafc !important; border-color: #27272a !important; }
                .dark .handsontable td.area { background-color: rgba(16, 185, 129, 0.25) !important; border: 1px solid #10b981 !important; }
                /* Removed 'stretchH' to fix scrollbar issue */
                .ht_clone_top, .ht_clone_left, .ht_clone_corner { z-index: 100 !important; }
            `}</style>
            <HotTable
                ref={forwardRef}
                data={data}
                columns={columns}
                colHeaders={columns.map((c: any) => c.title)}
                rowHeaders={true}
                width="100%"
                height="650px" // ✅ Fixed height matching container
                manualColumnResize={true} 
                dropdownMenu={true}
                contextMenu={['copy', 'cut', '---------', 'undo', 'redo']}
                copyPaste={true}
                filters={true}
                search={true}
                fixedColumnsLeft={4} 
                afterChange={onAfterChange}
                licenseKey="non-commercial-and-evaluation"
                className="ht-theme-horizon"
            />
        </>
    );
}, (prev, next) => prev.data === next.data);

// --- 3. MAIN COMPONENT ---
export function EstatDatabaseGrid({ records, filters, academicYears }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [sheetMode, setSheetMode] = useState<string>('all'); 

    const rawData = records?.data || (Array.isArray(records) ? records : []);
    const gridData = useMemo(() => mapDataToGrid(rawData), [rawData]);

    // --- COLUMNS ---
    const columns = useMemo(() => [
        { data: 'id', title: 'ID', readOnly: true, width: 0.1 }, 
        { data: 'seq', title: '#', readOnly: true, width: 50, className: 'htCenter' },
        
        { data: 'award_number', title: 'Award Number', width: 150, className: 'htMiddle font-mono text-emerald-600 dark:text-emerald-400 font-bold' },
        { data: 'lrn', title: 'LRN', width: 120, className: 'htMiddle' }, 
        
        { data: 'lname', title: 'Last Name', width: 110 },
        { data: 'fname', title: 'First Name', width: 110 },
        { data: 'mname', title: 'Middle', width: 80 },
        { data: 'extension', title: 'Ext', width: 50 },
        
        { data: 'sex', title: 'Sex', width: 60, className: 'htCenter', editor: 'select', selectOptions: ['M', 'F'] },
        { data: 'birthdate', title: 'Birthdate', width: 100, type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'civil_status', title: 'Civil Status', width: 90, editor: 'select', selectOptions: ['Single', 'Married', 'Widowed', 'Separated'] },

        { data: 'hei_name', title: 'HEI Name', width: 200, readOnly: true },
        { data: 'program', title: 'Program', width: 180, readOnly: true },
        { data: 'year_level', title: 'Year', width: 60, className: 'htCenter', type: 'numeric' },
        { data: 'gwa', title: 'GWA', width: 60, className: 'htCenter', type: 'numeric' },
        
        { data: 'status', title: 'Status', width: 100, editor: 'select', selectOptions: ['ACTIVE', 'GRADUATED', 'TERMINATED', 'WAIVED', 'DEFERRED'] },
        { data: 'scholarship_type', title: 'Type', width: 100 },

        { data: 'is_pwd', title: 'PWD', width: 50, type: 'checkbox', className: 'htCenter' },
        { data: 'is_solo', title: 'Solo', width: 50, type: 'checkbox', className: 'htCenter' },
        { data: 'is_ip', title: 'IP', width: 50, type: 'checkbox', className: 'htCenter' },
        { data: 'group_type', title: 'Group Type', width: 110 }, 

        { data: 'province', title: 'Province', width: 120 },
        { data: 'city', title: 'City', width: 120 },
        { data: 'barangay', title: 'Barangay', width: 120 },
    ], []);

    const handleAfterChange = useCallback((changes: any, source: any) => {
        if (source !== 'loadData') setIsDirty(true);
    }, []);

    const handleSave = () => {
        if (!hotRef.current) return;
        const data = hotRef.current.hotInstance.getSourceData(); 
        setIsSaving(true);
        
        const validData = data.filter((row: any) => row.id !== null);

        if (validData.length === 0) {
            setIsSaving(false);
            return;
        }

        router.put(route('admin.estatskolar.bulkUpdate'), { records: validData }, {
            onSuccess: () => { 
                toast.success(`Saved ${validData.length} records!`); 
                setIsDirty(false); 
                setIsSaving(false); 
            },
            onError: () => { 
                toast.error("Save failed."); 
                setIsSaving(false); 
            }
        });
    };

    const handleSheetChange = (value: string) => {
        if (isDirty && !confirm("Unsaved changes. Discard?")) return;
        router.get(route('admin.estatistikolar.index'), { academic_year: value === 'all' ? null : value }, { preserveState: true, preserveScroll: true });
        setSheetMode(value);
    };

    const renderSheetTabs = () => {
        const tabs = academicYears || ['2024-2025'];
        const active = filters?.academic_year || 'all';

        return (
            <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 p-2 border-t dark:bg-zinc-900 dark:border-zinc-800 h-[45px]">
                <Button 
                    variant={active === 'all' ? "default" : "ghost"} 
                    size="sm" 
                    className={`h-8 text-xs ${active === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => handleSheetChange('all')}
                >
                    <Layers className="h-3 w-3 mr-2" /> All Records
                </Button>
                {tabs.map((ay: string) => (
                    <Button 
                        key={ay} 
                        variant={active === ay ? "default" : "ghost"} 
                        size="sm" 
                        className={`h-8 text-xs whitespace-nowrap ${active === ay ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => handleSheetChange(ay)}
                    >
                        <CalendarRange className="h-3 w-3 mr-1" /> {ay}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-auto min-h-[700px] dark:bg-zinc-950 dark:border-zinc-800 w-full overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-emerald-600"/> 
                            Estat Database Editor
                        </CardTitle>
                        <CardDescription>
                            Showing {gridData.length} records. {records?.total ? `(Total: ${records.total})` : ''}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                    <Layers className="h-4 w-4"/> View: {sheetMode === 'all' ? 'All Records' : sheetMode}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSheetChange('all')}>All Records</DropdownMenuItem>
                                {academicYears && academicYears.length > 0 && <DropdownMenuItem disabled>-- By Academic Year --</DropdownMenuItem>}
                                {academicYears?.map((ay: string) => (
                                    <DropdownMenuItem key={ay} onClick={() => handleSheetChange(ay)}>{ay}</DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={!isDirty || isSaving} 
                            className={isDirty ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} 
                            Save Changes
                        </Button>
                    </div>
                </div>
                
                {/* Active Filter Display */}
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>Active: </span>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
                        {filters?.academic_year || 'All Records'}
                    </Badge>
                    {filters?.hei_id && <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">HEI Filtered</Badge>}
                    {(filters?.academic_year || filters?.hei_id) && (
                        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs text-red-500 hover:text-red-700" onClick={() => router.get(route('admin.estatistikolar.index'))}>
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0 bg-white border-t border-b flex-1 dark:bg-zinc-950">
                <div className="w-full h-[650px] relative">
                    <MemoizedHotTable 
                        forwardRef={hotRef} 
                        data={gridData} 
                        columns={columns} 
                        onAfterChange={handleAfterChange} 
                    />
                </div>
                <div className="flex-1 overflow-hidden border-t bg-gray-50 dark:bg-zinc-900">
                    {renderSheetTabs()}
                </div>
            </CardContent>

            {records?.links && (
                <CardFooter className="py-2 bg-gray-50 dark:bg-zinc-900 border-t dark:border-zinc-800">
                    <PaginationLinks links={records.links} />
                </CardFooter>
            )}
        </Card>
    );
}