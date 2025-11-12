// ▼▼▼ PASTE THIS ENTIRE FILE ▼▼▼

// --- These 3 imports are still causing the lag, ---
// --- but we are ignoring that for now to fix the redirect. ---
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { HotTable } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import type { TdpPageProps } from "../Index";
import { ScholarEnrollment } from '@/types';

registerAllModules();

// --- FIX 1: Prop name changed ---
type TdpDatabaseGridProps = {
    databaseData: TdpPageProps["databaseEnrollments"]; // <-- Use new prop
    filters: TdpPageProps["filters"];
    academicYears: TdpPageProps["academicYears"];
    semesters: TdpPageProps["semesters"];
    tableClassName?: string;
};

// --- FIX 2: Component now accepts 'databaseData' ---
export function TdpDatabaseGrid({ databaseData, filters, tableClassName }: TdpDatabaseGridProps) {
    const hotRef = useRef<any>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search_db || '');
    const [gridData, setGridData] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Columns definition is unchanged
    const columns = [
        { data: 'id', title: 'ID', readOnly: true, width: 60 },
        { data: 'seq', title: 'SEQ' }, 
        { data: 'app_no', title: 'APP NO' }, 
        // ... all other columns ...
        { data: 'award_no', title: 'AWARD NO' },
        { data: 'hei_name', title: 'HEI NAME' }, 
        { data: 'hei_type', title: 'HEI TYPE' },
        { data: 'hei_city', title: 'HEI CITY/MUNICIPALITY' }, 
        { data: 'hei_province', title: 'HEI PROVINCE' }, 
        { data: 'hei_district', title: 'HEI DISTRICT' },
        { data: 'family_name', title: 'LASTNAME' }, 
        { data: 'given_name', title: 'FIRSTNAME' }, 
        { data: 'extension_name', title: 'EXT' },
        { data: 'middle_name', title: 'MIDDLENAME' }, 
        { data: 'sex', title: 'SEX', type: 'dropdown', source: ['M', 'F'] },
        { data: 'course_name', title: 'COURSE ENROLLED' }, 
        { data: 'year_level', title: 'YEAR LEVEL' },
        { data: 'street', title: 'STREET' }, 
        { data: 'town_city', title: 'TOWN/CITY' }, 
        { data: 'district', title: 'DISTRICT' },
        { data: 'province', title: 'PROVINCE' }, 
        { data: 'contact_no', title: 'CONTACT' },
        { data: 'email_address', title: 'EMAIL' },
        { data: 'batch', title: 'BATCH' }, 
        { data: 'validation_status', title: 'STATUS OF VALIDATION' },
        { data: 'date_paid', title: 'DATE PAID' },
        { data: 'ada_no', title: 'ADA NO' },
        { data: 'semester', title: 'SEMESTER' },
        { data: 'academic_year', title: 'YEAR' },
        { data: 'tdp_grant', title: 'TDP GRANT' },     
        { data: 'endorsed_by', title: 'ENDORSED BY' },
    ];

    // --- FIX 3: useEffect now watches 'databaseData' ---
    useEffect(() => {
        if (databaseData && databaseData.data) {
            const flattenData = databaseData.data.map((record: ScholarEnrollment) => ({
                id: record.scholar.id, 
                family_name: record.scholar?.family_name,
                // ... all other fields
                given_name: record.scholar?.given_name,
                extension_name: record.scholar?.extension_name,
                middle_name: record.scholar?.middle_name,
                sex: record.scholar?.sex,
                contact_no: record.scholar?.contact_no,
                email_address: record.scholar?.email_address,
                street: record.scholar?.address?.brgy_street,
                town_city: record.scholar?.address?.town_city,
                district: record.scholar?.address?.congressional_district,
                province: record.scholar?.address?.province,
                course_name: record.scholar.education?.course?.course_name,
                hei_name: record.hei?.hei_name,
                hei_type: record.hei?.type_of_heis,
                hei_city: record.hei?.city,
                hei_province: record.hei?.province,
                hei_district: record.hei?.district,
                award_no: record.award_number, 
                seq: record.academicRecords?.[0]?.seq, 
                app_no: record.academicRecords?.[0]?.app_no,
                year_level: record.academicRecords?.[0]?.year_level,
                batch: record.academicRecords?.[0]?.batch_no,
                validation_status: record.academicRecords?.[0]?.payment_status,
                date_paid: record.academicRecords?.[0]?.disbursement_date,
                ada_no: record.academicRecords?.[0]?.batch_no,
                semester: record.academicRecords?.[0]?.semester,
                academic_year: record.academicRecords?.[0]?.academic_year,
                tdp_grant: record.academicRecords?.[0]?.grant_amount,
                endorsed_by: record.academicRecords?.[0]?.endorsed_by,
            }));
            setGridData(flattenData);
        }
    }, [databaseData]); // <-- Watch new prop

    // Search handler is correct and already uses 'databaseEnrollments'
    // in the 'only' array, which is correct.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search_db || '')) {
                router.get(route('superadmin.tdp.index'), { 
                    ...filters,
                    search_db: searchQuery,
                    db_page: 1,
                }, {
                    preserveState: true, 
                    replace: true, 
                    only: ['databaseEnrollments', 'filters'],
                    preserveScroll: true,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters]);

    // Save handler is correct
    const handleSave = () => {
        // ... (no changes needed here, 'router.reload' is fine)
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;
        
        setIsSaving(true);
        const dataFromGrid = hot.getData(); 

        const payload = dataFromGrid.map((rowArray: any[]) => {
            let obj: { [key: string]: any } = {};
            columns.forEach((col, index) => {
                obj[col.data] = rowArray[index];
            });
            return obj;
        }).filter(row => row.id || row.family_name || row.given_name);

        router.put(route('superadmin.tdp.bulkUpdate'), { enrollments: payload }, {
            onSuccess: () => {
                toast.success("Changes saved successfully!");
                router.reload({ only: ['databaseEnrollments'] }); 
            },
            onError: (errors) => {
                console.error("Save Error:", errors);
                toast.error("Failed to save changes.");
            },
            onFinish: () => {
                setIsSaving(false);
            }
        });
    };

    // --- FIX 4: Check 'databaseData' for loading ---
    if (!databaseData) return <div className="p-4 text-center">Loading...</div>;

    return (
        <Card>
            <CardHeader><OfficialHeader title="TDP Database" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input 
                        placeholder="Search database (Lastname, Firstname, Award #)..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        className="max-w-xs" 
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
                
                <div className={tableClassName}>
                    <HotTable 
                        className="ht-theme-horizon"
                        ref={hotRef}
                        data={gridData} 
                        columns={columns} 
                        colHeaders={columns.map(c => c.title)} 
                        rowHeaders={true} 
                        width="100%" 
                        height="60vh" 
                        minSpareRows={0} 
                        licenseKey="non-commercial-and-evaluation" 
                        stretchH="all" 
                        fixedColumnsStart={2} 
                        contextMenu={true} 
                        dropdownMenu={true} 
                        filters={true} 
                        manualColumnResize={true}
                        manualRowResize={true}
                    />
                </div>
                {/* --- FIX 5: Use 'databaseData' for pagination --- */}
                <PaginationLinks links={databaseData.links} />
            </CardContent>
        </Card>
    );
}