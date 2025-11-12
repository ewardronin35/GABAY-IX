// resources/js/pages/Admin/Tdp/Index.tsx

import  AuthenticatedLayout  from '@/layouts/app-layout';

import {
    PageProps, PaginatedResponse, ScholarEnrollment,
    HEI, Course, Paginator,
} from "@/types";
import { Head, router } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TdpHeiGrid } from "./Partials/TdpHeiGrid";
import { TdpDatabaseGrid } from "./Partials/TdpDatabaseGrid";
import { TdpMasterlistGrid } from "./Partials/TdpMasterlistGrid";
import { TdpImportForm } from "./Partials/TdpImportForm";
import { TdpReportGenerator } from "./Partials/TdpReportGenerator";
import { School, Sheet, List, BarChart3, Upload } from "lucide-react";
import { route } from "ziggy-js";
export type TdpPageProps = PageProps & {
    databaseEnrollments: PaginatedResponse<ScholarEnrollment>; // <-- ADD THIS
    enrollments: PaginatedResponse<ScholarEnrollment>;
    paginatedHeis: PaginatedResponse<HEI & { scholar_count: number }>;
    statistics: {
        totalScholars: number; uniqueHeis: number;
        uniqueProvinces: number; uniqueCourses: number;
    };
    academicYears: string[];
    semesters: string[];
    courses: Course[];
    filters: {
        search_db?: string; search_ml?: string;
        search_hei?: string; academic_year?: string;
        semester?: string;
        tab?: string;
    };
};

export default function Index({ auth, ...props }: TdpPageProps) {
    if (!auth.user) return null; 
const currentTab = props.filters.tab || 'hei';

    // 2. Create a handler that updates the URL when you change tabs
    const handleTabChange = (newTab: string) => {
        // We use router.get to update the URL's 'tab' parameter
        router.get(route('superadmin.tdp.index'), {
            ...props.filters, // Keep all other filters
            tab: newTab,      // Set the new tab
        }, {
            preserveState: true,
            replace: true,
          preserveScroll: true,
        });
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    TDP Management
                </h2>
            }
        >
            <Head title="TDP Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tabs 
                        value={currentTab} 
                        onValueChange={handleTabChange}
                        className="w-full" // <- (defaultValue="hei" is removed)
                    >
                        <TabsList className="grid w-full grid-cols-5 h-12">
                            <TabsTrigger value="hei" className="text-xs sm:text-sm gap-2">
                                <School className="h-4 w-4" />
                                <span className="hidden sm:inline">HEI</span>
                            </TabsTrigger>
                            <TabsTrigger value="database" className="text-xs sm:text-sm gap-2">
                                <Sheet className="h-4 w-4" />
                                <span className="hidden sm:inline">Database</span>
                            </TabsTrigger>
                            <TabsTrigger value="masterlist" className="text-xs sm:text-sm gap-2">
                                <List className="h-4 w-4" />
                                <span className="hidden sm:inline">Masterlist</span>
                            </TabsTrigger>
                            <TabsTrigger value="import" className="text-xs sm:text-sm gap-2">
                                <Upload className="h-4 w-4" />
                                <span className="hidden sm:inline">Import</span>
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="text-xs sm:text-sm gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Reports</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="hei">
                            <TdpHeiGrid
                                paginatedHeis={props.paginatedHeis}
                                filters={props.filters}
                            />
                        </TabsContent>
                        
                        <TabsContent value="database">
                            <TdpDatabaseGrid
                               databaseData={props.databaseEnrollments} // <-- NEW UNIQUE NAME // <-- NEW
                                filters={props.filters}
                                academicYears={props.academicYears}
                                semesters={props.semesters}
                            />
                        </TabsContent>

                        <TabsContent value="masterlist">
                            <TdpMasterlistGrid
                                enrollments={props.enrollments}
                                filters={props.filters}
                                academicYears={props.academicYears}
                                semesters={props.semesters}
                            />
                        </TabsContent>

                        <TabsContent value="import">
                            <TdpImportForm />
                        </TabsContent>

                        <TabsContent value="reports">
                            <TdpReportGenerator
                                statistics={props.statistics}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}