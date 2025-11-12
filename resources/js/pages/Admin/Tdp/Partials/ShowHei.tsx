import AuthenticatedLayout from '@/layouts/app-layout';
import {
    PageProps,
    PaginatedResponse,
    ScholarEnrollment,
    HEI,
} from "@/types";
import { Head } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpHeiGridColumns"; // Assuming you reuse columns
import { Pagination } from "@/components/ui/pagination";

type ShowHeiProps = PageProps & {
    hei: HEI;
    enrollments: PaginatedResponse<ScholarEnrollment>;
};

export default function ShowHei({ auth, hei, enrollments }: ShowHeiProps) {
    if (!auth.user) return null;

    /**
     * Groups enrollments by their first academic record's year.
     */
    const groupEnrollmentsByYear = (
        enrollmentsList: ScholarEnrollment[] | null | undefined
    ) => {
        // If the list is null or undefined, return an empty object
        if (!enrollmentsList) {
            return {};
        }

        return enrollmentsList.reduce(
            (acc, enrollment) => {
                // --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
                // We must use optional chaining on 'academicRecords' *before*
                // trying to access its [0] index.
                const year =
                    enrollment.academicRecords?.[0]?.academic_year || "Unknown";
                // --- ▲▲▲ END OF FIX ▲▲▲ ---

                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(enrollment);
                return acc;
            },
            {} as Record<string, ScholarEnrollment[]>
        );
    };

    // This line is now safe because groupEnrollmentsByYear always returns an object
    const academicYears = Object.entries(
        groupEnrollmentsByYear(enrollments.data)
    ).sort(
        ([yearA], [yearB]) =>
            parseInt(yearB.split("-")[0] || "0") -
            parseInt(yearA.split("-")[0] || "0")
    ); // Sort descending

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {hei.hei_name}
                </h2>
            }
        >
            <Head title={hei.hei_name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{hei.hei_name}</CardTitle>
                            <CardDescription>
                                Scholars grouped by Academic Year
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                                defaultValue={
                                    academicYears[0]?.[0] // Default to first (latest) year
                                }
                            >
                                {academicYears.length > 0 ? (
                                    academicYears.map(([year, enrollments]) => {
                                        const count = enrollments.length;
                                        return (
                                            <AccordionItem
                                                value={year}
                                                key={year}
                                            >
                                                <AccordionTrigger>
                                                    <div className="flex justify-between items-center w-full pr-4">
                                                        <span>
                                                            A.Y. {year}
                                                        </span>
                                                        <Badge variant="secondary">
                                                            {count}{" "}
                                                            {count === 1
                                                                ? "Scholar"
                                                                : "Scholars"}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <DataTable
                                                        columns={columns}
                                                        data={enrollments}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500">
                                        No scholars found for this HEI.
                                    </p>
                                )}
                            </Accordion>
                            
                            {/* Add pagination controls for the main 'enrollments' prop */}
                            <Pagination paginator={enrollments} className="mt-6" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}