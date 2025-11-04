import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';

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
// Define the props for this page
interface TdpIndexProps extends PageProps {
    tdpRecords?: Paginator<any>;
    tdpMasterlist?: Paginator<any>; // ✅ ADD THIS LINE
    heis?: Paginator<any>; // ✅ ADD THIS
    filters?: { 
        search_db?: string;   // ✅ Make these more specific
        search_ml?: string;   // ✅ Make these more specific
        search_hei?: string; // ✅ ADD THIS
    };
}
export default function TdpIndex({ auth, tdpRecords, tdpMasterlist, heis, filters }: TdpIndexProps) {
            const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

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
<Tabs defaultValue="hei" className="space-y-4">
                    <TabsList>
                        {/* ▼▼▼ ADD NEW 'HEI' TAB TRIGGER ▼▼▼ */}
                        <TabsTrigger value="hei"><Building className="w-4 h-4 mr-2" /> HEIs</TabsTrigger>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>
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
                    {/* ▼▼▼ CHANGE tdpRecords TO tdpMasterlist HERE ▼▼▼ */}
                    {tdpMasterlist ? (
                         <TdpMasterlistGrid
                            records={tdpMasterlist} // ✅ CHANGED
                            filters={filters}
                        />
                    ) : <p className="p-8 text-center text-muted-foreground">Data not available.</p>}
                </TabsContent>

                    <TabsContent value="report" className="space-y-4">
                       <TdpReportGenerator />
                    </TabsContent>
                    
                    <TabsContent value="import" className="space-y-4">
                       <TdpImportForm />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}