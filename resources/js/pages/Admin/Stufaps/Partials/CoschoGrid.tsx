
import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { HyperFormula } from 'hyperformula';
import { Input } from "@/components/ui/input";
import { Download, Users, Award } from 'lucide-react';
import { registerAllModules } from 'handsontable/registry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Run the module registration at the top level, before the component is defined
registerAllModules();


interface DatabaseGridProps {
    tableClassName: string;
    sheets: { name: string, data: any[] }[];
    scholarshipPrograms: any[];
}

export function DatabaseGrid({ sheets, tableClassName, scholarshipPrograms}: DatabaseGridProps) {
    const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSheet, setActiveSheet] = useState(sheets[0]?.name || '');

    // Assume sheets[0] is always 'All Scholars' with full data
    const allData = sheets[0]?.data || [];

    useEffect(() => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) return;

        const hiddenRowsPlugin = hotInstance.getPlugin('hiddenRows');

        // First, unhide all hidden rows
        const hiddenRows = hiddenRowsPlugin.getHiddenRows();
        if (hiddenRows.length > 0) {
            hiddenRowsPlugin.showRows(hiddenRows);
        }

        // Then, if not 'All Scholars', hide filtered rows
        if (activeSheet !== 'All Scholars') {
            const data = hotInstance.getSourceData();
            const indicesToHide: number[] = [];
            data.forEach((row: any, physicalIndex: number) => {
                if (row.program_name !== activeSheet) {
                    indicesToHide.push(physicalIndex);
                }
            });
            if (indicesToHide.length > 0) {
                hiddenRowsPlugin.hideRows(indicesToHide);
            }
        }

        hotInstance.render();
    }, [activeSheet]);

    useEffect(() => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) return;
        
        const searchPlugin = hotInstance.getPlugin('search');
        searchPlugin.query(searchQuery);
        hotInstance.render(); // Re-render to show highlights
    }, [searchQuery]); 

    useEffect(() => {
        // Force a re-render after a short delay to fix the initial sizing bug
        const timer = setTimeout(() => {
            hotRef.current?.hotInstance?.render();
        }, 100); // 100ms delay

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

    const handleExport = () => {
        const hotInstance = hotRef.current?.hotInstance;
        if (hotInstance) {
            const exportPlugin = hotInstance.getPlugin('exportFile');
            exportPlugin.downloadFile('csv', { filename: `Stufaps-Database-${activeSheet}-[YYYY]-[MM]-[DD]`, exportHiddenColumns: true, exportHiddenRows: true });
        }
    };

    const handleSave = () => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) {
            return toast.error('Table instance not found.');
        }

        const dataToSave = hotInstance.getSourceData();

        const filteredData = dataToSave.filter((row: any) => {
            const hasAwardNumber = row.award_number && String(row.award_number).trim() !== '';
            const isNotEmpty = Object.values(row).some(val => val !== null && val !== '');
            return hasAwardNumber && isNotEmpty;
        });

        if (filteredData.length === 0) {
            return toast.info('No data with an award number was found to save.');
        }

        setIsSaving(true);
        router.post(route('superadmin.stufaps.bulkUpdate'), { data: filteredData }, {
            preserveState: true,
            onSuccess: () => toast.success('Database updated successfully!'),
            onError: (errors) => {
                console.error('Save failed with errors:', errors);
                toast.error('Failed to save changes. Please check the console for details.');
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const getExcelColumnName = (index: number): string => {
        let name = '';
        let i = index + 1; // 1-based
        while (i > 0) {
            const mod = (i - 1) % 26;
            name = String.fromCharCode(65 + mod) + name;
            i = Math.floor((i - 1) / 26);
        }
        return name;
    };

    const colHeaders = [
        'Sequence',
        // Scholar Info
        'Award Year', 'Program Name', 'Status Type', 'Region', 'Award Number',
        'Family Name', 'Given Name', 'Middle Name', 'Extension', 'Sex', 'Birthday',
        'Coconut Farmer', 'Farmer No.', 'Special Group',
        'Solo Parent', 'Senior', 'PWD', 'IP', '1st Gen',
        'Contact No.', 'Email',
        // Address
        'Brgy/Street', 'Town/City', 'Province', 'District',
        // Education
        'HEI Name', 'HEI Type', 'HEI Code', 'Program', 'Priority Program', 'Course Code',
        // AY 2023-2024
        'CY 2023', 'OSDS Processed', 'Transferred CHEDRO', 'NTA Benefits', 'Fund Source',
        '1st Sem Payment', '1st Sem Disbursement', '1st Sem Status', '1st Sem Remarks',
        '2nd Sem Payment', '2nd Sem Disbursement', '2nd Sem Status', '2nd Sem Fund Source',
        // Thesis 2023-2024
        'Thesis Processed', 'Thesis Details', 'Thesis Transferred', 'Thesis NTA', 'Thesis Amount',
        'Thesis Disbursement', 'Thesis Remarks',
        // AY 2024-2025
        'CY 2024', 'OSDS Processed', 'Transferred CHEDRO', 'NTA Benefits', 'Fund Source',
        '1st Sem Payment', '1st Sem Disbursement', '1st Sem Status', '1st Sem Remarks',
        '2nd Sem Payment', '2nd Sem Disbursement', '2nd Sem Status', '2nd Sem Fund Source',
        // Thesis 2024-2025
        'Thesis Processed', 'Thesis Details', 'Thesis Transferred', 'Thesis NTA', 'Thesis Amount',
        'Thesis Disbursement', 'Thesis Final Disbursement', 'Thesis Remarks',
    ];

    const letterRow = colHeaders.map((_, i) => getExcelColumnName(i));

    const nestedHeaders = [letterRow, colHeaders];

    const columns = [
        // Scholar
        { data: 'seq' },
        { data: 'award_year' },
        { 
            data: 'program_name',
            type: 'dropdown',
            source: scholarshipPrograms?.map(p => p.name) ?? [],
            allowInvalid: false
        },
        { data: 'status_type' }, { data: 'region' }, { data: 'award_number' },
        { data: 'family_name' }, { data: 'given_name' }, { data: 'middle_name' }, { data: 'extension_name' },
           { 
        data: 'sex', 
        type: 'dropdown', 
        source: ['M', 'F'],
        defaultValue: 'M', // <-- 1. SET A DEFAULT VALUE
        allowInvalid: false, // <-- 2. Disallow typing invalid values
    validator: function (value: any, callback: (isValid: boolean) => void) {
            const isValid = (value === 'M' || value === 'F');
            callback(isValid);
        }
    }, { data: 'date_of_birth', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { 
        data: 'registered_coconut_farmer',
        type: 'dropdown',
        source: ['Yes', 'No'],
        defaultValue: 'No', // Automatically set 'No' for new rows
        allowInvalid: false,
        validator: function (value: any, callback: (isValid: boolean) => void) {
            const isValid = (value === 'Yes' || value === 'No');
            callback(isValid);
        }
    },{ data: 'farmer_registry_no' }, { data: 'special_group' },
      {
        data: 'is_solo_parent',
        type: 'dropdown',
 source: ['YES', 'No'],
        defaultValue: 'NO'
    },
    {
        data: 'is_senior_citizen',
        type: 'dropdown',
 source: ['YES', 'No'],
        defaultValue: 'NO'
    },
    {
        data: 'is_pwd',
        type: 'dropdown',
 source: ['YES', 'No'],
        defaultValue: 'NO'
    },
    {
        data: 'is_ip',
        type: 'dropdown',
 source: ['YES', 'No'],
        defaultValue: 'NO'
    },
    {
        data: 'is_first_generation',
        type: 'dropdown',
        source: ['YES', 'No'],
        defaultValue: 'NO'
    },  
        { data: 'contact_no' }, { data: 'email_address' },
        // Address
        { data: 'address_brgy_street' }, { data: 'address_town_city' }, { data: 'address_province' }, { data: 'address_congressional_district' },
        // Education
        { data: 'education_hei_name' }, { data: 'education_type_of_heis' }, { data: 'education_hei_code' }, { data: 'education_program' },
        { data: 'education_priority_program_tagging' }, { data: 'education_course_code' },
        // AY 2023-2024
        { data: 'ay_2023_cy' }, { data: 'ay_2023_osds_date_processed', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2023_transferred_to_chedros' }, { data: 'ay_2023_nta_financial_benefits', type: 'numeric' }, { data: 'ay_2023_fund_source' },
        { data: 'ay_2023_payment_first_sem', type: 'numeric' }, { data: 'ay_2023_first_sem_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2023_first_sem_status' }, { data: 'ay_2023_first_sem_remarks' },
        { data: 'ay_2023_payment_second_sem', type: 'numeric' }, { data: 'ay_2023_second_sem_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2023_second_sem_status' }, { data: 'ay_2023_second_sem_fund_source' },
        // Thesis 2023
        { data: 'thesis_2023_processed_date', type: 'date', dateFormat: 'YYYY-MM-DD' }, { data: 'thesis_2023_details' },
        { data: 'thesis_2023_transferred_to_chedros' }, { data: 'thesis_2023_nta' }, { data: 'thesis_2023_amount', type: 'numeric' },
        { data: 'thesis_2023_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' }, { data: 'thesis_2023_remarks' },
        // AY 2024-2025
        { data: 'ay_2024_cy' }, { data: 'ay_2024_osds_date_processed', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2024_transferred_to_chedros' }, { data: 'ay_2024_nta_financial_benefits', type: 'numeric' }, { data: 'ay_2024_fund_source' },
        { data: 'ay_2024_payment_first_sem', type: 'numeric' }, { data: 'ay_2024_first_sem_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2024_first_sem_status' }, { data: 'ay_2024_first_sem_remarks' },
        { data: 'ay_2024_payment_second_sem', type: 'numeric' }, { data: 'ay_2024_second_sem_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'ay_2024_second_sem_status' }, { data: 'ay_2024_second_sem_fund_source' },
        // Thesis 2024
        { data: 'thesis_2024_processed_date', type: 'date', dateFormat: 'YYYY-MM-DD' }, { data: 'thesis_2024_details' },
        { data: 'thesis_2024_transferred_to_chedros' }, { data: 'thesis_2024_nta' }, { data: 'thesis_2024_amount', type: 'numeric' },
        { data: 'thesis_2024_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' },
        { data: 'thesis_2024_final_disbursement_date', type: 'date', dateFormat: 'YYYY-MM-DD' }, { data: 'thesis_2024_remarks' },
    ];

    if (sheets.length === 0) {
        return <div>No sheets available</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4 gap-4">
                <Input
                    type="search"
                    placeholder="Search and highlight..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export to CSV
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
            <Tabs value={activeSheet} onValueChange={setActiveSheet} className="flex flex-col-reverse relative mr-auto w-full">
                <TabsList>
                    {sheets.map((sheet) => (
                        <TabsTrigger key={sheet.name} value={sheet.name}>
                            {sheet.name === 'All Scholars' ? (
                                <Users className="w-4 h-4 mr-2" />
                            ) : (
                                <Award className="w-4 h-4 mr-2" />
                            )}
                            {sheet.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={activeSheet}>
                    <div id="hot-app">
                        <HotTable
                            ref={hotRef}
                            data={allData}
                            columns={columns}
                            nestedHeaders={nestedHeaders}
                            className={tableClassName}
                            formulas={{ engine: HyperFormula }}
                            rowHeaders={true}
                            width="100%"
                            height="60vh"
                            licenseKey="non-commercial-and-evaluation"
                            stretchH="all"
                            autoWrapRow={true}
                            autoWrapCol={true}
                            manualRowResize={true}
                            manualColumnResize={true}
                            contextMenu={true}
                            minSpareRows={5}
                            filters={true}
                            dropdownMenu={true}
                            multiColumnSorting={true}
                            hiddenColumns={{ columns: [], indicators: true }}
                            manualColumnMove={true}
                            viewportRowRenderingOffset={200} // Increased for smoother vertical scrolling
                            viewportColumnRenderingOffset={100} // Increased for smoother horizontal scrolling
                            hiddenRows={true} // Enable hidden rows plugin
                            manualColumnFreeze={true} // Excel-like column freezing
                            undo={true} // Undo/redo like Excel
                            copyPaste={true} // Copy/paste support
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
