import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllModules } from 'handsontable/registry';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

registerAllModules();

export const EstatMonitoringGrid = memo(function EstatMonitoringGrid({ records, filters, tableClassName }: any) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);

    const gridData = useMemo(() => {
        // Flatten the nested monitoring data
        return records?.data?.flatMap((scholar: any) =>
            scholar.monitorings.map((monitoring: any) => ({
                scholar_id: scholar.id,
                monitoring_id: monitoring.id,
                award_number: scholar.award_number,
                last_name: scholar.last_name,
                first_name: scholar.first_name,
                ...monitoring
            }))
        ) || [];
    }, [records]);

    const handleSave = () => toast.info("Save functionality not yet implemented.");

    const columns = [
                { data : 'id', title: 'NO' },
        { data : 'region', title: 'Region' },
        { data: 'learner_reference_number', title: 'LRN' },
        { data: 'award_number', title: 'Award Number' },
        { data: 'last_name', title: 'Last Name' },
        { data: 'first_name', title: 'First Name' },
        { data: 'middle_name', title: 'Middle Name' },
        { data: 'extension_name', title: 'Ext.' },
        { data: 'current_year_level', title: 'Year Level' },
        { data: 'status_1st_semester', title: 'Status 1st Sem.' },
        { data: 'osds_fund_release_amount_1st_semester', title: 'OSDS Amount 1st Sem.', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { data: 'osds_fund_release_date_1st_semester', title: 'OSDS Date 1st Sem.', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'chedro_payment_amount_1st_semester', title: 'CHEDRO Amount 1st Sem.', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { data: 'chedro_payment_date_1st_semester', title: 'CHEDRO Date 1st Sem.', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'mode_of_payment_1st_semester', title: 'Mode of Payment 1st Sem.' },
        { data: 'current_year_level_2nd_sem', title: 'Year Level 2nd Sem.' },
        { data: 'status_2nd_semester', title: 'Status 2nd Sem.' },
        { data: 'osds_fund_release_amount_2nd_semester', title: 'OSDS Amount 2nd Sem.', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { data: 'osds_fund_release_date_2nd_semester', title: 'OSDS Date 2nd Sem.', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'chedro_payment_amount_2nd_semester', title: 'CHEDRO Amount 2nd Sem.', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { data: 'chedro_payment_date_2nd_semester', title: 'CHEDRO Date 2nd Sem.', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'mode_of_payment_2nd_semester', title: 'Mode of Payment 2nd Sem.' },
        { data: 'remarks', title: 'Remarks' },
    ];

    return (
        <Card>
            <CardHeader><OfficialHeader title="E-STAT Skolar Monitoring" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Monitoring Data
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