import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

registerAllModules();

export function StufapDatabaseGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [gridData, setGridData] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // This effect flattens the nested data from the server into a simple format
    useEffect(() => {
        if (records && records.data) {
            const flattenedData = records.data.map((record: any) => ({
             id: record.id,
            seq: record.seq,
            award_year: record.award_year,
            program_name: record.program?.program_name, // This fixes the program name
            rregion: record.scholar?.address?.region,
            award_number: record.award_number,
            family_name: record.scholar?.family_name,
            given_name: record.scholar?.given_name,
            middle_name: record.scholar?.middle_name,
            extension_name: record.scholar?.extension_name,
            sex: record.scholar?.sex,
            barangay: record.scholar?.address?.barangay,
            city: record.scholar?.address?.city,
            province: record.scholar?.address?.province,
            congressional_district: record.scholar?.address?.congressional_district,
            hei_name: record.hei?.hei_name,
            hei_code: record.hei?.hei_code,
            course_name: record.course?.course_name,
            course_code: record.course?.course_code,
            priority_cluster: record.course?.priority_cluster, // Assuming this is on the course model
            '1st_payment_sem': record['1st_payment_sem'], // Use bracket notation for keys with numbers/hyphens
            '2nd_payment_sem': record['2nd_payment_sem'],
            curriculum_year: record.curriculum_year,
            remarks: record.remarks,
            status_type: record.status_type,
            }));
            setGridData(flattenedData);
        }
    }, [records]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || '')) {
                router.get(route('superadmin.stufaps.index'), { search: searchQuery }, {
                    preserveState: true, replace: true, only: ['stufapRecords', 'filters'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search]);

  const handleSave = () => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) {
            toast.error("Grid is not ready.");
            return;
        }
        
        // Get all data from the grid, including new and modified rows.
        const dataToSave = hotInstance.getSourceData();

        // Use Inertia's router to send a PUT request to your new endpoint.
        router.put(route('superadmin.stufap.bulkUpdate'), { data: dataToSave }, {
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
            preserveScroll: true, // Keep the user's scroll position after the page reloads
        });
    };
    const columns = [
        { data: 'seq', title: 'SEQ' },
        { data: 'award_year', title: 'Award Year' },
        { data: 'program_name', title: 'Program Name' },
        { data: 'region', title: 'Region' },
        { data: 'award_number', title: 'Award Number' },
        { data: 'course_name', title: 'Course/Program' },
        { data: 'family_name', title: 'Last Name' },
        { data: 'given_name', title: 'First Name' },
        { data: 'middle_name', title: 'Middle Name' },
        { data: 'extension_name', title: 'Extension Name' },
        { data: 'sex', title: 'Sex', type: 'dropdown', source: ['M', 'F'] },
        { data: 'barangay', title: 'Barangay' },
        { data: 'city', title: 'City' },
        { data: 'province', title: 'Province' },
        { data: 'congressional_district', title: 'Congressional District' },
        { data: 'hei_name', title: 'HEI Name' },
        { data: 'hei_code', title: 'HEI Code' },
        { data: 'course_name', title: 'Course Name' },
        { data: 'course_code', title: 'Course Code' },
        { data: '1st_payment_sem', title: '1st Payment Semester', width: 150 },
    { data: '2nd_payment_sem', title: '2nd Payment Semester', width: 150 },
    { data: 'curriculum_year', title: 'Curriculum Year', width: 120 },
    { data: 'remarks', title: 'Remarks', width: 250 },
        { data: 'status_type', title: 'Status' },
    ];


    return (
        <Card>
            <CardHeader><OfficialHeader title="StuFAPs Database" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input placeholder="Search database..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
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
                        fixedColumnsStart={2}
                        contextMenu={true}
                        dropdownMenu={true}
                        filters={true}
                    />
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}