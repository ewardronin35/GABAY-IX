"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MasterlistEditModal } from "./MasterlistEditModal"; 

// Define the data structure matching your backend response
type TesRowData = {
    id: number;
    seq?: string;
    student_id?: string;
    grant_amount?: number;
    batch_no?: string;
    enrollment?: {
        id: number;
        status?: string;
        award_number?: string;
        application_number?: string;
        scholar?: {
            id: number;
            family_name?: string;
            given_name?: string;
            middle_name?: string;
            contact_no?: string;
            email_address?: string;
            sex?: string;
            address?: {
                province?: { name: string };
                city?: { name: string };
            };
        };
    };
    hei?: {
        id?: number;
        hei_name?: string;
    };
    course?: {
        id?: number;
        course_name?: string;
    };
    academic_year?: { name?: string };
    semester?: { name?: string };
    year_level?: number;
    validation_status?: string;
    billingRecord?: {
        status?: string;
    };
};

export const columns: ColumnDef<TesRowData>[] = [
    // 1. CHECKBOX COLUMN ("Check check")
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // 2. SEQ
    {
        accessorKey: "seq",
        header: "SEQ",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.seq || "-"}</span>
    },
    // 3. STUDENT ID
    {
        accessorKey: "student_id",
        header: "Student ID",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.student_id || "-"}</span>
    },
    // 4. STUDENT NAME
    {
        id: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Student Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        accessorFn: (row) =>
            [
                row.enrollment?.scholar?.family_name,
                row.enrollment?.scholar?.given_name,
                row.enrollment?.scholar?.middle_name,
            ].filter(Boolean).join(", "),
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            const scholarId = row.original.enrollment?.scholar?.id;
            
            if (!scholarId) return <span className="text-muted-foreground">Unknown</span>;

            return (
                <Link 
                    href={route("admin.tes.scholar.show", scholarId)} 
                    className="font-medium text-blue-600 hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors uppercase text-xs"
                >
                    {name}
                </Link>
            );
        },
    },
    // 5. SEX
    {
        accessorPath: "enrollment.scholar.sex",
        header: "Sex",
        cell: ({ row }) => row.original.enrollment?.scholar?.sex || "-"
    },
    // 6. AWARD NO
    {
        header: "Award No.",
        accessorFn: (row) => row.enrollment?.award_number || "N/A",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.enrollment?.award_number || "-"}</span>
    },
    // 7. APP NO
    {
        header: "App No.",
        accessorFn: (row) => row.enrollment?.application_number || "N/A",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.enrollment?.application_number || "-"}</span>
    },
    // 8. HEI
    {
        header: "HEI / School",
        accessorKey: "hei.hei_name",
        cell: ({ row }) => <span className="truncate max-w-[200px] block text-xs uppercase" title={row.original.hei?.hei_name}>{row.original.hei?.hei_name || "N/A"}</span>
    },
    // 9. COURSE
    {
        header: "Course",
        accessorKey: "course.course_name",
        cell: ({ row }) => <span className="truncate max-w-[150px] block text-xs uppercase" title={row.original.course?.course_name}>{row.original.course?.course_name || "N/A"}</span>
    },
    // 10. YEAR LEVEL
    {
        header: "Year",
        accessorKey: "year_level",
        cell: ({ row }) => row.original.year_level ? `${row.original.year_level}` : "-"
    },
    // 11. ACADEMIC YEAR
    {
        header: "A.Y.",
        accessorKey: "academic_year.name",
        cell: ({ row }) => row.original.academic_year?.name || "-"
    },
    // 12. SEMESTER
    {
        header: "Sem",
        accessorKey: "semester.name",
        cell: ({ row }) => row.original.semester?.name || "-"
    },
    // 13. PROVINCE
    {
        header: "Province",
        accessorFn: (row) => row.enrollment?.scholar?.address?.province?.name,
        cell: ({ row }) => <span className="text-xs">{row.original.enrollment?.scholar?.address?.province?.name || "-"}</span>
    },
    // 14. CITY
    {
        header: "City",
        accessorFn: (row) => row.enrollment?.scholar?.address?.city?.name,
        cell: ({ row }) => <span className="text-xs">{row.original.enrollment?.scholar?.address?.city?.name || "-"}</span>
    },
    // 15. GRANT AMOUNT
    {
        header: "Grant Amt",
        accessorKey: "grant_amount",
        cell: ({ row }) => {
            const amount = parseFloat(String(row.original.grant_amount || 0));
            return <span className="font-mono text-xs">{amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>;
        }
    },
    // 16. PAYMENT STATUS
    {
        header: "Payment",
        accessorKey: "validation_status",
        cell: ({ row }) => {
            const status = row.original.validation_status || "Pending";
            let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "secondary";
            
            if (status === "Paid" || status === "Enrolled") variant = "success";
            else if (status === "Rejected" || status === "Unpaid") variant = "destructive";
            else if (status === "Pending") variant = "outline";

            return <Badge variant={variant} className="text-[10px]">{status}</Badge>;
        }
    },
    // 17. BILLING STATUS
    {
        header: "Billing",
        accessorKey: "billingRecord.status",
        cell: ({ row }) => <span className="text-xs">{row.original.billingRecord?.status || "Pending"}</span>
    },
    // 18. ACTIONS
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1">
                    <MasterlistEditModal record={row.original} />
                    {row.original.enrollment?.scholar?.id && (
                        <Link href={route("admin.tes.scholar.show", row.original.enrollment.scholar.id)}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                            </Button>
                        </Link>
                    )}
                </div>
            );
        },
    },
];