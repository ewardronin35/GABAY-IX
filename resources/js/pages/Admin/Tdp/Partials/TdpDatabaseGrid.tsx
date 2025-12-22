// resources/js/pages/Admin/Tdp/Partials/TdpDatabaseGrid.tsx



import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Upload, Loader2, Trash2, FileSpreadsheet, LayoutList, CalendarRange, Layers, Search, Sigma } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { FilterBar } from './FilterBar'; 
import { HyperFormula } from 'hyperformula';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

registerAllModules();

// --- HELPER: DATA MAPPING ---
const mapDataToGrid = (records: any[]) => {
    if (!Array.isArray(records)) return [];
    
    return records.map((record) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};
        const hei = record.hei || {};
        const billing = record.billing_record || record.billingRecord || {};
        const validatedByUser = billing.validated_by || billing.validatedBy || {};
        
        const districtObj = address.district || {};
        const addrCityObj = address.city || {}; 
        const addrBrgyObj = address.barangay || {};
        const heiCityObj = hei.city || {};
        const heiProvince = hei.province || {};
        const heiDistrict = hei.district || {};

        return {
            academic_record_id: record.id, 
            scholar_id: scholar.id,        
            seq: record.seq || '',
            app_no: record.app_no || enrollment.application_number || '', 
            award_no: enrollment.award_number || '',
            hei_uii: hei.uii || hei.hei_code || '', 
            hei_name: hei.hei_name || '',
            hei_type: hei.type_of_heis || '', 
            hei_city: heiCityObj.name || hei.city_municipality || '', 
            hei_province: heiProvince.province_name || heiProvince.name || '', 
            hei_district: heiDistrict.district_name || heiDistrict.name || '',
            region: heiProvince.region_code || 'Region IX',
            family_name: scholar.family_name || '',
            given_name: scholar.given_name || '',
            middle_name: scholar.middle_name || '',
            extension_name: scholar.extension_name || '',
            sex: scholar.sex || '',
            // FIX: Force String for Mobile Number to prevent formatting issues
            contact_no: scholar.contact_no ? String(scholar.contact_no) : '', 
            email_address: scholar.email_address || '',
            specific_address: address.specific_address || '',
            barangay: address.barangay_text || addrBrgyObj?.barangay || addrBrgyObj?.name || address.barangay || '',
            city_municipality: addrCityObj.name || addrCityObj.city_name || address.town_city || '',
            province: address.province || '',
            district: address.congressional_district || '',
            zip_code: address.zip_code || '',
            course_name: record.course?.course_name || '',
            year_level: record.year_level || '',
            semester: record.semester?.name || '',
            academic_year: record.academic_year?.name || '',
            batch: record.batch_no || '',
            validation_status: record.payment_status || billing.status || 'Pending',
            endorsed_by: record.endorsed_by || districtObj.representative || '',
            program_name: enrollment.program?.program_name || 'TDP',
            billing_amount: billing.billing_amount ? parseFloat(billing.billing_amount) : 0,
            tdp_grant: record.grant_amount ? parseFloat(record.grant_amount) : 0,
            billing_status: billing.status || '', 
            date_fund_request: billing.date_fund_request || '',
            date_sub_aro: billing.date_sub_aro || '',
            date_nta: billing.date_nta || '',
            date_disbursed_to_hei: billing.date_disbursed_hei || '',
            date_paid: billing.date_disbursed_grantee || record.disbursement_date || '', 
            validated_by: validatedByUser.name || '',
        };
    });
};

// --- 2. MEMOIZED TABLE ---
const MemoizedHotTable = memo(({ data, columns, onSelection, onAfterChange, forwardRef }: any) => {
    return (
        <>
            {/* ✅ CSS FIXES FOR DARK MODE & MOBILE */}
            <style>{`
                /* 1. Main Container Background (Covers empty space) */
                .dark .handsontable, 
                .dark .wtHolder, 
                .dark .ht_master .wtHolder,
                .dark .htCore {
                    background-color: #09090b !important; /* Zinc 950 */
                    color: #e4e4e7 !important; /* Zinc 200 */
                }

                /* 2. Headers */
                .dark .handsontable th,
                .dark .ht_clone_top th, 
                .dark .ht_clone_left th, 
                .dark .ht_clone_top_left_corner th {
                    background-color: #18181b !important; /* Zinc 900 */
                    color: #a1a1aa !important; /* Zinc 400 */
                    border-color: #27272a !important;
                    border-bottom: 1px solid #27272a !important;
                    border-right: 1px solid #27272a !important;
                    font-weight: 600;
                }

                /* 3. Cells */
                .dark .handsontable tbody tr td {
                    background-color: #09090b !important;
                    color: #f8fafc !important;
                    border-bottom: 1px solid #27272a !important;
                    border-right: 1px solid #27272a !important;
                }

                /* 4. Active/Selected Cell Highlight (Blue Tint) */
                .dark .handsontable td.area {
                    background-color: rgba(59, 130, 246, 0.25) !important; 
                    border: 1px solid #3b82f6 !important; 
                }
                
                /* 5. Dropdown / Context Menus (Fix for "Mobile" tap menus) */
                .dark .htDropdownMenu, 
                .dark .htContextMenu {
                    background-color: #18181b !important; /* Zinc 900 */
                    border: 1px solid #27272a !important;
                    padding: 4px !important;
                }
                .dark .htDropdownMenu table.htCore,
                .dark .htContextMenu table.htCore {
                    background-color: #18181b !important;
                    border: none !important;
                }
                .dark .htItemWrapper:hover {
                    background-color: #27272a !important; /* Hover state */
                    color: #fff !important;
                    cursor: pointer;
                }

                /* 6. Filter Inputs inside Dropdowns */
                .dark .htUIInput input, 
                .dark .htUISelect {
                    background-color: #09090b !important;
                    color: #f8fafc !important;
                    border: 1px solid #27272a !important;
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
                
                // Uniform Width
                colWidths={180} 
                manualColumnResize={true} 
                
                renderAllRows={false}
                viewportRowRenderingOffset={50}
                autoRowSize={false}
                autoColumnSize={false}
                minSpareRows={1}
                
                dropdownMenu={true}
                contextMenu={['copy', 'cut', 'paste', '---------', 'row_above', 'row_below', 'remove_row', 'undo', 'redo']}
                copyPaste={true}
                filters={true}
                search={true}
                selectionMode="multiple"
                outsideClickDeselects={false}
                
                afterSelectionEnd={onSelection} 
                afterChange={onAfterChange}
                
                licenseKey="non-commercial-and-evaluation"
                formulas={{ engine: HyperFormula }}
                className="ht-theme-horizon"
            />
        </>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.data === nextProps.data && 
        prevProps.columns === nextProps.columns
    );
});

// --- 3. MAIN COMPONENT ---
export function TdpDatabaseGrid({
    databaseData,
    filters,
    academicYears,
    semesters,
    batches,
    heiList,
    courses
}: any) {
    const hotRef = useRef<HotTableClass>(null);
    
    // State
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sheetMode, setSheetMode] = useState<string>('batch'); 
    
    const [activeCellVal, setActiveCellVal] = useState('');
    const [activeCoords, setActiveCoords] = useState<{r: number, c: number} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Memoize Data
    const gridData = useMemo(() => mapDataToGrid(databaseData?.data || []), [databaseData?.data]);
    const paginationLinks = databaseData?.meta?.links || [];

    // 2. Memoize Columns
    const columns = useMemo(() => [
        { data: 'seq', title: 'SEQ' },
        { data: 'region', title: 'Region' },
        { data: 'semester', title: 'Semester' },
        { data: 'academic_year', title: 'A.Y.' },
        { data: 'hei_uii', title: 'HEI UII' }, 
        { data: 'hei_name', title: 'HEI Name' },
        { data: 'hei_type', title: 'HEI Type' },
        { data: 'hei_city', title: 'HEI City' },
        { data: 'hei_province', title: 'HEI Province' },
        { data: 'hei_district', title: 'HEI District' },
        { data: 'app_no', title: 'App No.' },
        { data: 'award_no', title: 'Award No.' },
        { data: 'batch', title: 'Batch' },
        { data: 'family_name', title: 'Last Name' },
        { data: 'given_name', title: 'First Name' },
        { data: 'middle_name', title: 'M.I.' },
        { data: 'extension_name', title: 'Ext' },
        { data: 'sex', title: 'Sex', type: 'dropdown', source: ['M', 'F'] },
        { data: 'province', title: 'Province' },
        { data: 'city_municipality', title: 'City/Mun' },
        { data: 'district', title: 'District' },
        { data: 'zip_code', title: 'Zip' },
        { data: 'specific_address', title: 'Specific Addr' },
        { data: 'barangay', title: 'Barangay' },
        { data: 'email_address', title: 'Email' },
        { data: 'contact_no', title: 'Contact' },
        { data: 'course_name', title: 'Course' },
        { data: 'year_level', title: 'Year' },
        { data: 'endorsed_by', title: 'Representative' },
        { data: 'validation_status', title: 'Status (Pmt)' },
        { data: 'program_name', title: 'Program' },
        { data: 'billing_status', title: 'Status Bill' },
        { data: 'validated_by', title: 'Validated By', readOnly: true },
        { data: 'date_fund_request', title: 'Fund Req', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'date_sub_aro', title: 'Sub-ARO', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'date_nta', title: 'NTA', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'date_disbursed_to_hei', title: 'Disb HEI', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'date_paid', title: 'Disb Grantee', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
        { data: 'billing_amount', title: 'Billing Amt', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { data: 'tdp_grant', title: 'Grant Amt', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
    ], []);

    // Event Handlers
    const handleSelection = useCallback((r: number, c: number, r2: number, c2: number) => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;
        const rawValue = hot.getSourceDataAtCell(r, c);
        setActiveCellVal(rawValue !== null && rawValue !== undefined ? String(rawValue) : '');
        setActiveCoords({ r, c });
        const selectedRecordIds: number[] = [];
        const startRow = Math.min(r, r2);
        const endRow = Math.max(r, r2);
        if (endRow - startRow < 1000) {
            for (let i = startRow; i <= endRow; i++) {
                const physicalRow = hot.toPhysicalRow(i);
                const sourceData = hot.getSourceDataAtRow(physicalRow) as any;
                if (sourceData && sourceData.academic_record_id) {
                    selectedRecordIds.push(sourceData.academic_record_id);
                }
            }
            setSelectedIds(selectedRecordIds);
        }
    }, []);

    const handleAfterChange = useCallback((changes: any, source: any) => {
        if (source !== 'loadData') {
            setIsDirty(true);
        }
    }, []);

    const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setActiveCellVal(val);
        if (activeCoords && hotRef.current?.hotInstance) {
            hotRef.current.hotInstance.setDataAtCell(activeCoords.r, activeCoords.c, val);
        }
    };

    const handleSave = useCallback(() => {
        if (!hotRef.current?.hotInstance) return;
        const hot = hotRef.current.hotInstance;
        const rawData = hot.getSourceData();
        const cleanedData = rawData.filter((row: any) => {
            if (!row) return false;
            const isExisting = row.academic_record_id && row.scholar_id;
            const hasName = (row.family_name && row.family_name.trim() !== '') || 
                            (row.given_name && row.given_name.trim() !== '');
            const isNew = !row.academic_record_id && hasName;
            if (isNew) {
                 if (filters?.batch_no && !row.batch) row.batch = filters.batch_no;
                 if (filters?.academic_year && !row.academic_year) row.academic_year = filters.academic_year;
                 if (filters?.semester && !row.semester) {
                    const sem = semesters.find((s: any) => String(s.id) === filters.semester);
                    if(sem) row.semester = sem.name; 
                 }
            }
            return isExisting || isNew;
        }).map((row: any) => {
            const cleanNumber = (val: any) => {
                if (val === null || val === undefined || val === '') return null;
                const strVal = String(val).replace(/,/g, ''); 
                return isNaN(Number(strVal)) ? null : parseFloat(strVal);
            };
            return {
                ...row,
                contact_no: row.contact_no ? String(row.contact_no).substring(0, 20) : null,
                tdp_grant: cleanNumber(row.tdp_grant),
                billing_amount: cleanNumber(row.billing_amount),
                year_level: row.year_level ? String(row.year_level) : null,
            };
        });

        if (cleanedData.length === 0) {
            toast.warning("No valid data to save.");
            return;
        }
        setIsSaving(true);
        router.post(route('superadmin.tdp.bulk-update'), { enrollments: cleanedData }, {
            preserveScroll: true,
            onSuccess: () => { 
                toast.success('Saved successfully!'); 
                setIsDirty(false); 
            },
            onError: (err) => { 
                console.error("Save Error:", err);
                const firstError = Object.values(err)[0];
                toast.error(`Update failed: ${firstError}`); 
            },
            onFinish: () => setIsSaving(false),
        });
    }, [filters, semesters]);

    const handleDelete = () => {
        if (selectedIds.length === 0) {
            toast.warning("No saved records selected for deletion.");
            return;
        }
        if (!confirm(`Delete ${selectedIds.length} records?`)) return;
        setIsDeleting(true);
        router.post(route('superadmin.tdp.bulk-destroy'), { ids: selectedIds }, {
            preserveScroll: true,
            onSuccess: () => { 
                toast.success('Deleted!'); 
                setSelectedIds([]); 
                hotRef.current?.hotInstance?.deselectCell(); 
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleSheetChange = (value: string) => {
        let filterKey = '';
        switch(sheetMode) {
            case 'batch': filterKey = 'batch_no'; break;
            case 'academic_year': filterKey = 'academic_year'; break;
            case 'semester': filterKey = 'semester'; break;
        }
        router.get(route('superadmin.tdp.index'), { ...filters, [filterKey]: value }, {
            preserveState: true, preserveScroll: true, only: ['databaseEnrollments', 'filters']
        });
    };

    useEffect(() => {
        const hot = hotRef.current?.hotInstance;
        if (hot) {
            const searchPlugin = hot.getPlugin('search');
            searchPlugin.query(searchQuery);
            hot.render();
        }
    }, [searchQuery]);

    // Sheet Tabs
    const renderSheetTabs = () => {
        let options: any[] = [];
        let activeValue = '';
        
        if (sheetMode === 'batch' && batches) {
            options = batches.map((b: any) => ({ label: `Batch ${b}`, value: String(b) }));
            activeValue = filters?.batch_no || '';
        } else if (sheetMode === 'academic_year' && academicYears) {
            options = academicYears.map((ay: any) => ({ label: ay, value: ay }));
            activeValue = filters?.academic_year || '';
        } else if (sheetMode === 'semester' && semesters) {
            options = semesters.map((s: any) => ({ label: s.name, value: String(s.id) }));
            activeValue = filters?.semester || '';
        }

        return (
            <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 p-2 rounded-b-lg border-t border-gray-200 mt-0 dark:bg-zinc-900 dark:border-zinc-800">
                <Button 
                    variant={!activeValue ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 text-xs dark:text-zinc-300 hover:dark:bg-zinc-800" 
                    onClick={() => handleSheetChange('')}
                >
                    <LayoutList className="mr-2 h-3 w-3" /> All
                </Button>
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={activeValue === opt.value ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 text-xs min-w-[80px] ${activeValue === opt.value ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'hover:bg-gray-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
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
                        <CardTitle className="dark:text-white">TDP Masterlist Database</CardTitle>
                        <CardDescription className="dark:text-zinc-400">Manage TDP scholars, payments, and enrollment data.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isDirty && <span className="text-xs text-amber-600 font-bold mr-2">Unsaved Changes</span>}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 dark:bg-zinc-900 dark:text-white dark:border-zinc-800">
                                    <Layers className="h-4 w-4" />
                                    {sheetMode === 'batch' ? 'View: Batch' : 
                                     sheetMode === 'academic_year' ? 'View: A.Y.' : 
                                     sheetMode === 'semester' ? 'View: Sem' : 'Sheets Off'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
                                <DropdownMenuItem onClick={() => setSheetMode('batch')}><FileSpreadsheet className="mr-2 h-4 w-4" /> By Batch</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('academic_year')}><CalendarRange className="mr-2 h-4 w-4" /> By A.Y.</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('semester')}><LayoutList className="mr-2 h-4 w-4" /> By Semester</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('none')}>Sheets Off</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || selectedIds.length === 0}>
                            {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                </div>

                {/* FORMULA BAR */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded border border-gray-300 mt-2 dark:bg-zinc-900 dark:border-zinc-800">
                    <div className="flex items-center text-muted-foreground px-2 border-r gap-1 min-w-[60px] justify-center bg-gray-100 h-full dark:bg-zinc-800 dark:border-zinc-800">
                        <Sigma className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300">
                            {activeCoords ? `${String.fromCharCode(65 + activeCoords.c)}${activeCoords.r + 1}` : ''}
                        </span>
                    </div>
                    <Input 
                        className="h-8 border-0 shadow-none focus-visible:ring-0 bg-transparent flex-1 font-mono text-sm dark:text-white"
                        placeholder="Enter value or formula (e.g. =SUM(A1:A5))"
                        value={activeCellVal}
                        onChange={handleFormulaChange}
                    />
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            className="h-8 pl-8 text-xs dark:bg-zinc-800 dark:border-zinc-800 dark:text-white"
                            placeholder="Search grid..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-2">
                    <FilterBar filters={filters} searchKey="search_db" academicYears={academicYears} semesters={semesters} batches={batches} heiList={heiList} courses={courses} />
                </div>
            </CardHeader>

            {/* CONTAINER WITH MOBILE FIX: max-w-full overflow-hidden */}
            <CardContent className="p-0 bg-white border-t border-b flex-1 dark:bg-zinc-950 dark:border-zinc-800 w-full max-w-[100vw] overflow-hidden">
                <div className="w-full h-[600px] relative">
                    <MemoizedHotTable 
                        forwardRef={hotRef}
                        data={gridData}
                        columns={columns}
                        onSelection={handleSelection}
                        onAfterChange={handleAfterChange}
                    />
                </div>
                
                {sheetMode !== 'none' && renderSheetTabs()}
                
                <div className="p-2 bg-gray-50 dark:bg-zinc-900">
                    <PaginationLinks links={paginationLinks} />
                </div>
            </CardContent>
        </Card>
    );
}