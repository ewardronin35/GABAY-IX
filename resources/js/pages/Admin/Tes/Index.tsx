import AuthenticatedLayout from "@/layouts/app-layout";
import { PageProps, PaginatedResponse, HEI, AcademicRecord, Semester } from "@/types";
import { Head, router, Link } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; 
// Import your TES Components
import { TesHeiGrid } from "./Partials/TesHeiGrid";
import { TesDatabaseGrid } from "./Partials/TesDatabaseGrid";
import { TesMasterlistGrid } from "./Partials/TesMasterlistGrid";
import { TesImportForm } from "./Partials/TesImportForm";
import { TesReportGenerator } from "./Partials/TesReportGenerator";
import { School, Sheet, List, BarChart3, Upload, FileCheck } from "lucide-react";
import { route } from "ziggy-js";

export type TesPageProps = PageProps & {
    // These match the variables passed from TesController
    database_tes: PaginatedResponse<AcademicRecord>;
    ml_tes: PaginatedResponse<AcademicRecord>;
    paginatedHeis: PaginatedResponse<HEI & { enrollments_count: number }>;
    statistics: any;
    graphs: any;
    academicYears: string[];
    semesters: Semester[];
    batches: string[];
    heiList: any[];
    courses?: any[];
    filters: any; // Global filters
    filters_db: { search_db?: string };
    filters_ml: { search_ml?: string };
};

export default function TesIndex(props: TesPageProps) {
    const {
        auth,
        database_tes,
        ml_tes,
        paginatedHeis,
        statistics,
        graphs,
        academicYears,
        semesters,
        batches,
        heiList,
        filters,
        filters_db,
        filters_ml,
        ziggy,
        courses,
    } = props;

    if (!auth.user) return null;

    const onTabChange = (value: string) => {
        if (value === "validation") {
            // ✅ 1. Redirect to the Dynamic Validation Controller (TES Mode)
            router.visit(route("superadmin.tes.validation.index"));
        } else {
            // 2. Standard Tab Switch
            router.get(
                route("superadmin.tes.index"),
                { ...filters, tab: value },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="TES Management">
            <Head title="TES Management" />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Tertiary Education Subsidy (TES)
                    </h2>
                  
                </div>

                <div className="space-y-4">
                    <Tabs defaultValue={ziggy.query.tab || "hei"} onValueChange={onTabChange}>
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:min-w-0">
                                <TabsTrigger value="hei" className="px-3 flex-1 md:flex-none">
                                    <School className="w-4 h-4 mr-2" /> By School
                                </TabsTrigger>
                                
                                {/* ✅ VALIDATION TAB */}
                                <TabsTrigger value="validation" className="px-3 flex-1 md:flex-none">
                                    <FileCheck className="w-4 h-4 mr-2" /> Validation
                                </TabsTrigger>

                                <TabsTrigger value="database" className="px-3 flex-1 md:flex-none">
                                    <List className="w-4 h-4 mr-2" /> Database
                                </TabsTrigger>
                                <TabsTrigger value="masterlist" className="px-3 flex-1 md:flex-none">
                                    <Sheet className="w-4 h-4 mr-2" /> Masterlist
                                </TabsTrigger>
                                <TabsTrigger value="import" className="px-3 flex-1 md:flex-none">
                                    <Upload className="w-4 h-4 mr-2" /> Import
                                </TabsTrigger>
                                <TabsTrigger value="reports" className="px-3 flex-1 md:flex-none">
                                    <BarChart3 className="w-4 h-4 mr-2" /> Reports
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="hei">
                            <TesHeiGrid paginatedHeis={paginatedHeis} filters={filters} />
                        </TabsContent>

                        {/* ❌ NO VALIDATION CONTENT HERE. IT REDIRECTS. */}

                        <TabsContent value="database">
                            <TesDatabaseGrid
                                records={database_tes}
                                filters={filters_db}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                                courses={courses}
                            />
                        </TabsContent>

                        <TabsContent value="masterlist">
                            <TesMasterlistGrid
                                records={ml_tes}
                                filters={filters_ml}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                            />
                        </TabsContent>

                        <TabsContent value="import">
                            <TesImportForm />
                        </TabsContent>

                        <TabsContent value="reports">
                            <TesReportGenerator 
                                statistics={statistics} 
                                graphs={graphs}
                                filters={filters}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                                courses={courses || []}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}