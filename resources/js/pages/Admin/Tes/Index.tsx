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
interface TesPageProps extends PageProps {
    auth: { user: User };
    database_tes: Paginator<any>; // Changed from tesDatabase
    ml_tes: Paginator<any>;         // Changed from tesMasterlist
    hei_list: any[];
    course_list: any[];
    filters_db: { search_db?: string }; // Changed from filters
    filters_ml: { search_ml?: string }; // Changed from filters
}
// ▲▲▲ END OF FIX ▲▲▲

export default function Tes({
    auth,
    database_tes, // Renamed prop
    ml_tes,       // Renamed prop
    hei_list,
    course_list,
    filters_db,   // Renamed prop
    filters_ml,   // Renamed prop
}: TesPageProps) {
    const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setTableClassName(getInitialThemeClass());
                }
            });
        });
        if (typeof window !== 'undefined' && document.documentElement) {
            observer.observe(document.documentElement, { attributes: true });
        }
        return () => observer.disconnect();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">TES Module</h2>}
        >
            <Head title="TES Module" />
            <Toaster richColors position="top-right" />
            <div className="py-12">
                <Tabs defaultValue="database" className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
                    <TabsList>
                        <TabsTrigger value="hei"><Building className="w-4 h-4 mr-2" /> HEIs</TabsTrigger>
                        <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="database" className="space-y-4">
                        {/* ▼▼▼ FIX: Pass the correct props down ▼▼▼ */}
                        {database_tes && <TesDatabaseGrid records={database_tes} filters={filters_db} tableClassName={tableClassName} />}
                    </TabsContent>
                    <TabsContent value="masterlist" className="space-y-4">
                        {/* ▼▼▼ FIX: Pass the correct props down ▼▼▼ */}
                        {ml_tes && <TesMasterlistGrid records={ml_tes} filters={filters_ml} />}
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