import { HotTable } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Info } from 'lucide-react';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
import { PaginationLinks } from '@/components/ui/PaginationLinks'; // Import pagination
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // ✅ NEW: Import Card components
import { OfficialHeader } from '@/components/ui/OfficialHeader'; // ✅ NEW: Import the header
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

    useEffect(() => {
        if (records && records.data) {
            const flattenedData = records.data.map(record => ({
                id: record.id,
                seq: record.seq,
          hei_name: record.hei?.hei_name,
                hei_type: record.hei?.hei_type,              // ✅ ADD THIS
                hei_municipality: record.hei?.city,           // ✅ ADD THIS (maps city to municipality)
                hei_province: record.hei?.province,         // ✅ ADD THIS
                hei_district: record.hei?.district,
                app_no: record.app_no,
                award_no: record.award_no,
                family_name: record.scholar?.family_name,
                given_name: record.scholar?.given_name,
                extension_name: record.scholar?.extension_name,
                middle_name: record.scholar?.middle_name,
                sex: record.scholar?.sex,
                birthdate: record.scholar?.birthdate,
                course_name: record.course?.course_name,
                year_level: record.year_level,
                total_units_enrolled: record.total_units_enrolled,
                street: record.scholar?.street,
                municipality: record.scholar?.municipality,
                province: record.scholar?.province,
                pwd_classification: record.scholar?.pwd_classification,
                grant_amount: record.grant_amount,
                batch_no: record.batch_no,
                validation_status: record.validation_status,
                payment_status: record.payment_status,
                remarks: record.remarks,
                endorsed_by: record.endorsed_by,
                semester: record.semester,
                academic_year: record.academic_year,
            }));
            setGridData(flattenedData);
        }
    }, [records]);

useEffect(() => {
        // Debounced search logic remains the same
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search_db || '')) {
                router.get(route('superadmin.tes.index'), { search_db: searchQuery }, {
                    preserveState: true, replace: true, only: ['tesDatabase', 'filters'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search_db]);


    const handleSave = () => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) {
            toast.error("Grid is not ready.");
            return;
        }
        
        // Get all data from the grid, including new and modified rows.
        // getSourceData() is used to get the clean, underlying data array.
        const dataToSave = hotInstance.getSourceData();

        // Use Inertia's router to send a PUT request.
        router.put(route('superadmin.tes.bulkUpdate'), { data: dataToSave }, {
            onStart: () => {
                setIsSaving(true);
                toast.info("Saving changes...");
            },
            onSuccess: () => {
                toast.success("Data saved successfully!");
            },
            onError: (errors) => {
                console.error("Save Error:", errors);
                toast.error("An error occurred while saving. Check console for details.");
            },
            onFinish: () => {
                setIsSaving(false);
            },
            preserveScroll: true, // Keep the user's scroll position after saving
        });
    };

    const columns = [
        { data: 'seq', title: 'SEQ' }, 
{ data: 'hei_name', title: 'HEI Name' },
        { data: 'hei_type', title: 'HEI Type' },                      // ✅ ADD THIS
        { data: 'hei_municipality', title: 'HEI City/Municipality' }, // ✅ ADD THIS
        { data: 'hei_province', title: 'HEI Province' },            // ✅ ADD THIS
        { data: 'hei_district', title: 'HEI District' },
        { data: 'app_no', title: 'App No' }, { data: 'award_no', title: 'Award No.' }, { data: 'family_name', title: 'Last Name' },
        { data: 'given_name', title: 'First Name' }, { data: 'extension_name', title: 'Ext Name' }, { data: 'middle_name', title: 'Middle Name' },
        { data: 'sex', title: 'Sex', type: 'dropdown', source: ['M', 'F'], allowInvalid: false }, { data: 'birthdate', title: 'Birthdate', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'course_name', title: 'Course/Program' }, { data: 'year_level', title: 'Year Level' },
        { data: 'total_units_enrolled', title: 'Units Enrolled', type: 'numeric' }, { data: 'street', title: 'Street' },
        { data: 'municipality', title: 'Municipality' }, { data: 'province', title: 'Province' },
        { data: 'pwd_classification', title: 'PWD Classification' }, { data: 'grant_amount', title: 'Grant' },
        { data: 'batch_no', title: 'Batch No.' }, { data: 'validation_status', title: 'Validation Status' },
        { data: 'payment_status', title: 'Payment' }, { data: 'remarks', title: 'Remarks' },
        { data: 'endorsed_by', title: 'Endorsed By' }, { data: 'semester', title: 'Semester' }, { data: 'academic_year', title: 'Year' },
    ];

   
    return (
    <Card>
        <CardHeader>
            <OfficialHeader title="TES Database Grid" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Search by name or award no..."
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
                    minSpareRows={10} // Ensures you see rows for data entry
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