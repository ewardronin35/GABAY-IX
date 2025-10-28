import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { route } from 'ziggy-js';

// Handsontable styles
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import 'handsontable/styles/ht-theme-horizon.css';

// FilePond styles and plugins
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';

// UI Components and Icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, List, Upload } from 'lucide-react'; // Added Upload icon

// Partials for each tab
import CoschoGrid from './Partials/CoschoGrid';
import { ReportGenerator } from './Partials/ReportGenerator';
import { MasterlistGrid } from './Partials/MasterlistGrid';
import { OfficialHeader } from './Partials/OfficialHeader';

// Register FilePond plugin
registerPlugin(FilePondPluginFileValidateType);
interface ScholarPaginator {
    data: any[];
    links: any[]; // You can make this more specific later
    // add other paginator properties if needed
}
const getInitialThemeClass = (): string => {
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    return 'ht-theme-horizon';
};

export default function StufapIndex({ auth, scholars, allRegions, allHeis, filters }: PageProps<{ scholars: ScholarPaginator, allRegions: string[], allHeis: string[], filters: { region?: string, hei?: string } }>) {
        const [tableClassName, setTableClassName] = useState(getInitialThemeClass());

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setTableClassName(getInitialThemeClass());
                }
            });
        });
        if (document.documentElement) observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    if (!scholars || !scholars.data) {
        return (
             <AuthenticatedLayout user={auth.user!}>
                <Head title="StuFAPs" />
                <div className="p-8">Loading or no data available...</div>
            </AuthenticatedLayout>
        );
    }
    
    return (
        <AuthenticatedLayout user={auth.user!}>
            <Head title="StuFAPs" />
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <OfficialHeader /> {/* Header is now above the tabs */}

                <Tabs defaultValue="coscho" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="coscho"><Database className="w-4 h-4 mr-2" /> COSCHO Database</TabsTrigger>
                        <TabsTrigger value="masterlist"><List className="w-4 h-4 mr-2" /> Masterlist</TabsTrigger>
                        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" /> Report Generator</TabsTrigger>
                        {/* ✅ NEW IMPORT TAB */}
                        <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" /> Import Excel</TabsTrigger>
                    </TabsList>

                    {/* COSCHO Database Tab */}
                   <TabsContent value="coscho" className="space-y-4">
        <CoschoGrid
            // ▼▼▼ UPDATE the props you are passing down ▼▼▼
            scholars={scholars} // Pass the entire paginator object
            allRegions={allRegions}
            allHeis={allHeis}
            filters={filters}
            tableClassName={tableClassName}
        />
    </TabsContent>

                    {/* ✅ MASTERLIST TAB */}
                    <TabsContent value="masterlist" className="space-y-4">
                        {/* ▼▼▼ REMOVE PROPS FROM MASTERLISTGRID ▼▼▼ */}
                        <MasterlistGrid />
                        {/* ▲▲▲ COMPONENT IS NOW SELF-CONTAINED ▲▲▲ */}
                    </TabsContent>
                    {/* ✅ REPORT GENERATOR TAB */}
                    <TabsContent value="report" className="space-y-4">
                       <div className="p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                            <ReportGenerator scholars={scholars.data} />
                       </div>
                    </TabsContent>

                    {/* ✅ IMPORT TAB */}
                    <TabsContent value="import" className="space-y-4">
                        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                             <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Import COSCHO Excel File
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Upload the Excel file (`.xlsx`, `.xls`, or `.xlsm`). The system will process it and update the database automatically.
                                </p>
                            </div>
     <FilePond
    name="file"
    server={{
        url: route('superadmin.coscho.import'),
        headers: {
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content,
        },
    }}
    acceptedFileTypes={[
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
    ]}
    labelFileTypeNotAllowed="Invalid file type. Please upload an Excel file."

    // Custom detection: Assign MIME based on extension for reliable validation
    fileValidateTypeDetectType={(source, type) =>
        new Promise((resolve, reject) => {
            const extension = source.name.toLowerCase().split('.').pop();
            let mime = '';

            switch (extension) {
                case 'xls':
                    mime = 'application/vnd.ms-excel';
                    break;
                case 'xlsx':
                    mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'xlsm':
                    mime = 'application/vnd.ms-excel.sheet.macroEnabled.12';
                    break;
                default:
                    reject(new Error('Invalid extension'));
            }

            if (mime) {
                resolve(mime);
            }
        })
    }
    
    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
    onprocessfile={(error, file) => {
        if (error) {
            toast.error('Import failed. Please check the file and try again.');
            return;
        }
        toast.success('File processed successfully! Refreshing data...');
        router.reload({ only: ['scholars'] });
    }}
/>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Toaster richColors position="top-right" />
        </AuthenticatedLayout>
    );
}
