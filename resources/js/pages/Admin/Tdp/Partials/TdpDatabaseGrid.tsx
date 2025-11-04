import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { HotTable } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Info } from 'lucide-react'; // Loader2 is already here
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

registerAllModules();

export function TdpDatabaseGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<any>(null);
    // ✅ FIX 1: Initialize search from the correct filter prop 'search_db'
    const [searchQuery, setSearchQuery] = useState(filters?.search_db || '');
    const [gridData, setGridData] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // This columns definition needs to be in the component scope
    // ✅ FIX 4: Added 'id' column so we can track changes
    const columns = [
        { data: 'id', title: 'ID', readOnly: true, width: 60 },
        { data: 'seq', title: 'SEQ' }, 
        { data: 'app_no', title: 'APP NO' }, 
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
        { data: 'year', title: 'YEAR' }, // Note: This might be 'academic_year'
        { data: 'tdp_grant', title: 'TDP GRANT' },    
        { data: 'endorsed_by', title: 'ENDORSED BY' },
    ];


    useEffect(() => {
        if (records && records.data) {
            const flattenedData = records.data.map((record: any) => ({
                id: record.id,
                seq: record.seq,
                app_no: record.app_no,
                award_no: record.award_no,
                hei_name: record.hei?.hei_name,
                hei_type: record.hei?.hei_type,
                hei_city: record.hei?.city,
                hei_province: record.hei?.province,
                hei_district: record.hei?.district,
                family_name: record.scholar?.family_name,
                given_name: record.scholar?.given_name,
                extension_name: record.scholar?.extension_name,
                middle_name: record.scholar?.middle_name,
                sex: record.scholar?.sex,
                course_name: record.course?.course_name,
                year_level: record.year_level,
                street: record.scholar?.street,
                town_city: record.scholar?.town_city,
                district: record.scholar?.district,
                province: record.scholar?.province,
                contact_no: record.scholar?.contact_no,
                email_address: record.scholar?.email_address,
                batch: record.batch,
                validation_status: record.validation_status,
                // ✅ Add all other fields from your columns list
                date_paid: record.date_paid,
                ada_no: record.ada_no,
                semester: record.semester,
                academic_year: record.academic_year, // Your column says 'year' but controller has 'academic_year'
                tdp_grant: record.tdp_grant,
                endorsed_by: record.endorsed_by,
            }));
            setGridData(flattenedData);
        }
    }, [records]);

    // ✅ FIX 2: Use correct filter prop 'search_db'
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search_db || '')) {
                // ✅ FIX 3: Send correct param 'search_db' and preserve other filters
                router.get(route('superadmin.tdp.index'), { 
                    ...filters, // Preserve existing filters (like search_ml, search_hei, tab)
                    search_db: searchQuery, // Set our new search query
                    db_page: 1, // Reset to page 1 for new search
                }, {
                    preserveState: true, 
                    replace: true, 
                    only: ['tdpRecords', 'filters'], // Only reload what's needed
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters]); // Update dependency

    // ✅ FIX 5: Implement the handleSave function
    const handleSave = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) {
            toast.error("Grid is not ready. Please wait a moment and try again.");
            return;
        }
        
        setIsSaving(true);
        
        // Get all data from the grid, including edits
        const dataFromGrid = hot.getData(); 

        // Map the array-of-arrays back into an array-of-objects
        const payload = dataFromGrid.map((rowArray: any[]) => {
            let obj: { [key: string]: any } = {};
            columns.forEach((col, index) => {
                obj[col.data] = rowArray[index];
            });
            return obj;
        }).filter(row => row.id || row.family_name || row.given_name); // Filter empty spare rows

        // Send the data to the bulkUpdate route
        router.put(route('superadmin.tdp.bulkUpdate'), { data: payload }, {
            onSuccess: () => {
                toast.success("Changes saved successfully!");
                // Reload the records to show fresh data from server
                router.reload({ only: ['tdpRecords'] });
            },
            onError: (errors) => {
                console.error("Save Error:", errors);
                toast.error("Failed to save changes.", {
                    description: "Please check the console (F12) for error details.",
                });
            },
            onFinish: () => {
                setIsSaving(false);
            }
        });
    };

    if (!records) return <div className="p-4 text-center">Loading...</div>;

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
                    {/* ✅ FIX 6: Add loading state to save button */}
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
                
                <div className={tableClassName}>
                    <HotTable 
                        ref={hotRef} // Set the ref
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
                        manualColumnResize={true} // Allow column resizing
                        manualRowResize={true} // Allow row resizing
                    />
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}