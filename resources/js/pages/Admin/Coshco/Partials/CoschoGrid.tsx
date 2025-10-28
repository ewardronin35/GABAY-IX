import { HotTable, HotTableClass } from '@handsontable/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { HyperFormula } from 'hyperformula';
import { Input } from "@/components/ui/input";
import { Download, Upload } from 'lucide-react';
import { registerAllModules } from 'handsontable/registry';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import clsx from 'clsx';
registerAllModules();
interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface Paginator<T> {
    data: T[];
    links: PageLink[];
}

// ▼▼▼ UPDATE the props interface ▼▼▼
interface CoschoGridProps {
    scholars: Paginator<any>;
    allRegions: string[];
    allHeis: string[];
filters: { region?: string, hei?: string, search?: string };
    tableClassName: string;
}
const PaginationLinks = ({ links }: { links: PageLink[] }) => {
    if (links.length <= 3) return null; // Don't show if only one page

    const handlePrefetch = (url: string | null) => {
        // Don't prefetch if there's no URL (e.g., for disabled "...")
        if (!url) return;
        
        // Use router.get to prefetch the data.
        // preserveState and preserveScroll ensure the UI doesn't change.
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <nav className="flex items-center justify-end gap-2 mt-4">
            {links.map((link, index) => (
                <Button
                    key={index}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                    disabled={!link.url}
                    size="sm"
                    variant={link.active ? 'default' : 'outline'}
                    className={clsx({ 'opacity-50 cursor-not-allowed': !link.url })}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </nav>
    );
};
export default function CoschoGrid({ scholars, allRegions, allHeis, filters, tableClassName }: CoschoGridProps) {
        const hotRef = useRef<HotTableClass>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [gridData, setGridData] = useState<any[]>([]);


    // ✅ NEW: State to hold the unique options for our dropdowns
const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [regionFilter, setRegionFilter] = useState(filters.region || 'all');
    const [heiFilter, setHeiFilter] = useState(filters.hei || 'all');
    // Assume scholarshipPrograms is defined or passed as prop. For now, set to empty array
    const scholarshipPrograms: any[] = [];

  useEffect(() => {
    // 1. Guard clause: If there's no data for the current page, empty the grid.
    if (!scholars || !scholars.data) {
        setGridData([]);
        return;
    }

        const flattenStufapsData = (scholars: any[]) => {
            return scholars.map(scholar => {
                // Find specific academic years or default to empty objects
                const ay2023 = scholar.academic_years.find((ay: any) => ay.academic_year === '2023-2024') || {};
                const thesis2023 = ay2023.thesis_grant || {};
                const ay2024 = scholar.academic_years.find((ay: any) => ay.academic_year === '2024-2025') || {};
                const thesis2024 = ay2024.thesis_grant || {};

                return {
                    // Core scholar data (spreads all top-level properties)

                    ...scholar,
                    award_year: ay2023.award_year || scholar.award_year,
                status_type: ay2023.status_type || scholar.status_type,
                award_number: ay2023.award_number || scholar.award_number,
                region: scholar.address?.region,
                    program_name: scholar.program?.program_name,
                    // Flattened Address
                    address_brgy_street: scholar.address?.brgy_street,
                    address_town_city: scholar.address?.town_city,
                    address_province: scholar.address?.province,
                    address_congressional_district: scholar.address?.congressional_district,

                    // Flattened Education
                    education_hei_name: scholar.education?.hei?.hei_name,
                    education_type_of_heis: scholar.education?.hei?.type_of_heis,
                    education_hei_code: scholar.education?.hei?.hei_code,
                    education_program: scholar.education?.course?.course_name, // Mapped to course_name
                    education_priority_program_tagging: scholar.education?.priority_program_tagging,
                    education_course_code: scholar.education?.course_code,

                    // Flattened Academic Year 2023-2024
                    ay_2023_cy: ay2023.cy,
                    ay_2023_osds_date_processed: ay2023.osds_date_processed,
                    ay_2023_osds_date_processed2: ay2023.osds_date_processed2,
                    ay_2023_transferred_to_chedros: ay2023.transferred_to_chedros,
                    ay_2023_nta_financial_benefits: ay2023.nta_financial_benefits,
                    ay_2023_fund_source: ay2023.fund_source,
                    ay_2023_payment_first_sem: ay2023.payment_first_sem,
                    ay_2023_first_sem_disbursement_date: ay2023.first_sem_disbursement_date,
                    ay_2023_first_sem_status: ay2023.first_sem_status,
                    ay_2023_first_sem_remarks: ay2023.first_sem_remarks,
                    ay_2023_payment_second_sem: ay2023.payment_second_sem,
                    ay_2023_second_sem_disbursement_date: ay2023.second_sem_disbursement_date,
                    ay_2023_second_sem_status: ay2023.second_sem_status,
                    ay_2023_second_sem_fund_source: ay2023.second_sem_fund_source,

                    // Flattened Thesis 2023-2024
                   thesis_2023_processed_date: thesis2023.processed_date,
                thesis_2023_details: thesis2023.details,
                thesis_2023_transferred_to_chedros: thesis2023.transferred_to_chedros,
                thesis_2023_nta: thesis2023.nta,
                thesis_2023_amount: thesis2023.amount,
                thesis_2023_disbursement_date: thesis2023.disbursement_date,
                thesis_2023_remarks: thesis2023.remarks,
                    
                    // Flattened Academic Year 2024-2025
                    ay_2024_cy: ay2024.cy,
                    ay_2024_osds_date_processed: ay2024.osds_date_processed,
                    ay_2024_transferred_to_chedros: ay2024.transferred_to_chedros,
                    ay_2024_nta_financial_benefits: ay2024.nta_financial_benefits,
                    ay_2024_fund_source: ay2024.fund_source,
                    ay_2024_payment_first_sem: ay2024.payment_first_sem,
                    ay_2024_first_sem_disbursement_date: ay2024.first_sem_disbursement_date,
                    ay_2024_first_sem_status: ay2024.first_sem_status,
                    ay_2024_first_sem_remarks: ay2024.first_sem_remarks,
                    ay_2024_payment_second_sem: ay2024.payment_second_sem,
                    ay_2024_second_sem_disbursement_date: ay2024.second_sem_disbursement_date,
                    ay_2024_second_sem_status: ay2024.second_sem_status,
                    ay_2024_second_sem_fund_source: ay2024.second_sem_fund_source,

                    // Flattened Thesis 2024-2025
                    thesis_2024_processed_date: thesis2024.processed_date,
                    thesis_2024_details: thesis2024.details,
                    thesis_2024_transferred_to_chedros: thesis2024.transferred_to_chedros,
                    thesis_2024_nta: thesis2024.nta,
                    thesis_2024_amount: thesis2024.amount,
                    thesis_2024_disbursement_date: thesis2024.disbursement_date,
                    thesis_2024_final_disbursement_date: thesis2024.final_disbursement_date,
                    thesis_2024_remarks: thesis2024.remarks,
                };
            });
        };

setGridData(flattenStufapsData(scholars.data));
}, [scholars.data]);

const handleSave = () => {
    const hotInstance = hotRef.current?.hotInstance;
    if (!hotInstance) {
        toast.error("Grid is not ready.");
        return;
    }

    // This gets the raw data from the grid, which is an array of arrays
    const dataAsArrays: any[][] = hotInstance.getData();

    // ✅ THE DEFINITIVE COLUMN MAP
    // This maps every column from your Excel file to the correct backend key.
    // ADJUST THESE INDEXES if your Excel template's column order changes.
   const columnMap = [
    // Scholar Information
    { index: 0, key: 'seq' },
    { index: 1, key: 'award_year' },
    { index: 2, key: 'program_name' },
    { index: 3, key: 'status_type' },
    { index: 4, key: 'region' },
    { index: 5, key: 'award_number' },
    { index: 6, key: 'family_name' },
    { index: 7, key: 'given_name' },
    { index: 8, key: 'middle_name' },
    { index: 9, key: 'extension_name' },
    { index: 10, key: 'sex' },
    { index: 11, key: 'date_of_birth' },
    { index: 12, key: 'registered_coconut_farmer' },
    { index: 13, key: 'farmer_registry_no' },
    { index: 14, key: 'special_group' },
    { index: 15, key: 'is_solo_parent' },
    { index: 16, key: 'is_senior_citizen' },
    { index: 17, key: 'is_pwd' },
    { index: 18, key: 'is_ip' },
    { index: 19, key: 'is_first_generation' },
    { index: 20, key: 'contact_no' },
    { index: 21, key: 'email_address' },

    // Address
    { index: 22, key: 'address_brgy_street' },
    { index: 23, key: 'address_town_city' },
    { index: 24, key: 'address_province' },
    { index: 25, key: 'address_congressional_district' },

    // Education
    { index: 26, key: 'education_hei_name' },
    { index: 27, key: 'education_type_of_heis' },
    { index: 28, key: 'education_hei_code' },
    { index: 29, key: 'education_program' },
    { index: 30, key: 'education_priority_program_tagging' },
    { index: 31, key: 'education_course_code' },

    // AY 2023-2024
    { index: 32, key: 'ay_2023_cy' },
    { index: 33, key: 'ay_2023_osds_date_processed' },
    { index: 34, key: 'ay_2023_transferred_to_chedros' },
    { index: 35, key: 'ay_2023_nta_financial_benefits' },
    { index: 36, key: 'ay_2023_fund_source' },
    { index: 37, key: 'ay_2023_payment_first_sem' },
    { index: 38, key: 'ay_2023_first_sem_disbursement_date' },
    { index: 39, key: 'ay_2023_first_sem_status' },
    { index: 40, key: 'ay_2023_first_sem_remarks' },
    { index: 41, key: 'ay_2023_osds_date_processed2' },
    { index: 42, key: 'ay_2023_transferred_to_chedros2' },
    { index: 43, key: 'ay_2023_nta_financial_benefits2' },

    { index: 44, key: 'ay_2023_payment_second_sem' },
    { index: 45, key: 'ay_2023_second_sem_disbursement_date' },
    { index: 46, key: 'ay_2023_second_sem_status' },
    { index: 47, key: 'ay_2023_second_sem_fund_source' },

    // Thesis 2023
    { index: 48, key: 'thesis_2023_processed_date' },
    { index: 49, key: 'thesis_2023_details' },
    { index: 50, key: 'thesis_2023_transferred_to_chedros' },
    { index: 51, key: 'thesis_2023_nta' },
    { index: 52, key: 'thesis_2023_amount' },
    { index: 53, key: 'thesis_2023_disbursement_date' },
    { index: 54, key: 'thesis_2023_remarks' },

    // AY 2024-2025
    { index: 55, key: 'ay_2024_cy' },
    { index: 56, key: 'ay_2024_osds_date_processed' },
    { index: 57, key: 'ay_2024_transferred_to_chedros' },
    { index: 58, key: 'ay_2024_nta_financial_benefits' },
    { index: 59, key: 'ay_2024_fund_source' },
    { index: 60, key: 'ay_2024_payment_first_sem' },
    { index: 61, key: 'ay_2024_first_sem_disbursement_date' },
    { index: 62, key: 'ay_2024_first_sem_status' },
    { index: 63, key: 'ay_2024_first_sem_remarks' },
    { index: 64, key: 'ay_2024_payment_second_sem' },
    { index: 65, key: 'ay_2024_second_sem_disbursement_date' },
    { index: 66, key: 'ay_2024_second_sem_status' },
    { index: 67, key: 'ay_2024_second_sem_fund_source' },

    // Thesis 2024
    { index: 68, key: 'thesis_2024_processed_date' },
    { index: 69, key: 'thesis_2024_details' },
    { index: 70, key: 'thesis_2024_transferred_to_chedros' },
    { index: 71, key: 'thesis_2024_nta' },
    { index: 72, key: 'thesis_2024_amount' },
    { index: 73, key: 'thesis_2024_disbursement_date' },
    { index: 74, key: 'thesis_2024_final_disbursement_date' },
    { index: 75, key: 'thesis_2024_remarks' },
];


    // This uses the map to convert the array of arrays into an array of objects
    const dataAsObjects = dataAsArrays.map(rowArray => {
        const rowObject: { [key: string]: any } = {};
        columnMap.forEach(map => {
            rowObject[map.key] = rowArray[map.index];
        });
        return rowObject;
    }).filter(row => row.family_name); // Filter out empty rows

    console.log("Data being sent to backend (FINAL FORMAT):", dataAsObjects);

    setIsSaving(true);
    toast.info('Saving changes...');

    router.put(route('superadmin.coscho.bulkUpdate'), { data: dataAsObjects }, {
        onSuccess: () => toast.success('Data saved successfully!'),
        onError: (errors) => {
            console.error("Backend validation errors:", errors);
            toast.error('An error occurred. Check the console for details.');
        },
        onFinish: () => setIsSaving(false),
    });
};
const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            router.get(route('superadmin.coshco.index'), {
                search: searchQuery,
                region: regionFilter,
                hei: heiFilter,
            }, {
                preserveState: true,
                replace: true,
            });
        }
    };

    // COMPREHENSIVE COLUMN DEFINITIONS MATCHING THE FLATTENED DATA
     const columns = [
        // Scholar
        { data: 'seq' },
        { data: 'award_year' },
        { 
            data: 'program_name',
            type: 'dropdown',
            source: scholarshipPrograms.map(p => p.name),
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
        { data: 'ay_2023_first_sem_status' }, { data: 'ay_2023_first_sem_remarks' }, { data: 'ay_2023_osds_date_processed2' }, { data : 'ay_2023_transferred_to_chedros2' }, {data :'nta_financial_benefits2' },
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

    const colHeaders = columns.map(c => c.data.toUpperCase().replace(/_/g, ' ')); // Generate from data since no title
const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
    });

    // ✅ ADD THIS SUBMIT HANDLER
    function handleImportSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (data.file) {
            post(route('superadmin.coscho.import'), {
                onSuccess: () => {
                    toast.success('File is uploading and being processed.');
                },
                onError: (e) => {
                    console.error(e);
                    toast.error('File upload failed. Check file format.');
                }
            });
        } else {
            toast.warning('Please select a file to import.');
        }
    }
   
   useEffect(() => {
        // This logic determines if the user has actually changed a filter
        // from what the server last reported.
        const filtersHaveChanged = 
            searchQuery !== (filters.search || '') ||
            regionFilter !== (filters.region || 'all') ||
            heiFilter !== (filters.hei || 'all');

        // Only proceed if a filter has actually been changed by the user.
        if (!filtersHaveChanged) {
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('superadmin.coshco.index'), // Using the correct route name
                {
                    search: searchQuery,
                    region: regionFilter,
                    hei: heiFilter,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 400); // 400ms delay for a smooth experience

        return () => clearTimeout(timer);

    }, [searchQuery, regionFilter, heiFilter, filters]);
return (
    <>
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <Input 
                    placeholder="Search name, school, award no..." 
                    value={searchQuery} 
onChange={e => setSearchQuery(e.target.value)} // Just update the state                  \\
                    className="max-w-xs" 
                />
            <div className="flex items-center gap-2">
                {/* ▼▼▼ UPDATED REGION FILTER ▼▼▼ */}
                <Select 
                        value={regionFilter} 
                        // It now ONLY updates the state. The useEffect will handle the rest.
                        onValueChange={(value) => setRegionFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {allRegions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                        </SelectContent>
                    </Select>

                {/* ▼▼▼ UPDATED HEI FILTER ▼▼▼ */}
                <Select 
                        value={heiFilter} 
                        // It also ONLY updates the state now.
                        onValueChange={(value) => setHeiFilter(value)}
                    >
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Filter by HEI" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All HEIs</SelectItem>
                            {allHeis.map(hei => <SelectItem key={hei} value={hei}>{hei}</SelectItem>)}
                        </SelectContent>
                    </Select>
                {/* ▲▲▲ The "Filter" button is no longer needed ▲▲▲ */}
            </div>
            <div className="space-x-2">
                <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Upload className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
        <div className={tableClassName}>
            <HotTable
                ref={hotRef}
                data={gridData}
                colHeaders={colHeaders}
                columns={columns}
                rowHeaders={true}
                width="100%"
                height="60vh"
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                manualColumnResize={true}
                contextMenu={true}
                minSpareRows={1}
                filters={true}
                search={true}
                dropdownMenu={true}
            />
        </div>
        <PaginationLinks links={scholars.links} />
    </>
);
}