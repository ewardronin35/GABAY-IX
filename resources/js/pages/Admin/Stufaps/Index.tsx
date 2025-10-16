import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List } from 'lucide-react';
import { DatabaseGrid } from './Partials/CoschoGrid';
import { ReportGenerator } from './Partials/ReportGenerator';
import { MasterlistGrid } from './Partials/MasterlistGrid';
import { OfficialHeader } from './Partials/OfficialHeader'; // ✅ Import the new header
import TesGrid from './Partials/TesGrid'; // Import the new TesGrid component

const getInitialThemeClass = (): string => {
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    return 'ht-theme-horizon';
};

export default function StufapIndex({ auth, stufaps, scholarshipPrograms }: PageProps<{ stufaps: any, scholarshipPrograms: any[] }>) {
    if (!auth.user) return null;

    const [tableClassName, setTableClassName] = useState(getInitialThemeClass);

    useEffect(() => {
        const rootElement = document.documentElement;
        const handleThemeChange = () => setTableClassName(getInitialThemeClass());
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(rootElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    
    // This function transforms the normalized, nested data from Laravel
    // into a flat structure that Handsontable can easily display.
    const flattenStufapsData = (scholars: any[]) => {
        return scholars.map((scholar, index) => {
            const ay2023 = scholar.academic_years.find((ay: any) => ay.year === '2023-2024') || {};
            const thesis2023 = ay2023.thesis_grant || {};
            const ay2024 = scholar.academic_years.find((ay: any) => ay.year === '2024-2025') || {};
            const thesis2024 = ay2024.thesis_grant || {};

            return {
                // Scholar data
                ...scholar,
                
                // Address data (prefixed)
                address_brgy_street: scholar.address?.brgy_street,
                address_town_city: scholar.address?.town_city,
                address_province: scholar.address?.province,
                address_congressional_district: scholar.address?.congressional_district,

                // Education data (prefixed)
                education_hei_name: scholar.education?.hei_name,
                education_type_of_heis: scholar.education?.type_of_heis,
                education_hei_code: scholar.education?.hei_code,
                education_program: scholar.education?.program,
                education_priority_program_tagging: scholar.education?.priority_program_tagging,
                education_course_code: scholar.education?.course_code,

                // Academic Year 2023-2024 data (prefixed)
                ay_2023_cy: ay2023.cy,
                ay_2023_osds_date_processed: ay2023.osds_date_processed,
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

                // Thesis 2023-2024 data (prefixed)
                thesis_2023_processed_date: thesis2023.processed_date,
                thesis_2023_details: thesis2023.details,
                thesis_2023_transferred_to_chedros: thesis2023.transferred_to_chedros,
                thesis_2023_nta: thesis2023.nta,
                thesis_2023_amount: thesis2023.amount,
                thesis_2023_disbursement_date: thesis2023.disbursement_date,
                thesis_2023_remarks: thesis2023.remarks,

                // Academic Year 2024-2025 data (prefixed)
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

                // Thesis 2024-2025 data (prefixed)
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

    const flattenedData = flattenStufapsData(stufaps.data);

    // Filter the data into separate lists for each sheet
    const scholarshipTypes = ["CSMP", "MSRS", "TDP", "Unifast", "COSCHO", "TES", "StuFap"];
    const sheetsData = [
        { name: 'All Scholars', data: flattenedData },
        ...scholarshipTypes.map(type => ({
            name: type,
            data: flattenedData.filter(scholar => scholar.scholarship_program?.name === type)
        }))
    ];
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl">StuFAPs Database</h2>}
        >
            <Head title="StuFAPs Database" />
            <div className="py-12">
                <div className="max-w-screen-2xl mx-auto sm:px-6 lg:px-8">
                    <Tabs defaultValue="database" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="database">
                                <Database className="w-4 h-4 mr-2" /> Database
                            </TabsTrigger>
                            <TabsTrigger value="reports">
                                <FileText className="w-4 h-4 mr-2" /> Reports
                            </TabsTrigger>
                            <TabsTrigger value="masterlist">
                                <List className="w-4 h-4 mr-2" /> Masterlist
                            </TabsTrigger>
                            <TabsTrigger value="tes">TES</TabsTrigger> {/* Add the TES tab trigger */}
                        </TabsList>

                         <TabsContent value="database" className="space-y-4">
                            <OfficialHeader /> {/* ✅ ADD THE HEADER HERE */}
                            <DatabaseGrid
                                sheets={sheetsData}
                                tableClassName={tableClassName}
                                scholarshipPrograms={scholarshipPrograms}
                            />
                        </TabsContent>

                        <TabsContent value="reports">{ <ReportGenerator />}</TabsContent>
                        
                        <TabsContent value="masterlist">{<MasterlistGrid tableClassName={tableClassName} /> }</TabsContent>
                        <TabsContent value="tes">
                        <TesGrid /> {/* Add the TES tab content */}
                    </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Toaster richColors />
        </AuthenticatedLayout>
    );
}
