import { HotTable } from '@handsontable/react';
// FIX: Use relative paths for component imports
import { Button } from '../../../../components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
// FIX: Use relative paths for component imports
import { Input } from "../../../../components/ui/input";
import { Upload, Loader2, Info } from 'lucide-react';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
// FIX: Use relative paths for component imports
import { PaginationLinks } from '../../../../components/ui/PaginationLinks';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { OfficialHeader } from '../../../../components/ui/OfficialHeader';
registerAllModules();

interface Paginator<T> { data: T[]; links: any[]; }
interface TesDatabaseGridProps {
    records: Paginator<any>;
    filters: { search?: string };
    tableClassName: string;
}

export function TesDatabaseGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search_db || '');
    const [gridData, setGridData] = useState<any[]>([]);

    // --- ▼▼▼ REFACTORED ▼▼▼ ---
    // This hook now maps the NEW data structure from the controller.
    useEffect(() => {
        if (records && records.data) {
            const data = records.data.map((record: any) => ({
                // AcademicRecord fields (base level)
                id: record.id, // This is academic_record_id
                app_no: record.app_no,
                year_level: record.year_level,
                total_units_enrolled: record.total_units_enrolled,
                grant_amount: record.grant_amount,
                batch_no: record.batch_no,
                validation_status: record.validation_status,
                payment_status: record.payment_status,
                remarks: record.remarks,
                endorsed_by: record.endorsed_by,
                semester: record.semester,
                academic_year: record.academic_year,
                seq: record.seq,

                // Enrollment fields
                award_number: record.enrollment?.award_number,
                
                // Scholar fields (nested)
                scholar_id: record.enrollment?.scholar?.id, // CRITICAL: We need this for saving
                family_name: record.enrollment?.scholar?.family_name,
                given_name: record.enrollment?.scholar?.given_name,
                middle_name: record.enrollment?.scholar?.middle_name,
                sex: record.enrollment?.scholar?.sex,
                contact_number: record.enrollment?.scholar?.contact_number,
                email: record.enrollment?.scholar?.email,
                
                // Relational fields
                hei: record.hei?.hei_name,
                course: record.course?.course_name,
            }));
            setGridData(data);
        }
    }, [records]);
    // --- ▲▲▲ END OF REFACTOR ▲▲▲ ---

    const columns = [
        // Define columns for Handsontable. 'data' matches the keys in gridData
        { data: 'id', title: 'ID', readOnly: true },
        { data: 'scholar_id', title: 'Scholar ID', readOnly: true },
        { data: 'family_name', title: 'Family Name' },
        { data: 'given_name', title: 'Given Name' },
        { data: 'middle_name', title: 'Middle Name' },
        { data: 'sex', title: 'Sex' },
        { data: 'contact_number', title: 'Contact No.' },
        { data: 'email', title: 'Email' },
        { data: 'hei', title: 'HEI' },
        { data: 'course', title: 'Course' },
        { data: 'award_number', title: 'Award No.' },
        { data: 'app_no', title: 'App No.' },
        { data: 'year_level', title: 'Year Level' },
        { data: 'total_units_enrolled', title: 'Units' },
        { data: 'grant_amount', title: 'Grant Amount' },
        { data: 'batch_no', title: 'Batch' },
        { data: 'validation_status', title: 'Validation' },
        { data: 'payment_status', title: 'Payment' },
        { data: 'remarks', title: 'Remarks' },
        { data: 'endorsed_by', title: 'Endorsed By' },
        { data: 'semester', title: 'Semester' },
        { data: 'academic_year', title: 'Acad. Year' },
        { data: 'seq', title: 'Seq' },
    ];

    // Debounced search for the database grid
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search_db || '')) {
                router.get(route('superadmin.tes.index'), { search_db: searchQuery }, {
                    preserveState: true, replace: true, only: ['database_tes', 'filters_db'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search_db]);


    const handleSave = () => {
        setIsSaving(true);
        const hot = hotRef.current?.hotInstance;
        if (hot) {
            // GetSourceData() returns the current state of the grid,
            // which includes the 'id' and 'scholar_id' for each row.
            const changes = hot.getSourceData();
            
            router.post(route('superadmin.tes.update'), { data: changes }, {
                onSuccess: () => toast.success('Changes saved successfully!'),
                onError: (errs) => {
                    console.error(errs);
                    toast.error('An error occurred. Please check the console.');
                },
                onFinish: () => setIsSaving(false),
            });
        } else {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <OfficialHeader title="TES Database" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input
                        placeholder="Search by name or HEI..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="max-w-xs"
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

        
                <div className={tableClassName}>
                    <HotTable
                        ref={hotRef}
                        data={gridData}
                        columns={columns}
                        colHeaders={columns.map(c => c.title)}
                        rowHeaders={true}
                        width="100%"
                        height="60vh"
                        minSpareRows={10}
                        licenseKey="non-commercial-and-evaluation"
                        stretchH="all"
                        contextMenu={true}
                        dropdownMenu={true}
                        filters={true}
                        formulas={{ engine: HyperFormula }}
                        manualColumnResize={true}
                        fixedColumnsStart={5}
                    />
                </div>
                
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}