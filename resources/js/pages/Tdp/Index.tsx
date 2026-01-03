import AuthenticatedLayout from "@/layouts/app-layout";
import { PageProps, PaginatedResponse, HEI, AcademicRecord, Semester } from "@/types";
import { Head, router, Link } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TdpHeiGrid } from "./Partials/TdpHeiGrid";
import { TdpDatabaseGrid } from "./Partials/TdpDatabaseGrid";
import { TdpMasterlistGrid } from "./Partials/TdpMasterlistGrid";
import { TdpImportForm } from "./Partials/TdpImportForm";
import { TdpReportGenerator } from "./Partials/TdpReportGenerator";
import { School, Sheet, List, BarChart3, Upload, FileCheck } from "lucide-react";
import { route } from "ziggy-js";

// Types matching Controller return
type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

export type TdpPageProps = PageProps & {
    databaseEnrollments: PaginatedResponse<AcademicRecord>;
    enrollments: PaginatedResponse<AcademicRecord>;
    paginatedHeis: PaginatedResponse<HEI & { enrollments_count: number }>;
    
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
        // ✅ NEW: Chart Data
        regionDistribution: { name: string; value: number }[];
        provinceDistribution: { name: string; value: number }[];
    };
    // ✅ NEW: Interpretation Text
    interpretation: string; 

    academicYears: string[];
    semesters: Semester[];
    batches: string[];
    heiList: Pick<HEI, "id" | "hei_name">[];
    courses?: { id: number; course_name: string }[];
    
    regions: LocationItem[];
    provinces: LocationItem[];
    districts: LocationItem[];
    cities: LocationItem[];

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
        region_id?: string;
        province_id?: string;
        city_id?: string;
        district_id?: string;
    };
};

export default function Index(props: TdpPageProps) {
    const {
        auth,
        databaseEnrollments,
        enrollments,
        paginatedHeis,
        statistics,
        graphs,
        interpretation, // ✅ Receive prop
        academicYears,
        semesters,
        batches,
        heiList,
        filters,
        ziggy,
        courses,
        regions,
        provinces,
        districts,
        cities
    } = props;

    if (!auth.user) return null;

    const onTabChange = (value: string) => {
        if (value === "validation") {
            router.visit(route("admin.tdp.validation.index"));
        } else {
            router.get(
                route("admin.tdp.index"),
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
                </div>

                <div className="space-y-4">
                    <Tabs defaultValue={ziggy.query.tab || "hei"} onValueChange={onTabChange}>
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:min-w-0">
                                <TabsTrigger value="hei" className="px-3 flex-1 md:flex-none">
                                    <School className="w-4 h-4 mr-2" /> By School
                                </TabsTrigger>
                                <TabsTrigger value="validation" className="px-3 flex-1 md:flex-none">
                                    <FileCheck className="w-4 h-4 mr-2" /> NOA Generation
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
                                batches={batches}
                            />
                        </TabsContent>

                        <TabsContent value="database">
                            <TdpDatabaseGrid
                                databaseData={databaseEnrollments}
                                filters={filters}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                                courses={courses}
                                regions={regions}
                                provinces={provinces}
                                districts={districts}
                                cities={cities}
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
                                regions={regions}
                                provinces={provinces}
                                districts={districts}
                                cities={cities}
                            />
                        </TabsContent>

                        <TabsContent value="import">
                            <TdpImportForm />
                        </TabsContent>

                        <TabsContent value="reports">
                            <TdpReportGenerator 
                                statistics={statistics} 
                                graphs={graphs}
                                interpretation={interpretation} // ✅ Pass to Generator
                                filters={filters}
                                academicYears={academicYears}
                                semesters={semesters}
                                batches={batches}
                                heiList={heiList}
                                courses={courses || []}
                                regions={regions}
                                provinces={provinces}
                                districts={districts}
                                cities={cities}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}