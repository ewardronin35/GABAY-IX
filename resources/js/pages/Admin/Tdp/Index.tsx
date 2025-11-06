import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react'; // ✅ Import router and usePage
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload, Building } from 'lucide-react';
import { Toaster } from 'sonner';

// Partials for each tab
import { TdpDatabaseGrid } from './Partials/TdpDatabaseGrid';
import { TdpMasterlistGrid } from './Partials/TdpMasterlistGrid';
import { TdpReportGenerator } from './Partials/TdpReportGenerator';
import { TdpImportForm } from './Partials/TdpImportForm';
import { TdpHeiGrid } from './Partials/TdpHeiGrid';
// Styles for Handsontable and FilePond
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'filepond/dist/filepond.min.css';

// Helper to manage Handsontable's theme
const getInitialThemeClass = (): string => {
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    return 'ht-theme-horizon';
};

// Define the shape of the paginator from Laravel
interface Paginator<T> {
    data: T[];
    links: any[];
}

// Define the props for this page
interface TdpIndexProps extends PageProps {
    tdpRecords?: Paginator<any>;
    tdpMasterlist?: Paginator<any>;
    heis?: Paginator<any>;
    filters?: { 
        search_db?: string;
        search_ml?: string;
        search_hei?: string;
        
    };
    allHeis: { id: number; hei_name: string }[]; // ✅ ADD THIS
    allBatches: string[]; // ✅ ADD THIS
    allAcademicYears: string[]; // ✅ ADD THIS LINE
}
export default function TdpIndex({ auth, tdpRecords, tdpMasterlist, heis, filters, allHeis, allBatches, allAcademicYears }: TdpIndexProps) {    const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    // ✅ START: Tab Management
    // Get the current URL from Inertia
    const { url } = usePage();
    // Helper function to get query params
    const getQueryParam = (param: string, defaultValue: string) => {
        const queryParams = new URLSearchParams(url.split('?')[1]);
        return queryParams.get(param) || defaultValue;
    };

    // Set active tab from URL 'tab' param, or default to 'hei'
    const [activeTab, setActiveTab] = useState(getQueryParam('tab', 'hei'));

    // This function runs when a new tab is clicked
    const handleTabChange = (tabValue: string) => {
        setActiveTab(tabValue);
        
        // Update the URL with the new tab parameter
        // We use router.get to visit the same page, but only change the URL
        router.get(route('superadmin.tdp.index'), {
            // Preserve all current filters
            ...filters,
            // Add/update the 'tab' parameter
            tab: tabValue,
            // Preserve pagination for other tabs (if they exist in filters)
            db_page: getQueryParam('db_page', '1'),
            ml_page: getQueryParam('ml_page', '1'),
            hei_page: getQueryParam('hei_page', '1'),
        }, { 
            preserveState: true, 
            replace: true 
        });
    };
    // ✅ END: Tab Management

    useEffect(() => {
        const observer = new MutationObserver(() => setTableClassName(getInitialThemeClass()));
        if (document.documentElement) {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
        return () => observer.disconnect();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user as User}
            page_title="TDP Database"
        >
            <Head title="TDP Database" />
            <Toaster richColors position="top-right" />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tulong Dunong Program (TDP)</h2>
                </div>
                
                {/* ✅ MODIFIED: Set 'value' and 'onValueChange' to manage tab state */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="hei"><Building className="w-4 h-4 mr-2" /> HEIs</TabsTrigger>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

                    {/* All TabsContent remains the same */}
                    <TabsContent value="hei" className="space-y-4">
                        {heis ? (
                            <TdpHeiGrid
                                heis={heis}
                                filters={filters}
                            />
                        ) : <p className="p-8 text-center text-muted-foreground">Data not available.</p>}
                    </TabsContent>
                    <TabsContent value="database" className="space-y-4">
                        {tdpRecords ? (
                            <TdpDatabaseGrid
                                records={tdpRecords}
                                filters={filters}
                                tableClassName={tableClassName}
                            />
                        ) : <p className="p-8 text-center text-muted-foreground">Data not available.</p>}
                    </TabsContent>
                        
                   <TabsContent value="masterlist" className="space-y-4">
                    {tdpMasterlist ? (
                         <TdpMasterlistGrid
                            records={tdpMasterlist}
                            filters={filters}
                        />
                    ) : <p className="p-8 text-center text-muted-foreground">Data not available.</p>}
                </TabsContent>

                   <TabsContent value="report" className="space-y-4">
                       {/* ✅ PASS THE PROPS DOWN */}
                       <TdpReportGenerator 
                            allHeis={allHeis}
                            allBatches={allBatches}
                            allAcademicYears={allAcademicYears} // ✅ ADD THIS PROP
                       />
                    </TabsContent>
                    
                    <TabsContent value="import" className="space-y-4">
                       <TdpImportForm />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}