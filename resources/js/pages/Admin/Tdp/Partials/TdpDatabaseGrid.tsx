// resources/js/pages/Admin/Tdp/Partials/TdpDatabaseGrid.tsx

import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';

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

// --- 1. HELPER: DATA MAPPING ---
const mapDataToGrid = (records: any[]) => {
    if (!Array.isArray(records)) return [];
    
    return records.map((record) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};
        const hei = record.hei || {};
        const billing = record.billing_record || record.billingRecord || {};
        const validatedByUser = billing.validated_by || billing.validatedBy || {};
        
        const addrCityObj = address.city || {}; 
        const addrBrgyObj = address.barangay || {};
        const heiCityObj = hei.city || {};
        const heiProvince = hei.province || {};
        const heiDistrict = hei.district || {};

        return {
            academic_record_id: record.id, 
            scholar_id: scholar.id,        

            // Identifiers
            seq: record.seq || '',
            app_no: record.app_no || enrollment.application_number || '', 
            award_no: enrollment.award_number || '',
            
            // HEI Data
                 hei_uii: hei.uii || hei.hei_code || '', 
            hei_name: hei.hei_name || '',
            hei_type: hei.type_of_heis || '', 
            hei_city: heiCityObj.name || hei.city_municipality || '', 
            hei_province: heiProvince.province_name || heiProvince.name || '', 
            hei_district: heiDistrict.district_name || heiDistrict.name || '',
            region: heiProvince.region_code || 'Region IX',

            // Scholar Data
            family_name: scholar.family_name || '',
            given_name: scholar.given_name || '',
            middle_name: scholar.middle_name || '',
            extension_name: scholar.extension_name || '',
            sex: scholar.sex || '',
            contact_no: scholar.contact_no || '',
            email_address: scholar.email_address || '',
            
            // Address Data
            specific_address: address.specific_address || '',
            barangay: addrBrgyObj.name || addrBrgyObj.barangay_name || address.barangay || '', 
            city_municipality: addrCityObj.name || addrCityObj.city_name || address.town_city || '',
            province: address.province || '',
            district: address.congressional_district || '',
            zip_code: address.zip_code || '',

            // Academic
            course_name: record.course?.course_name || '',
            year_level: record.year_level || '',
            semester: record.semester?.name || '',
            academic_year: record.academic_year?.name || '',
            batch: record.batch_no || '',
            
            // Status
            validation_status: record.payment_status || '',
            endorsed_by: record.endorsed_by || '', 
            program_name: enrollment.program?.program_name || 'TDP',
            
            // Billing
            billing_amount: billing.billing_amount ? parseFloat(billing.billing_amount) : 0,
            tdp_grant: record.grant_amount ? parseFloat(record.grant_amount) : 0,
            billing_status: billing.status || '', 
            
            // Dates
            date_fund_request: billing.date_fund_request || '',
            date_sub_aro: billing.date_sub_aro || '',
            date_nta: billing.date_nta || '',
            date_disbursed_to_hei: billing.date_disbursed_hei || '',
            date_paid: billing.date_disbursed_grantee || record.disbursement_date || '', 

            validated_by: validatedByUser.name || '',
        };
    });
};

// --- 2. ISOLATED TABLE COMPONENT ---
const MemoizedHotTable = memo(({ data, columns, onSelection, onAfterChange, forwardRef }: any) => {
    return (
        <HotTable
            ref={forwardRef}
            data={data}
            columns={columns}
            colHeaders={columns.map((c: any) => c.title)}
            rowHeaders={true}
            width="100%"
            height="600px" 
            minSpareRows={1} 
            licenseKey="non-commercial-and-evaluation"
            fixedColumnsStart={4}
            manualColumnResize={true}
            manualRowResize={true}
            autoRowSize={false} 
            autoColumnSize={false} 
            renderAllRows={false}
            viewportRowRenderingOffset={20}
            dropdownMenu={true}
            filters={true}
            search={true}
            selectionMode="multiple"
            outsideClickDeselects={false}
            afterSelectionEnd={onSelection} 
            afterChange={onAfterChange}
            formulas={{ engine: HyperFormula }}
            // Apply the Horizon theme class
            className="ht-theme-horizon"
        />
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
    
    // --- STATE ---
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sheetMode, setSheetMode] = useState<string>('batch'); 
    
    // Formula Bar State
    const [activeCellVal, setActiveCellVal] = useState('');
    const [activeCoords, setActiveCoords] = useState<{r: number, c: number} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Memoize Data
    const gridData = useMemo(() => mapDataToGrid(databaseData?.data || []), [databaseData?.data]);
    const paginationLinks = databaseData?.meta?.links || [];

    // --- THEME EFFECT (Enforce Horizon) ---
    useEffect(() => {
        if (hotRef.current?.hotInstance) {
            // @ts-ignore - useTheme is available in newer versions
            if (typeof hotRef.current.hotInstance.useTheme === 'function') {
                // @ts-ignore
                hotRef.current.hotInstance.useTheme('ht-theme-horizon');
            }
        }
    }, []);

    // Search Effect
    useEffect(() => {
        const hot = hotRef.current?.hotInstance;
        if (hot) {
            const searchPlugin = hot.getPlugin('search');
            searchPlugin.query(searchQuery);
            hot.render();
        }
    }, [searchQuery]);

    // --- COLUMN DEFINITIONS (Requested Array) ---
    const columns = useMemo(() => [
        { data: 'seq', title: 'SEQ', width: 50 },
        { data: 'region', title: 'Region' },
        { data: 'semester', title: 'Semester', },
        { data: 'academic_year', title: 'A.Y.', width: 100 },
        
         
        { data: 'hei_uii', title: 'HEI UII',  width: 100 }, 
        { data: 'hei_name', title: 'HEI Name',  width: 200 },
        { data: 'hei_type', title: 'HEI Type',  width: 80 },
        { data: 'hei_city', title: 'HEI City', width: 120 },
        { data: 'hei_province', title: 'HEI Province', width: 120 },
        { data: 'hei_district', title: 'HEI District',  width: 100 },

        { data: 'app_no', title: 'App No.', width: 100 },
        { data: 'award_no', title: 'Award No.', width: 100 },
        { data: 'batch', title: 'Batch', width: 60 },

        { data: 'family_name', title: 'Last Name', width: 120 },
        { data: 'given_name', title: 'First Name', width: 120 },
        { data: 'middle_name', title: 'M.I.', width: 50 },
        { data: 'extension_name', title: 'Ext', width: 50 },
        { data: 'sex', title: 'Sex', width: 50, type: 'dropdown', source: ['M', 'F'] },

        { data: 'province', title: 'Province', width: 120 },
        { data: 'city_municipality', title: 'City/Mun', width: 120 },
        { data: 'district', title: 'District', width: 100 },
        { data: 'zip_code', title: 'Zip', width: 70 },
        { data: 'specific_address', title: 'Specific Addr', width: 180 },
        { data: 'barangay', title: 'Barangay', width: 120 },

        { data: 'email_address', title: 'Email', width: 180 },
        { data: 'contact_no', title: 'Contact', width: 100 },

        { data: 'course_name', title: 'Course',  width: 180 },
        { data: 'year_level', title: 'Year', width: 60 },
        { data: 'endorsed_by', title: 'Representative', width: 120 },
        { data: 'validation_status', title: 'Status (Pmt)', width: 100 },
        { data: 'program_name', title: 'Program',  width: 80 },

        { data: 'billing_status', title: 'Status Bill', width: 100 },
        { data: 'validated_by', title: 'Validated By', readOnly: true, width: 120 },
        
        { data: 'date_fund_request', title: 'Fund Req', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: 100 },
        { data: 'date_sub_aro', title: 'Sub-ARO', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: 100 },
        { data: 'date_nta', title: 'NTA', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: 100 },
        { data: 'date_disbursed_to_hei', title: 'Disb HEI', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: 100 },
        { data: 'date_paid', title: 'Disb Grantee', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true, width: 100 },

        { data: 'billing_amount', title: 'Billing Amt', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 100 },
        { data: 'tdp_grant', title: 'Grant Amt', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 100 },
    ], []);

    // --- HANDLERS ---

    const handleSelection = (r: number, c: number, r2: number, c2: number) => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const rawValue = hot.getSourceDataAtCell(r, c);
        setActiveCellVal(rawValue !== null && rawValue !== undefined ? String(rawValue) : '');
        setActiveCoords({ r, c });

        const selectedRecordIds: number[] = [];
        const startRow = Math.min(r, r2);
        const endRow = Math.max(r, r2);
        for (let i = startRow; i <= endRow; i++) {
            const physicalRow = hot.toPhysicalRow(i);
            const sourceData = hot.getSourceDataAtRow(physicalRow) as any;
            if (sourceData && sourceData.academic_record_id) {
                selectedRecordIds.push(sourceData.academic_record_id);
            }
        }
        setSelectedIds(selectedRecordIds);
    };

    const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setActiveCellVal(val);
        if (activeCoords && hotRef.current?.hotInstance) {
            hotRef.current.hotInstance.setDataAtCell(activeCoords.r, activeCoords.c, val);
        }
    };

    const handleAfterChange = (changes: any, source: any) => {
        if (source !== 'loadData') setIsDirty(true);
    };

    const handleSave = useCallback(() => {
        if (!hotRef.current?.hotInstance) return;
        const rawData = hotRef.current.hotInstance.getSourceData();

        const cleanedData = rawData.filter((row: any) => {
            const isExisting = row && row.academic_record_id && row.scholar_id;
            const isNew = row && !row.academic_record_id && (row.family_name || row.last_name);
            if (isNew) {
                 if (!row.family_name && row.last_name) row.family_name = row.last_name;
                 if (!row.given_name && row.first_name) row.given_name = row.first_name;
                 if (filters?.batch_no) row.batch = filters.batch_no;
                 if (filters?.academic_year) row.academic_year = filters.academic_year;
                 if (filters?.semester) {
                    const sem = semesters.find((s: any) => String(s.id) === filters.semester);
                    if(sem) row.semester = sem.name; 
                 }
            }
            return isExisting || isNew;
        }).map((row: any) => ({
            ...row,
            contact_no: row.contact_no ? String(row.contact_no).substring(0, 20) : null,
            tdp_grant: row.tdp_grant ? parseFloat(String(row.tdp_grant)) : null,
            year_level: row.year_level ? String(row.year_level) : null,
        }));

        if (cleanedData.length === 0) {
            toast.warning("No valid data to save.");
            return;
        }

        setIsSaving(true);
        router.post(route('superadmin.tdp.bulk-update'), { enrollments: cleanedData }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Saved successfully!'); setIsDirty(false); },
            onError: (err) => { 
                const msg = err && typeof err === 'object' ? Object.values(err)[0] : 'Unknown error';
                toast.error(`Update failed: ${msg}`); 
                setIsSaving(false); 
            },
            onFinish: () => setIsSaving(false),
        });
    }, [filters, semesters]);

    const handleDelete = () => {
        if (selectedIds.length === 0 || !confirm(`Delete ${selectedIds.length} records?`)) return;
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

    const renderSheetTabs = () => {
        let options: any[] = [];
        let activeValue = '';
        if (sheetMode === 'batch') {
            options = batches.map((b: any) => ({ label: `Batch ${b}`, value: String(b) }));
            activeValue = filters?.batch_no || '';
        } else if (sheetMode === 'academic_year') {
            options = academicYears.map((ay: any) => ({ label: ay, value: ay }));
            activeValue = filters?.academic_year || '';
        } else if (sheetMode === 'semester') {
            options = semesters.map((s: any) => ({ label: s.name, value: String(s.id) }));
            activeValue = filters?.semester || '';
        } else {
            return null;
        }

        return (
            <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 p-1 rounded-b-lg border-t border-gray-200">
                <Button variant={!activeValue ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => handleSheetChange('')}>
                    <LayoutList className="mr-2 h-3 w-3" /> All
                </Button>
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={activeValue === opt.value ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 text-xs min-w-[80px] ${activeValue === opt.value ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => handleSheetChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-auto min-h-[700px]">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>TDP Masterlist Database</CardTitle>
                        <CardDescription>Manage TDP scholars, payments, and enrollment data.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isDirty && <span className="text-xs text-amber-600 font-bold mr-2">Unsaved Changes</span>}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                    <Layers className="h-4 w-4" />
                                    {sheetMode === 'batch' ? 'View: Batch' : 
                                     sheetMode === 'academic_year' ? 'View: A.Y.' : 
                                     sheetMode === 'semester' ? 'View: Sem' : 'Sheets Off'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSheetMode('batch')}><FileSpreadsheet className="mr-2 h-4 w-4" /> By Batch</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('academic_year')}><CalendarRange className="mr-2 h-4 w-4" /> By A.Y.</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('semester')}><LayoutList className="mr-2 h-4 w-4" /> By Semester</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('none')}>Sheets Off</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || selectedIds.length === 0}>
                            {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                </div>

                {/* FORMULA BAR */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded border border-gray-300 mt-2">
                    <div className="flex items-center text-muted-foreground px-2 border-r gap-1 min-w-[60px] justify-center bg-gray-100 h-full">
                        <Sigma className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-mono font-bold text-gray-700">
                            {activeCoords ? `${String.fromCharCode(65 + activeCoords.c)}${activeCoords.r + 1}` : ''}
                        </span>
                    </div>
                    <Input 
                        className="h-8 border-0 shadow-none focus-visible:ring-0 bg-transparent flex-1 font-mono text-sm"
                        placeholder="Enter value or formula (e.g. =SUM(A1:A5))"
                        value={activeCellVal}
                        onChange={handleFormulaChange}
                    />
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            className="h-8 pl-8 text-xs"
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

            <CardContent className="p-0 bg-white border-t border-b flex-1">
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
                
                <div className="p-2 bg-gray-50">
                    <PaginationLinks links={paginationLinks} />
                </div>
            </CardContent>
        </Card>
    );
}