import AuthenticatedLayout from "@/layouts/app-layout";
import { PageProps, PaginatedResponse, HEI, AcademicRecord, Semester } from "@/types";
import { Head, router, Link } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; 
import { TdpHeiGrid } from "./Partials/TdpHeiGrid";
import { TdpDatabaseGrid } from "./Partials/TdpDatabaseGrid";
import { TdpMasterlistGrid } from "./Partials/TdpMasterlistGrid";
import { TdpImportForm } from "./Partials/TdpImportForm";
import { TdpReportGenerator } from "./Partials/TdpReportGenerator";
import { School, Sheet, List, BarChart3, Upload, FileCheck } from "lucide-react";
import { route } from "ziggy-js";

// removed TdpValidationGrid import

export type TdpPageProps = PageProps & {
    databaseEnrollments: PaginatedResponse<AcademicRecord>;
    enrollments: PaginatedResponse<AcademicRecord>;
    paginatedHeis: PaginatedResponse<HEI & { enrollments_count: number }>;
    // validationScholars removed (not needed here)
    statistics: {
        totalScholars: number;
        uniqueHeis: number;
        uniqueProvinces: number;
        uniqueCourses: number;
    };
    graphs: {
        sexDistribution: { name: string; value: number }[];
        yearLevelDistribution: { name: string; value: number }[];
        statusDistribution: { name: string; value: number }[];
        topHeis: { name: string; value: number }[];
    };
    academicYears: string[];
    semesters: Semester[];
    batches: string[];
    heiList: Pick<HEI, "id" | "hei_name">[];
    programs?: { id: number; program_name: string }[]; 
    courses?: { id: number; course_name: string }[]; 
    filters: {
        search_ml?: string;
        search_db?: string;
        search_hei?: string;
        search_validation?: string; 
        academic_year?: string;
        semester?: string;
        batch_no?: string;
        hei_id?: string;
        tab?: string;
        course_id?: string;
        program_id?: string;
    };
};

export default function Index(props: TdpPageProps) {
    const {
        auth,
        databaseEnrollments,
        enrollments,
        paginatedHeis,
        // validationScholars removed
        statistics,
        graphs,
        academicYears,
        semesters,
        batches,
        heiList,
        filters,
        ziggy,
        courses,
    } = props;

    if (!auth.user) return null;

    const onTabChange = (value: string) => {
        if (value === "validation") {
            // ✅ Redirects to the separate Validation Page
            router.visit(route("superadmin.tdp.validation.index"));
        } else {
            // Stays on Index page and switches filters
            router.get(
                route("superadmin.tdp.index"),
                { ...filters, tab: value },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="TDP Management">
            <Head title="TDP Management" />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Tulong Dunong Program (TDP)
                    </h2>
                    <div className="flex items-center space-x-2">
                        {/* Optional: Keep this button if you want a direct link too */}
                        <Link href={route('superadmin.tdp.validation.index')}>
                            <Button>
                                <FileCheck className="mr-2 h-4 w-4" />
                                Go to Validation
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    <Tabs
                        defaultValue={ziggy.query.tab || "hei"}
                        onValueChange={onTabChange}
                    >
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:min-w-0">
                                <TabsTrigger value="hei" className="px-3 flex-1 md:flex-none">
                                    <School className="w-4 h-4 mr-2" /> By School
                                </TabsTrigger>
                                
                                {/* This Trigger just acts as a button to redirect */}
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
                            <TdpHeiGrid
                                paginatedHeis={paginatedHeis}
                                filters={filters}
                            />
                        </TabsContent>

                        {/* ❌ REMOVED: <TabsContent value="validation"> ... </TabsContent> */}
                        {/* This prevents the Index page from trying to render validation data */}

                        <TabsContent value="database">
                            <TdpDatabaseGrid
                                databaseData={databaseEnrollments}
                                filters={filters}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                                courses={courses} 
                            />
                        </TabsContent>

                        <TabsContent value="masterlist">
                            <TdpMasterlistGrid
                                enrollments={enrollments}
                                filters={filters}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                            />
                        </TabsContent>

                        <TabsContent value="import">
                            <TdpImportForm />
                        </TabsContent>

                        <TabsContent value="reports">
                            <TdpReportGenerator 
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