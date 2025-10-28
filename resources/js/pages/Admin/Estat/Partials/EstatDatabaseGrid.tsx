import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

registerAllModules();

export const EstatDatabaseGrid = memo(function EstatDatabaseGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isSaving, setIsSaving] = useState(false);

    const gridData = useMemo(() => {
        return records?.data?.map((record: any) => ({ ...record })) || [];
    }, [records]);

   useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || '')) {
                router.get(route('superadmin.estatskolar.index'), { 
                    search: searchQuery,
                    page: 1,
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['beneficiaries', 'filters'] // Only reload what's needed
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
        
        // Get all rows, including new and modified ones
        const dataToSave = hotInstance.getSourceData();

        router.put(route('superadmin.estatskolar.bulkUpdate'), { data: dataToSave }, {
            onStart: () => {
                setIsSaving(true);
                toast.info("Saving changes...");
            },
            onSuccess: () => toast.success("Data saved successfully!"),
            onError: (errors: Record<string, string>) => {
                console.error("Save Error:", errors);
                toast.error("An error occurred while saving.");
            },
            onFinish: () => setIsSaving(false),
            preserveScroll: true,
        });
    };
    const columns = [
        { data : 'id', title: 'NO' },
        { data : 'region', title: 'Region' },
        { data: 'lrn', title: 'Learner Reference Number' }, // ✅ Corrected from learner_reference_number
        { data: 'scholarship_type', title: 'Scholarship Grant' }, // ✅ Added
        { data: 'award_number', title: 'Award Number' },
        { data: 'last_name', title: 'Last Name' },
        { data: 'first_name', title: 'First Name' },
        { data: 'middle_name', title: 'Middle Name' },
        { data: 'extension_name', title: 'Ext.' },
        { data: 'birth_date', title: 'Birth Date' },
        { data: 'sex', title: 'Sex' },
        { data: 'civil_status', title: 'Civil Status' },
        { data: 'barangay_psgc_code', title: 'Barangay PSGC Code' },
        { data: 'city_municipality_psgc_code', title: 'City/Municipality PSGC Code' },
        { data: 'province_psgc_code', title: 'Province PSGC Code' },
        { data: 'uii_code', title: 'UII Code' },

        { data: 'hei_name', title: 'HEI Name' },
                { data: 'priority_program_code', title: 'Priority Code' },

        { data: 'program_name', title: 'Program Name' },
        { data: 'special_equity_group', title: 'Special Equity Group' },
        { data: 'special_equity_type', title: 'Special Equity Type' },
    ];

    return (
        <Card>
            <CardHeader><OfficialHeader title="E-STAT Skolar Database" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input placeholder="Search database..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                    />
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
});