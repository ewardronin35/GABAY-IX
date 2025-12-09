"use client";

import type { AcademicRecord, Course, Major, AcademicYear, Semester, BillingRecord, User } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
// --- NEW: Import our new form component ---
import { ValidationEditModal } from "./ValidationEditModal";
// --- END NEW ---

// Update the type to include the full user object
// Find this section and add 'export'
export type AcademicRecordWithRelations = AcademicRecord & { // <--- Added 'export'
    course: Course | null;
    major: Major | null;
    academic_year: AcademicYear | null;
    semester: Semester | null;
    billing_record: (BillingRecord & {
        validated_by: User | null;
    }) | null;
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
            <div className="text-right">
                {formatCurrency(row.original.billing_record?.billing_amount)}
            </div>
        ),
    },

    // --- NEW: This is the modal action button ---
    {
        id: "actions",
        cell: ({ row }) => {
            const record = row.original;
            // Just render the new component and pass the record to it
            return <ValidationEditModal record={record} />;
        },
    },
];