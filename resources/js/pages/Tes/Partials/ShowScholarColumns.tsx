"use client";

import type { AcademicRecord, Course, Major, AcademicYear, Semester, BillingRecord, User } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ValidationEditModal } from "./ValidationEditModal";

// Update the type to include relations and new fields
export type AcademicRecordWithRelations = AcademicRecord & { 
    course: Course | null;
    major: Major | null;
    academic_year: AcademicYear | null;
    semester: Semester | null;
    billing_record: (BillingRecord & {
        validated_by: User | null;
    }) | null;
    // Ensure these exist on your type definition or are treated optionally
    eligibility_equivalent?: string | number;
    remarks?: string;
};

const formatCurrency = (amount: number | string | null | undefined) => {
    const num = parseFloat(String(amount || "0"));
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(num);
};

export const academicRecordColumns: ColumnDef<AcademicRecordWithRelations>[] = [
    // 1. Academic Year
    {
        header: "A.Y.",
        accessorKey: "academic_year.name",
        cell: ({ row }) => <span className="font-bold">{row.original.academic_year?.name || "N/A"}</span>,
    },
    // 2. Semester
    {
        header: "Semester",
        accessorKey: "semester.name",
        cell: ({ row }) => (
            <span className="text-xs uppercase font-semibold text-muted-foreground">
                {row.original.semester?.name || "N/A"}
            </span>
        ),
    },
    // 3. ✅ NEW: Eligibility Count
    {
        header: "Eligibility",
        accessorKey: "eligibility_equivalent",
        cell: ({ row }) => (
            <div className="text-center">
                <Badge variant="outline">
                    {row.original.eligibility_equivalent || "0.5"}
                </Badge>
            </div>
        ),
    },
    // 4. Status (Covers 1st/2nd Sem Status per row)
    {
        header: "Status",
        accessorKey: "billing_record.status",
        cell: ({ row }) => {
            const status = row.original.billing_record?.status;
            if (status === 'Validated' || status === 'Paid') {
                return <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Validated</Badge>;
            }
            if (status === 'On-going' || status === 'Processed') {
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Processed</Badge>;
            }
            if (status === 'Rejected') {
                return <Badge variant="destructive">Rejected</Badge>;
            }
            return <Badge variant="secondary" className="text-xs">Pending</Badge>;
        },
    },
    // 5. Billing Amount
    {
        header: "Amount",
        accessorKey: "billing_record.billing_amount",
        cell: ({ row }) => (
            <div className="text-right font-mono text-xs">
                {formatCurrency(row.original.billing_record?.billing_amount)}
            </div>
        ),
    },
    // 6. ✅ NEW: Remarks
    {
        header: "Remarks",
        accessorKey: "remarks",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground italic truncate max-w-[150px] block" title={row.original.remarks || ""}>
                {row.original.remarks || "-"}
            </span>
        ),
    },
    // 7. Actions
    {
        id: "actions",
        cell: ({ row }) => {
            const record = row.original;
            return <ValidationEditModal record={record} />;
        },
    },
];