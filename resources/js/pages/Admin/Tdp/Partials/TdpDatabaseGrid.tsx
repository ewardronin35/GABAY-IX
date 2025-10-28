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

registerAllModules();

export function TdpDatabaseGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<any>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [gridData, setGridData] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

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
            }));
            setGridData(flattenedData);
        }
    }, [records]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || '')) {
                router.get(route('superadmin.tdp.index'), { search: searchQuery }, {
                    preserveState: true, replace: true, only: ['tdpRecords', 'filters'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search]);

    const handleSave = () => {
        toast.info("Save functionality is not yet implemented for TDP.");
    };

    const columns = [
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
        { data: 'year', title: 'YEAR' },
        { data: 'tdp_grant', title: 'TDP GRANT' },    
        { data: 'endorsed_by', title: 'ENDORSED BY' },



    ];

    if (!records) return <div className="p-4 text-center">Loading...</div>;

    return (
        <Card>
            <CardHeader><OfficialHeader title="TDP Database" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input placeholder="Search database..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Upload className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </div>
                
                <div className={tableClassName}>
                    <HotTable data={gridData} columns={columns} colHeaders={columns.map(c => c.title)} rowHeaders={true} width="100%" height="60vh" minSpareRows={10} licenseKey="non-commercial-and-evaluation" stretchH="all" fixedColumnsStart={2} contextMenu={true} dropdownMenu={true} filters={true} />
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}