// resources/js/pages/Admin/Tdp/Partials/ShowHei.tsx
import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, ScholarEnrollment, HEI, Course } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpHeiGridColumns"; 
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ShowHeiProps = PageProps & {
    hei: HEI;
    enrollments: PaginatedResponse<ScholarEnrollment>;
    filters: { 
        search?: string;
        academic_year?: string;
        batch_no?: string;
        course_id?: string;
    };
    academicYears: string[];
    batches: string[];
    courses: Pick<Course, "id" | "course_name">[];
};

export default function ShowHei({ auth, hei, enrollments, filters, academicYears, batches, courses }: ShowHeiProps) {
    if (!auth.user) return null;

    const { search, handleSearch } = useSearch(
        route('superadmin.tdp.hei.show', hei.id),
        filters.search || "",
        "search"
    );

    // New filter handler for this page
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route('superadmin.tdp.hei.show', hei.id),
            {
                ...filters,
                search: search,
                 // If value is "all", send `undefined` to clear the filter
                [key]: value === 'all' ? undefined : value, // <-- CHANGED
            },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };
    
    // --- DEBUGGING ---
    // console.log("Academic Years:", JSON.stringify(academicYears));
    // console.log("Batches:", JSON.stringify(batches));
    // console.log("Courses:", JSON.stringify(courses));

    return (
        <AuthenticatedLayout user={auth.user} page_title={`${hei.hei_name} - Scholars`}>
            <Head title={hei.hei_name} />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Link href={route('superadmin.tdp.index', { tab: 'hei' })}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to TDP List
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{hei.hei_name}</CardTitle>
                        <CardDescription>
                            All TDP scholars enrolled at this institution.
                        </CardDescription>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Input
                                placeholder="Search by scholar name..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full sm:max-w-xs"
                            />
                            <Select
                                // If filter is not set, default to "all"
                                value={filters.academic_year || "all"} // <-- CHANGED
                                onValueChange={(value) => handleFilterChange("academic_year", value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Academic Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Use "all" as the value */}
                                    <SelectItem value="all">All Academic Years</SelectItem> {/* <-- CHANGED */}
                                    {academicYears.filter(year => year).map((year) => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.batch_no || "all"} // <-- CHANGED
                                onValueChange={(value) => handleFilterChange("batch_no", value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem> {/* <-- CHANGED */}
                                    {batches.filter(batch => batch).map((batch) => (
                                        // Ensure batch is a string
                                        <SelectItem key={batch} value={String(batch)}>{batch}</SelectItem> // <-- CHANGED
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.course_id || "all"} // <-- CHANGED
                                onValueChange={(value) => handleFilterChange("course_id", value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem> {/* <-- CHANGED */}
                                    {courses.filter(course => course.id).map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>{course.course_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns} 
                            data={enrollments.data}
                        />
                        <PaginationLinks links={enrollments?.meta?.links || []} />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}