"use client";

import type { AcademicRecord, Course, Major, AcademicYear, Semester, BillingRecord, User } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ValidationEditModal } from "./ValidationEditModal";

// ✅ Define the Extended Type
export type AcademicRecordWithRelations = AcademicRecord & {
    course: Course | null;
    major: Major | null;
    academic_year: AcademicYear | null;
    semester: Semester | null;
    billing_record: (BillingRecord & {
        validated_by: User | null;
    }) | null;
    eligibility_equivalent?: string | number | null; // ✅ Added field
};

// Helper to format currency
const formatCurrency = (amount: number | string | null | undefined) => {
    const num = parseFloat(String(amount || "0"));
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(num);
};

export const academicRecordColumns: ColumnDef<AcademicRecordWithRelations>[] = [
    {
        header: "A.Y.",
        accessorKey: "academic_year.name",
        cell: ({ row }) => row.original.academic_year?.name || "N/A",
    },
    {
        header: "Semester",
        accessorKey: "semester.name",
        cell: ({ row }) => row.original.semester?.name || "N/A",
    },
    // ✅ ADDED: Course Column
    {
        header: "Course",
        accessorKey: "course.course_name",
        cell: ({ row }) => (
            <span className="max-w-[200px] truncate block" title={row.original.course?.course_name || ""}>
                {row.original.course?.course_name || "N/A"}
            </span>
        ),
    },
    // ✅ ADDED: Year Level Column
    {
        header: "Year",
        accessorKey: "year_level",
        cell: ({ row }) => (
            <div className="text-center">
                {row.original.year_level || "-"}
            </div>
        ),
    },
    // ✅ ADDED: Eligibility Column
    {
        header: "Eligibility",
        accessorKey: "eligibility_equivalent",
        cell: ({ row }) => (
            <div className="text-center font-mono text-xs">
                {row.original.eligibility_equivalent || "-"}
            </div>
        ),
    },
    {
        header: "Billing Status",
        accessorKey: "billing_record.status",
        cell: ({ row }) => {
            const status = row.original.billing_record?.status;
            if (status === 'Validated') {
                return <Badge variant="success">Validated</Badge>;
            }
            if (status === 'On-going') {
                return <Badge variant="outline">On-going</Badge>;
            }
            return <Badge variant="secondary">Pending</Badge>;
        },
    },
    {
        header: "Billing Amount",
        accessorKey: "billing_record.billing_amount",
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {formatCurrency(row.original.billing_record?.billing_amount)}
            </div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const record = row.original;
            return <ValidationEditModal record={record} />;
        },
    },
];