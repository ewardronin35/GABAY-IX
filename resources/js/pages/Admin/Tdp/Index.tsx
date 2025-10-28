import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload } from 'lucide-react';
import { Toaster } from 'sonner';

// Partials for each tab
import { TdpDatabaseGrid } from './Partials/TdpDatabaseGrid';
import { TdpMasterlistGrid } from './Partials/TdpMasterlistGrid';
import { TdpReportGenerator } from './Partials/TdpReportGenerator';
import { TdpImportForm } from './Partials/TdpImportForm';

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
    filters?: { 
        search_db?: string;   // ✅ Make these more specific
        search_ml?: string;   // ✅ Make these more specific
    };
}
export default function TdpIndex({ auth, tdpRecords, tdpMasterlist, filters }: TdpIndexProps) {
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

                <Tabs defaultValue="database" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

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