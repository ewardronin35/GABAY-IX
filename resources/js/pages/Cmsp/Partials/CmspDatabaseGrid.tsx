import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';

import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Save, Loader2, FileSpreadsheet, Layers, CalendarRange, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
import { FilterBar } from './FilterBar'; 
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

registerAllModules();

// --- 1. DATA MAPPING (All Excel Fields) ---
const mapDataToGrid = (records: any[]) => {
    if (!Array.isArray(records)) return [];
    
    const safeText = (val: any) => (val === null || val === undefined) ? '' : String(val);
    const safeBool = (val: any) => val ? true : false;

    return records.map((record, index) => {
        const enrollment = record.enrollment || {};
        const scholar = enrollment.scholar || {};
        const address = scholar.address || {};
        const relatives = scholar.relatives || [];
        const docs = enrollment.application_documents || [];
        
        // Helper to find relative by type
        const getRel = (type: string) => relatives.find((r: any) => r.relationship_type === type) || {};
        const father = getRel('FATHER');
        const mother = getRel('MOTHER');

        // Helper to find document presence
        const hasDoc = (nameKey: string) => docs.some((d: any) => d.document_type?.includes(nameKey) || d.name?.includes(nameKey));

        return {
            id: record.id, // Hidden ID for updates
            
            // Sequence
            seq: index + 1,

            // Location
            region: safeText(address.region_name),
           province: address.province?.name || safeText(address.province), 
            town: address.city?.name || safeText(address.town_city),
            street: safeText(address.specific_address),
            dist: safeText(address.district_no),
            zip_code: safeText(address.zip_code),

            // Dates & App Info
            entry_date: safeText(enrollment.entry_date),
            app_date: safeText(enrollment.application_date),
            app_year: safeText(enrollment.academic_year_applied),
            a_year: safeText(record.academic_year?.name), // Current Record AY
            app_type: safeText(enrollment.application_type),

            // Personal
            lname: safeText(scholar.family_name),
            fname: safeText(scholar.given_name),
            mname: safeText(scholar.middle_name),
            name_ext: safeText(scholar.extension_name),
            sex: safeText(scholar.sex),
            civil_status: safeText(scholar.civil_status),
           bdate: safeText(scholar.date_of_birth),
            bplace: safeText(scholar.birth_place),
            email: safeText(scholar.email_address),
            contact: safeText(scholar.contact_no || scholar.mobile_no),
fb_account: safeText(scholar.facebook_account),            highschool: safeText(scholar.high_school),
            lrn: safeText(scholar.lrn),

            // Academic
intended_school: safeText(record.hei?.hei_name || enrollment.hei?.hei_name),            school_type: safeText(enrollment.school_type),
            course: safeText(record.course?.course_name || record.course_name),
            c_year: safeText(record.year_level), // Current Year Level

            // Ranking & Financials
            grade: record.gwa || 0,
            g_points: enrollment.grade_points || 0,
            income: scholar.family_income || 0,
            i_points: enrollment.income_points || 0,
            t_points: enrollment.total_points || 0,
            q_scholarships: safeText(enrollment.qualified_scholarships),
            scholarship: safeText(enrollment.scholarship_type),

            // Father
            f_lname: safeText(father.family_name),
            f_name: safeText(father.given_name),
            f_mname: safeText(father.middle_name),
            f_ename: safeText(father.extension_name),
            f_occu: safeText(father.occupation),
            f_address: safeText(father.address), // Assuming field exists
            f_educ: safeText(father.educational_attainment),
            f_is_living: father.is_living ? 'Living' : 'Deceased',

            // Mother
            m_lname: safeText(mother.family_name),
            m_name: safeText(mother.given_name),
            m_mname: safeText(mother.middle_name),
            m_occu: safeText(mother.occupation),
            m_addr: safeText(mother.address),
            m_educ: safeText(mother.educational_attainment),
            m_is_living: mother.is_living ? 'Living' : 'Deceased',

            // Socio-Economic & Flags
            no_siblings: safeText(scholar.siblings_count),
            is_4ps: safeBool(scholar.is_4ps_beneficiary),
            ethnic: safeText(scholar.indigenous_group),
            disability: safeText(scholar.disability),
            is_single_parent: safeBool(scholar.is_solo_parent),

            // Documents (Checkboxes)
            proof_income: hasDoc('Income'),
            gm_cert: hasDoc('Good Moral'),
            sp_cert: hasDoc('Solo Parent'),
            ip_cert: hasDoc('Indigenous'),
            pwd_cert: hasDoc('Disability'),
            aff_guard: hasDoc('Guardianship'),
        };
    });
};

// --- 2. MEMOIZED TABLE ---
const MemoizedHotTable = memo(({ data, columns, onAfterChange, forwardRef }: any) => {
    return (
        <>
            <style>{`
                .dark .handsontable, .dark .wtHolder, .dark .htCore { background-color: #09090b !important; color: #e4e4e7 !important; }
                .dark .handsontable th { background-color: #18181b !important; color: #a1a1aa !important; border-color: #27272a !important; }
                .dark .handsontable tbody tr td { background-color: #09090b !important; color: #f8fafc !important; border-color: #27272a !important; }
                .dark .handsontable td.area { background-color: rgba(59, 130, 246, 0.25) !important; border: 1px solid #3b82f6 !important; }
            `}</style>
            <HotTable
                ref={forwardRef}
                data={data}
                columns={columns}
                colHeaders={columns.map((c: any) => c.title)}
                rowHeaders={true}
                width="100%"
                height="650px" 
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

// --- 3. MAIN COMPONENT ---
export function CmspDatabaseGrid({ records, filters, academicYears = [], semesters = [], heiList = [] }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [sheetMode, setSheetMode] = useState<string>('academic_year'); 

    const rawData = records?.data || (Array.isArray(records) ? records : []);
    const gridData = useMemo(() => mapDataToGrid(rawData), [rawData]);

    // --- COLUMNS DEFINITION (All Requested Fields) ---
    const columns = useMemo(() => [
        { data: 'id', title: 'ID', readOnly: true, width: 1 }, // Hidden ideally
        { data: 'seq', title: 'Seq', readOnly: true, width: 50 },
        { data: 'region', title: 'Region', width: 80 },
        { data: 'entry_date', title: 'Entry Date', type: 'date', dateFormat: 'YYYY-MM-DD', width: 100 },
        { data: 'app_date', title: 'App Date', type: 'date', dateFormat: 'YYYY-MM-DD', width: 100 },
        { data: 'app_year', title: 'App Year', width: 90 },
        { data: 'a_year', title: 'A. Year', width: 90 },
        
        { data: 'lname', title: 'Last Name', width: 120 },
        { data: 'fname', title: 'First Name', width: 120 },
        { data: 'mname', title: 'Middle', width: 100 },
        { data: 'name_ext', title: 'Ext', width: 50 },
        { data: 'sex', title: 'Sex', width: 60 },
        { data: 'civil_status', title: 'Civil Status', width: 90 },
        { data: 'bdate', title: 'Birthdate', width: 100 },
        { data: 'bplace', title: 'Birthplace', width: 120 },
        { data: 'email', title: 'Email', width: 150 },
        
        { data: 'street', title: 'Street', width: 120 },
        { data: 'town', title: 'Town', width: 120 },
        { data: 'province', title: 'Province', width: 120 },
        { data: 'dist', title: 'Dist', width: 60 },
        { data: 'zip_code', title: 'Zip', width: 60 },
        { data: 'fb_account', title: 'FB Acct', width: 120 },
        { data: 'contact', title: 'Contact', width: 110 },
        
        { data: 'app_type', title: 'App Type', width: 100 },
        { data: 'highschool', title: 'High School', width: 150 },
        { data: 'lrn', title: 'LRN', width: 110 },
        { data: 'intended_school', title: 'INTENDED SCHOOL', width: 200 },
        { data: 'school_type', title: 'Type', width: 80 },
        { data: 'course', title: 'Course', width: 150 },
        { data: 'grade', title: 'Grade', type: 'numeric', width: 80 },
        { data: 'g_points', title: 'G.Pts', type: 'numeric', width: 70 },
        { data: 'income', title: 'Income', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 100 },
        { data: 'i_points', title: 'I.Pts', type: 'numeric', width: 70 },
        { data: 't_points', title: 'T.Pts', type: 'numeric', width: 70 },
        { data: 'q_scholarships', title: 'Qualified', width: 120 },
        { data: 'scholarship', title: 'Scholarship', width: 120 },
        { data: 'c_year', title: 'C. Year', width: 70 },

        // Father
        { data: 'f_name', title: 'F. Name', width: 100 },
        { data: 'f_lname', title: 'F. LName', width: 100 },
        { data: 'f_mname', title: 'F. MName', width: 100 },
        { data: 'f_ename', title: 'F. Ext', width: 50 },
        { data: 'f_occu', title: 'F. Occu', width: 100 },
        { data: 'f_address', title: 'F. Address', width: 150 },
        { data: 'f_educ', title: 'F. Educ', width: 100 },
        { data: 'f_is_living', title: 'F. Living', width: 80 },

        // Mother
        { data: 'm_name', title: 'M. Name', width: 100 },
        { data: 'm_lname', title: 'M. LName', width: 100 },
        { data: 'm_mname', title: 'M. MName', width: 100 },
        { data: 'm_occu', title: 'M. Occu', width: 100 },
        { data: 'm_addr', title: 'M. Address', width: 150 },
        { data: 'm_educ', title: 'M. Educ', width: 100 },
        { data: 'm_is_living', title: 'M. Living', width: 80 },

        // Socio
        { data: 'no_siblings', title: 'Siblings', width: 70 },
        { data: 'is_4ps', title: '4Ps?', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'ethnic', title: 'Ethnic', width: 100 },
        { data: 'disability', title: 'Disability', width: 100 },
        { data: 'is_single_parent', title: 'Solo?', type: 'checkbox', className: 'htCenter', width: 60 },

        // Documents (Read-Only Visualization mostly)
        { data: 'proof_income', title: 'Inc.Doc', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'gm_cert', title: 'GM Cert', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'sp_cert', title: 'SP Cert', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'ip_cert', title: 'IP Cert', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'pwd_cert', title: 'PWD Cert', type: 'checkbox', className: 'htCenter', width: 60 },
        { data: 'aff_guard', title: 'Guard.Aff', type: 'checkbox', className: 'htCenter', width: 60 },
    ], []);

    const handleAfterChange = useCallback((changes: any, source: any) => {
        if (source !== 'loadData') setIsDirty(true);
    }, []);

    const handleSave = () => {
        if (!hotRef.current) return;
        const data = hotRef.current.hotInstance.getSourceData(); 
        setIsSaving(true);
        router.post(route('admin.cmsp.bulk-update'), { records: data }, {
            onSuccess: () => { toast.success("Saved!"); setIsDirty(false); setIsSaving(false); },
            onError: () => { toast.error("Failed."); setIsSaving(false); }
        });
    };

    const handleSheetChange = (value: string) => {
        if (isDirty && !confirm("Unsaved changes. Discard?")) return;
        const newFilters = { ...filters };
        if (sheetMode === 'academic_year') newFilters.academic_year = value === 'all' ? null : value;
        if (sheetMode === 'semester') newFilters.semester = value === 'all' ? null : value;
        router.get(route('admin.cmsp.index'), { ...newFilters, page: 1, limit: value === 'all' ? 50 : 3000 }, { preserveState: true, preserveScroll: true });
    };

    const renderSheetTabs = () => {
        let options: { label: string, value: string }[] = [];
        if (sheetMode === 'academic_year') options = (Array.isArray(academicYears) ? academicYears : []).map((y: string) => ({ label: y, value: y }));
        else if (sheetMode === 'semester') options = (Array.isArray(semesters) ? semesters : []).map((s: any) => ({ label: s.name, value: String(s.id) }));
        const active = filters[sheetMode] || 'all';

        return (
            <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 p-2 border-t dark:bg-zinc-900 dark:border-zinc-800 h-[45px]">
                <Button variant={active === 'all' ? "default" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => handleSheetChange('all')}>All Records</Button>
                {options.map((opt) => (
                    <Button key={opt.value} variant={active === opt.value ? "default" : "ghost"} size="sm" className="h-8 text-xs whitespace-nowrap" onClick={() => handleSheetChange(opt.value)}>{opt.label}</Button>
                ))}
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-auto min-h-[700px] dark:bg-zinc-950 dark:border-zinc-800 w-full overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="dark:text-white flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-amber-600"/> CMSP Editor</CardTitle>
                        <CardDescription>Showing {gridData.length} records. {records?.total ? `(Total: ${records.total})` : ''}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 gap-2"><Layers className="h-4 w-4"/> View: {sheetMode}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSheetMode('academic_year')}>By Academic Year</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSheetMode('semester')}>By Semester</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving} className={isDirty ? "bg-green-600 text-white" : ""}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} Save</Button>
                    </div>
                </div>
                <div className="mt-2"><FilterBar filters={filters} searchKey="search" academicYears={academicYears} semesters={semesters} heiList={heiList} batches={[]} courses={[]} /></div>
            </CardHeader>
            <CardContent className="p-0 bg-white border-t border-b flex-1 dark:bg-zinc-950">
                <div className="w-full h-[650px] relative">
                    <MemoizedHotTable forwardRef={hotRef} data={gridData} columns={columns} onAfterChange={handleAfterChange} />
                </div>
                <div className="flex-1 overflow-hidden border-t bg-gray-50 dark:bg-zinc-900">{renderSheetTabs()}</div>
            </CardContent>
            {records?.links && <CardFooter className="py-2 bg-gray-50 dark:bg-zinc-900 border-t dark:border-zinc-800"><PaginationLinks links={records.links} /></CardFooter>}
        </Card>
    );
}

export default CmspDatabaseGrid;