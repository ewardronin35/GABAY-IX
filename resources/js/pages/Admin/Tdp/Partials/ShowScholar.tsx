import  AuthenticatedLayout  from '@/layouts/app-layout';
import { PageProps, Scholar } from "@/types";
import { Head } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
import { DataTable } from "@/components/ui/data-table";
// --- ▲▲▲ END OF FIX ▲▲▲ ---

type ShowScholarProps = PageProps & {
    scholar: Scholar;
};

export default function ShowScholar({ auth, scholar }: ShowScholarProps) {
    if (!auth.user) return null;

    const {
        given_name,
        family_name,
        middle_name,
        extension_name,
        sex,
        contact_no,
        email_address,
        address,
        education,
        enrollments,
    } = scholar;

    const fullName = [family_name, given_name, middle_name, extension_name]
        .filter(Boolean)
        .join(", ");

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {fullName}
                </h2>
            }
        >
            <Head title={fullName} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scholar Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Full Name" value={fullName} />
                                <InfoItem label="Email" value={email_address} />
                                <InfoItem label="Contact" value={contact_no} />
                                <InfoItem label="Sex" value={sex} />
                                <InfoItem
                                    label="Address"
                                    value={[
                                        address?.brgy_street,
                                        address?.town_city,
                                        address?.province,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                />
                                <InfoItem
                                    label="HEI"
                                    value={education?.hei?.hei_name}
                                />
                                <InfoItem
                                    label="Course"
                                    value={education?.course?.course_name}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- Enrollment History Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment History</CardTitle>
                            <CardDescription>
                                A record of the scholar's enrollments and
                                academic status per semester.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion
                                type="multiple"
                                className="w-full"
                            >
                                {enrollments && enrollments.length > 0 ? (
                                    enrollments.map((enrollment) => (
                                        <AccordionItem
                                            value={`enrollment-${enrollment.id}`}
                                            key={enrollment.id}
                                        >
                                            <AccordionTrigger>
                                                <div className="flex justify-between items-center w-full pr-4">
                                                    <span className="font-semibold text-lg">
                                                        {enrollment.program.program_name}
                                                    </span>
                                                    <Badge>
                                                        {enrollment.status}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <DataTable
                                                    columns={
                                                        academicRecordColumns
                                                    }
                                                    data={
                                                        enrollment.academicRecords
                                                    }
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">
                                        No enrollment history found.
                                    </p>
                                )}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper component for info items
const InfoItem = ({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {value || "N/A"}
        </dd>
    </div>
);

// --- Columns for the history table ---
import type { ColumnDef } from "@tanstack/react-table";
import { AcademicRecord } from "@/types";

export const academicRecordColumns: ColumnDef<AcademicRecord>[] = [
    {
        accessorKey: "academic_year",
        header: "A.Y.",
    },
    {
        accessorKey: "semester",
        header: "Semester",
    },
    {
        accessorKey: "year_level",
        header: "Year Level",
    },
    {
        accessorKey: "grant_amount",
        header: "Grant",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("grant_amount") || "0");
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "PHP",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "payment_status",
        header: "Payment Status",
    },
];