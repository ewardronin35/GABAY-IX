import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';

import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Save, Loader2, FileSpreadsheet, Layers, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { FilterBar } from './FilterBar';

registerAllModules();

const mapDataToGrid = (records: any[]) => {
    if (!Array.isArray(records) || records.length === 0) return [];
    const safeText = (val: any) => (val === null || val === undefined) ? '' : String(val);

    return records.map((record, index) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};

        return {
            id: record.id, 
            seq: index + 1,
            award_number: safeText(enrollment.award_number),
            lname: safeText(scholar.family_name),
            fname: safeText(scholar.given_name),
            mname: safeText(scholar.middle_name),
            ext: safeText(scholar.extension_name),
            sex: safeText(scholar.sex),
            city: safeText(address.town_city),
            province: safeText(address.province),
            hei_name: safeText(record.hei?.hei_name || enrollment.hei?.hei_name),
            course: safeText(record.course?.course_name),
            year_level: safeText(record.year_level),
            grant_amount: record.grant_amount || 0,
            status: safeText(enrollment.status),
        };
    });
};

// Memoized Table to prevent re-renders
const MemoizedHotTable = memo(({ data, columns, onAfterChange, forwardRef }: any) => (
    <>
        <style dangerouslySetInnerHTML={{__html: `
            .dark .handsontable { background-color: #09090b !important; color: #e4e4e7 !important; border: none; }
            .dark .handsontable th { background-color: #18181b !important; color: #a1a1aa !important; border-color: #27272a !important; font-weight: 600; }
            .dark .handsontable tr:nth-child(even) td { background-color: #09090b !important; }
            .dark .handsontable tr:nth-child(odd) td { background-color: #0c0a09 !important; }
            .dark .handsontable td { color: #f8fafc !important; border-color: #27272a !important; }
            .dark .ht_clone_top { z-index: 100 !important; }
            .dark .handsontable .htDimmed { color: #71717a !important; }
        `}} />
        <HotTable
            ref={forwardRef} data={data} columns={columns} colHeaders={columns.map((c: any) => c.title)}
            rowHeaders={true} width="100%" height="600px" manualColumnResize={true} 
            dropdownMenu={true} filters={true} fixedColumnsLeft={4} afterChange={onAfterChange}
            licenseKey="non-commercial-and-evaluation" className="ht-theme-horizon"
        />
    </>
), (prev, next) => prev.data === next.data);

// ✅ Updated Props to include 'heiList' for the FilterBar
export function CoschoDatabaseGrid({ records, filters, academicYears, heiList }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [sheetMode, setSheetMode] = useState<string>(filters?.academic_year || 'all'); 

    const gridData = useMemo(() => mapDataToGrid(records?.data || []), [records?.data]);

    const columns = useMemo(() => [
        { data: 'id', title: 'ID', readOnly: true, width: 0.1 }, 
        { data: 'seq', title: '#', readOnly: true, width: 50, className: 'htCenter htMiddle' },
        { data: 'award_number', title: 'Award Number', width: 160, className: 'htMiddle font-mono text-blue-600 font-bold' },
        { data: 'lname', title: 'Last Name', width: 140, className: 'htMiddle uppercase' },
        { data: 'fname', title: 'First Name', width: 140, className: 'htMiddle uppercase' },
        { data: 'mname', title: 'Middle', width: 90, className: 'htMiddle' },
        { data: 'ext', title: 'Ext', width: 50, className: 'htCenter htMiddle' },
        { data: 'sex', title: 'Sex', width: 60, className: 'htCenter htMiddle', editor: 'select', selectOptions: ['M', 'F'] },
        { data: 'city', title: 'City', width: 140, className: 'htMiddle' },
        { data: 'province', title: 'Province', width: 140, className: 'htMiddle' },
        { data: 'hei_name', title: 'HEI Name', width: 300, readOnly: true, className: 'htMiddle' }, 
        { data: 'course', title: 'Course', width: 280, readOnly: true, className: 'htMiddle' }, 
        { data: 'year_level', title: 'Year', width: 70, className: 'htCenter htMiddle', type: 'numeric' },
        { 
            data: 'grant_amount', title: 'Grant Amount', width: 130, 
            type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htRight htMiddle text-emerald-600 font-bold' 
        },
        { data: 'status', title: 'Status', width: 120, className: 'htCenter htMiddle', editor: 'select', selectOptions: ['ACTIVE', 'GRADUATED', 'TERMINATED', 'WAIVED'] },
    ], []);

    const handleAfterChange = useCallback((changes: any, source: any) => {
        if (source !== 'loadData') setIsDirty(true);
    }, []);

    const handleSave = () => {
        if (!hotRef.current) return;
        const data = hotRef.current.hotInstance.getSourceData(); 
        setIsSaving(true);
        const validData = data.filter((row: any) => row.id !== null);

        if (validData.length === 0) { setIsSaving(false); return; }

        router.put(route('admin.coscho.bulkUpdate'), { records: validData }, {
            onSuccess: () => { toast.success(`Saved ${validData.length} records!`); setIsDirty(false); setIsSaving(false); },
            onError: () => { toast.error("Save failed."); setIsSaving(false); }
        });
    };

    const handleSheetChange = (value: string) => {
        router.get(route('admin.coscho.index'), { academic_year: value === 'all' ? null : value }, { preserveState: true, preserveScroll: true });
        setSheetMode(value);
    };

    return (
        <div className="space-y-4">
            {/* ✅ FILTER BAR ADDED HERE */}
            <Card className="p-2 dark:bg-zinc-950 border-none shadow-none">
                <FilterBar 
                    filters={filters} 
                    academicYears={academicYears} 
                    heiList={heiList} 
                    searchKey="search"
                    semesters={[]}
                    batches={[]}
                />
            </Card>

            <Card className="flex flex-col h-auto min-h-[700px] dark:bg-zinc-950 border-none shadow-none w-full overflow-hidden">
                <CardHeader className="pb-2 px-0">
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-4">
                            <CardTitle className="flex gap-2 items-center text-lg">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600"/> Database Editor
                            </CardTitle>
                        </div>

                        <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving} className={isDirty ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20" : "opacity-50"}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} 
                            Save Changes
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 border-t border-b flex-1 dark:bg-zinc-950 relative">
                    <div className="w-full h-[600px]">
                        <MemoizedHotTable forwardRef={hotRef} data={gridData} columns={columns} onAfterChange={handleAfterChange} />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto bg-slate-50 dark:bg-zinc-900 p-2 border-t h-[50px]">
                        <span className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-1">
                            <Layers className="h-3 w-3" /> Sheets:
                        </span>
                        <Button 
                            variant={sheetMode === 'all' ? "default" : "ghost"} 
                            size="sm" 
                            className={`h-8 text-xs ${sheetMode === 'all' ? 'bg-slate-800 text-white' : 'hover:bg-slate-200 dark:hover:bg-zinc-800'}`} 
                            onClick={() => handleSheetChange('all')}
                        >
                            All Records
                        </Button>
                        <div className="h-4 w-[1px] bg-slate-300 dark:bg-zinc-700 mx-1"></div>
                        {academicYears?.map((ay: string) => (
                            <Button 
                                key={ay} 
                                variant={filters?.academic_year === ay ? "default" : "ghost"} 
                                size="sm" 
                                className={`h-8 text-xs ${filters?.academic_year === ay ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-slate-600 dark:text-slate-400 dark:hover:bg-zinc-800'}`}
                                onClick={() => handleSheetChange(ay)}
                            >
                                <CalendarRange className="h-3 w-3 mr-1 opacity-70" /> {ay}
                            </Button>
                        ))}
                    </div>
                </CardContent>
                
                {records?.links && <CardFooter className="py-2"><PaginationLinks links={records.links} /></CardFooter>}
            </Card>
        </div>
    );
}