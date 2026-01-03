import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';

import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Save, Loader2, AlertTriangle, CheckCircle2, FileSpreadsheet, Layers, CalendarRange, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { FilterBar } from './FilterBar'; 
import { HyperFormula } from 'hyperformula';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

registerAllModules();

// --- DATA MAPPING ---
const mapDataToGrid = (records: any[]) => {
    if (!Array.isArray(records)) return [];
    
    const safeText = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string' || typeof val === 'number') return String(val);
        if (typeof val === 'object') return val.name || '';
        return '';
    };

    return records.map((record) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};
        const hei = record.hei || {};
        
        return {
            academic_record_id: record.id, 
            scholar_id: scholar.id,        
            
            // CSV Columns
            award_no: enrollment.award_number || '',
            scholarship_code: record.enrollment?.scholarship_type || '',
            
            family_name: scholar.family_name || '',
            given_name: scholar.given_name || '',
            middle_name: scholar.middle_name || '',
            sex: scholar.sex || '',
            
            // Address
            barangay: address.barangay_text || safeText(address.barangay) || '',
            town: safeText(address.city) || address.town_city || '',
            province: safeText(address.province) || '',
            district: safeText(address.district) || '',

            // Academics
            hei_name: hei.hei_name || '',
            program: record.course?.course_name || '',
            year_level: record.year_level || '',
            
            // Financials
            amount: record.grant_amount ? parseFloat(record.grant_amount) : 0,
            
            // Term
            semester: record.semester?.name || '',
            academic_year: record.academic_year?.name || '',
        };
    });
};

const MemoizedHotTable = memo(({ data, columns, onAfterChange, forwardRef }: any) => {
    return (
        <>
            <style>{`
                .dark .handsontable, .dark .wtHolder, .dark .ht_master .wtHolder, .dark .htCore {
                    background-color: #09090b !important; color: #e4e4e7 !important;
                }
                .dark .handsontable th {
                    background-color: #18181b !important; color: #a1a1aa !important; border-color: #27272a !important;
                }
                .dark .handsontable tbody tr td {
                    background-color: #09090b !important; color: #f8fafc !important; border-color: #27272a !important;
                }
                .dark .handsontable td.area {
                    background-color: rgba(59, 130, 246, 0.25) !important; border: 1px solid #3b82f6 !important;
                }
                .dark .htDropdownMenu, .dark .htContextMenu {
                    background-color: #18181b !important; border: 1px solid #27272a !important;
                }
                .dark .htUIInput input, .dark .htUISelect {
                    background-color: #09090b !important; color: #f8fafc !important; border: 1px solid #27272a !important;
                }
            `}</style>

            <HotTable
                ref={forwardRef}
                data={data}
                columns={columns}
                colHeaders={columns.map((c: any) => c.title)}
                rowHeaders={true}
                width="100%"
                height="600px" 
                colWidths={100} 
                manualColumnResize={true} 
                dropdownMenu={true}
                contextMenu={['copy', 'cut', '---------', 'undo', 'redo']}
                copyPaste={true}
                filters={true}
                search={true}
                selectionMode="multiple"
                afterChange={onAfterChange}
                licenseKey="non-commercial-and-evaluation"
                formulas={{ engine: HyperFormula }}
                className="ht-theme-horizon"
            />
        </>
    );
}, (prev, next) => prev.data === next.data);

// ✅ Ensure 'semesters' is destructured from props (it was correct before, but just to be safe)
export function StuFapsDatabaseGrid({ enrollments, filters, academicYears = [], semesters = [], heiList = [] }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [sheetMode, setSheetMode] = useState<string>('academic_year'); 

    const gridData = useMemo(() => mapDataToGrid(enrollments?.data || []), [enrollments]);
    
    // Columns based on your CSV structure
    const columns = useMemo(() => [
        { data: 'award_no', title: 'Award No', width: 140 },
        { 
        data: 'scholarship_code', 
        title: 'Scholarship Code',
        width: 150,
        className: 'htCenter'
    },
        { data: 'family_name', title: 'Last Name', width: 120 },
        { data: 'given_name', title: 'First Name', width: 120 },
        { data: 'middle_name', title: 'M.I.', width: 60 },
        { data: 'sex', title: 'Sex', width: 50 },
        
        { data: 'hei_name', title: 'HEI', width: 250 },
        { data: 'program', title: 'Program', width: 200 },
        { data: 'year_level', title: 'YL', width: 50 },
        
        { 
            data: 'amount', 
            title: 'Amount (₱)', 
            type: 'numeric', 
            numericFormat: { pattern: '0,0.00' },
            width: 120,
            className: 'htRight text-green-600 font-bold' 
        },

        { data: 'academic_year', title: 'A.Y.', width: 100 },
        { data: 'semester', title: 'Sem', width: 100 },
        { data: 'town', title: 'Municipality', width: 120 },
        { data: 'province', title: 'Province', width: 120 },
    ], []);

    const handleAfterChange = useCallback((changes: any, source: any) => {
        if (source !== 'loadData') setIsDirty(true);
    }, []);

    const handleSave = () => {
        if (!hotRef.current) return;
        const instance = hotRef.current.hotInstance;
        const tableData = instance?.getSourceData(); 

        if (!tableData || tableData.length === 0) {
            toast.error("No data to save.");
            return;
        }

        setIsSaving(true);
        router.post(route('admin.stufaps.bulk-update'), { enrollments: tableData }, {
            onSuccess: () => {
                toast.success("Records updated successfully!");
                setIsDirty(false);
                setIsSaving(false);
            },
            onError: () => {
                toast.error("Failed to save changes.");
                setIsSaving(false);
            }
        });
    };

    const handleSheetChange = (value: string) => {
        if (isDirty && !confirm("You have unsaved changes. Discard them?")) return;
        setIsDirty(false); 

        // Determine filter logic for Sheets
        const newFilters = { ...filters };
        
        if (sheetMode === 'academic_year') {
            newFilters.academic_year = value === 'all' ? null : value;
        } else if (sheetMode === 'semester') {
            newFilters.semester = value === 'all' ? null : value;
        }

        router.get(route('admin.stufaps.index'), { 
            ...newFilters,
            page: 1,
            limit: 3000 // Large load for sheet
        }, { preserveState: true, preserveScroll: true });
    };

    const renderSheetTabs = () => {
        let options: any[] = [];
        let activeValue = '';

        if (sheetMode === 'academic_year') {
            options = academicYears.map((ay: any) => ({ label: ay.name || ay, value: ay.name || ay }));
            activeValue = filters?.academic_year || 'all';
        } else if (sheetMode === 'semester') {
            options = semesters.map((s: any) => ({ label: s.name, value: String(s.id) }));
            activeValue = filters?.semester || 'all';
        }

        if (!activeValue) activeValue = 'all';

        return (
            <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 p-2 border-t border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 h-[45px]">
                <Button 
                    variant={activeValue === 'all' ? "default" : "ghost"} 
                    size="sm" 
                    className={`h-8 text-xs ${activeValue === 'all' ? 'bg-zinc-700 text-white' : 'dark:text-zinc-300'}`} 
                    onClick={() => handleSheetChange('all')}
                >
                    <LayoutList className="mr-2 h-3 w-3" /> All Records
                </Button>
                
                {options.map((opt) => (
                    <Button 
                        key={opt.value} 
                        variant={activeValue === opt.value ? "default" : "ghost"} 
                        size="sm" 
                        className={`h-8 text-xs min-w-[80px] whitespace-nowrap ${activeValue === opt.value ? 'bg-zinc-700 text-white' : ''}`} 
                        onClick={() => handleSheetChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-auto min-h-[700px] dark:bg-zinc-950 dark:border-zinc-800 w-full max-w-[100vw] overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            StuFAPs Editor
                        </CardTitle>
                        <CardDescription className="dark:text-zinc-400">
                            Showing {enrollments?.data?.length || 0} records.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {isDirty && <span className="text-xs text-amber-600 font-bold mr-2 self-center">Unsaved Changes</span>}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 dark:bg-zinc-900 dark:text-white dark:border-zinc-800">
                                    <Layers className="h-4 w-4" />
                                    {sheetMode === 'academic_year' ? 'View: A.Y.' : sheetMode === 'semester' ? 'View: Sem' : 'Sheets Off'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
                                <DropdownMenuItem onClick={() => setSheetMode('academic_year')}>
                                    <CalendarRange className="mr-2 h-4 w-4" /> By Academic Year
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('semester')}>
                                    <LayoutList className="mr-2 h-4 w-4" /> By Semester
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('none')}>
                                    Sheets Off
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={!isDirty || isSaving}
                            className={isDirty ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" : ""}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="mt-2">
                    {/* ✅ CRITICAL FIX: Pass 'semesters' prop to FilterBar */}
                    <FilterBar 
                        filters={filters} 
                        searchKey="search" 
                        academicYears={sheetMode === 'academic_year' ? [] : academicYears} 
                        semesters={sheetMode === 'semester' ? [] : semesters} // ✅ Added semesters
                        heiList={heiList} 
                        batches={[]} 
                        courses={[]}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0 bg-white border-t border-b flex-1 dark:bg-zinc-950 dark:border-zinc-800 w-full max-w-[100vw] overflow-hidden">
                <div className="w-full h-[600px] relative">
                    <MemoizedHotTable 
                        forwardRef={hotRef}
                        data={gridData}
                        columns={columns}
                        onAfterChange={handleAfterChange}
                    />
                </div>
                
                <div className="flex-1 overflow-hidden border-t bg-gray-50 dark:bg-zinc-900">
                    {sheetMode !== 'none' && renderSheetTabs()}
                </div>
            </CardContent>
        </Card>
    );
}