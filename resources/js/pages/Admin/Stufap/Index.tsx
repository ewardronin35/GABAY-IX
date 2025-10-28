import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload } from 'lucide-react';
import { Toaster } from 'sonner';

// ✅ NEW: Import all the partial components
import { StufapDatabaseGrid } from './Partials/StufapDatabaseGrid';
import { StufapMasterlistGrid } from './Partials/StufapMasterlistGrid';
import { StufapReportGenerator } from './Partials/StufapReportGenerator';
import { StufapImportForm } from './Partials/StufapImportForm';

// Handsontable & FilePond Styles
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'filepond/dist/filepond.min.css';

// Helper function to manage Handsontable's theme
const getInitialThemeClass = (): string => {
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    return 'ht-theme-horizon';
};

// Define the shape of the paginator object from Laravel
interface Paginator<T> {
    data: T[];
    links: any[];
}

// Define the props this page component will receive from the controller
interface StufapIndexProps extends PageProps {
    stufapRecords?: Paginator<any>;
    filters?: { search?: string };
}

export default function StufapIndex({ auth, stufapRecords, filters }: StufapIndexProps) {
    const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    // Effect to listen for theme changes and update the grid style
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTableClassName(getInitialThemeClass());
        });
        if (document.documentElement) {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
        return () => observer.disconnect();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user as User}
            page_title="StuFAPs Database"
        >
            <Head title="StuFAPs Database" />
            <Toaster richColors position="top-right" />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Student Financial Assistance Programs (StuFAPs)</h2>
                </div>

                <Tabs defaultValue="database" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

                    {/* StuFAPs Database Tab */}
                    <TabsContent value="database" className="space-y-4">
                        {stufapRecords ? (
                            <StufapDatabaseGrid
                                records={stufapRecords}
                                filters={filters}
                                tableClassName={tableClassName}
                            />
                        ) : (
                            <p className="p-8 text-center text-muted-foreground">Data for this grid is not available.</p>
                        )}
                    </TabsContent>

                    {/* ✅ UPDATED: Masterlist Tab */}
                    <TabsContent value="masterlist" className="space-y-4">
                        {stufapRecords ? (
                             <StufapMasterlistGrid
                                records={stufapRecords}
                                filters={filters}
                            />
                        ) : (
                             <p className="p-8 text-center text-muted-foreground">Data for the masterlist is not available.</p>
                        )}
                    </TabsContent>

                    {/* ✅ UPDATED: Report Generator Tab */}
                    <TabsContent value="report" className="space-y-4">
                       <StufapReportGenerator />
                    </TabsContent>
                    
                    {/* ✅ UPDATED: Import Tab */}
                    <TabsContent value="import" className="space-y-4">
                       <StufapImportForm />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}