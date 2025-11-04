import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { useState, useEffect } from 'react';

// UI Components and Partials
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload, Building } from 'lucide-react';
import { Toaster } from 'sonner';
import { TesDatabaseGrid } from './Partials/TesDatabaseGrid';
import { TesMasterlistGrid } from './Partials/TesMasterlistGrid';
import { TesReportGenerator } from './Partials/TesReportGenerator';
import { TesImportForm } from './Partials/TesImportForm';
// Handsontable Styles
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';

const getInitialThemeClass = (): string => {
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    return 'ht-theme-horizon';
};

interface Paginator<T> {
    data: T[];
    links: any[];
}

// ▼▼▼ THIS IS THE FIX ▼▼▼
// Update the props to match what the controller is sending.
interface TesIndexProps extends PageProps {
    tesDatabase: Paginator<any>;   // Expect 'tesDatabase'
    tesMasterlist: Paginator<any>; // Expect 'tesMasterlist'
    heis?: Paginator<any>; // ✅ ADD THIS
    filters: { search_db?: string, search_ml?: string, search_hei?: string; };
}
// ▲▲▲ END OF FIX ▲▲▲

export default function TesIndex({ auth, tesDatabase, tesMasterlist, filters,  heis,  }: TesIndexProps) {

    const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    useEffect(() => {
        const observer = new MutationObserver(() => setTableClassName(getInitialThemeClass()));
        if (document.documentElement) {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
        return () => observer.disconnect();
    }, []);

   return (
        <AuthenticatedLayout user={auth.user as User}>
            <Head title="TES Database" />
            <Toaster richColors position="top-right" />
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <h2 className="text-3xl font-bold tracking-tight">Tertiary Education Subsidy (TES)</h2>
                <Tabs defaultValue="database" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="hei"><Building className="w-4 h-4 mr-2" /> HEIs</TabsTrigger>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="database" className="space-y-4">
                        {tesDatabase && <TesDatabaseGrid records={tesDatabase} filters={filters} tableClassName={tableClassName} />}
                    </TabsContent>
                    <TabsContent value="masterlist" className="space-y-4">
                        {tesMasterlist && <TesMasterlistGrid records={tesMasterlist} filters={filters} />}
                    </TabsContent>
                    <TabsContent value="report" className="space-y-4">
                        <TesReportGenerator />
                    </TabsContent>
                    <TabsContent value="import" className="space-y-4">
                        <TesImportForm />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}