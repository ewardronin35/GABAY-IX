import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload, Monitor } from 'lucide-react';
import { Toaster } from 'sonner';

// Partials for each tab
import { EstatDatabaseGrid } from './Partials/EstatDatabaseGrid';
import { EstatMasterlistGrid } from './Partials/EstatMasterlistGrid';
import { EstatMonitoringGrid } from './Partials/EstatMonitoringGrid';
import { EstatReportGenerator } from './Partials/EstatReportGenerator'; 
import { EstatImportForm } from './Partials/EstatImportForm';

// Styles
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

// Define the shape of the paginator and the page props
interface Paginator<T> {
    data: T[];
    links: any[];
}
interface EstatIndexProps extends PageProps {
    beneficiaries?: Paginator<any>;
    monitorings?: Paginator<any>; // Add if you paginate monitorings separately
    filters?: { search?: string };
}

export default function EstatIndex({ auth, beneficiaries, filters }: EstatIndexProps) {
    const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    useEffect(() => {
        const observer = new MutationObserver(() => setTableClassName(getInitialThemeClass()));
        if (document.documentElement) {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
        return () => observer.disconnect();
    }, []);

    return (
        <AuthenticatedLayout user={auth.user as User} page_title="E-STAT Skolar">
            <Head title="E-STAT Skolar" />
            <Toaster richColors position="top-right" />
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <h2 className="text-3xl font-bold tracking-tight">E-STAT Skolar Program</h2>
                <Tabs defaultValue="database" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="monitoring"><Monitor className="w-4 h-4 mr-2" /> Monitoring</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="database">
                        <EstatDatabaseGrid records={beneficiaries} filters={filters} tableClassName={tableClassName} />
                    </TabsContent>
                    <TabsContent value="masterlist">
                         <EstatMasterlistGrid records={beneficiaries} filters={filters} />
                    </TabsContent>
                    <TabsContent value="monitoring">
                        <EstatMonitoringGrid records={beneficiaries} filters={filters} tableClassName={tableClassName} />
                    </TabsContent>
                    <TabsContent value="report">
                       <EstatReportGenerator />
                    </TabsContent>
                    <TabsContent value="import">
                       <EstatImportForm />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}