"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MasterlistEditModal } from "./MasterlistEditModal";

type TdpRowData = {
    id: number;
    enrollment?: {
        id: number;
        status?: string;
        award_number?: string;
        program_name?: string;
        scholar?: {
            id: number;
            family_name?: string;
            given_name?: string;
            middle_name?: string;
            contact_no?: string;
            // ✅ Address relations required for columns
            address?: {
                region?: { name: string };
                province?: { name: string };
                city?: { name: string };
                district?: { name: string };
            }
        };
        program?: {
            program_name?: string;
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
    payment_status?: string;
    billing_record?: { status: string };
};

export const columns: ColumnDef<TdpRowData>[] = [
    {
        id: "name",
        header: "Student Name",
        accessorFn: (row) => {
            const scholar = row.enrollment?.scholar;
            if (!scholar) return "Unknown";
            return [scholar.family_name, scholar.given_name, scholar.middle_name].filter(Boolean).join(", ");
        },
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            const scholarId = row.original.enrollment?.scholar?.id;

            if (!scholarId) return <span className="text-muted-foreground">{name}</span>;

            return (
                <Link 
                    href={route("admin.tdp.scholar.show", scholarId)} 
                    className="font-medium text-primary hover:underline decoration-primary/50 underline-offset-4 transition-colors"
                >
                    {name}
                </Link>
            );
        },
    },
    // ✅ Location Columns
    {
        id: "region",
        header: "Region",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.enrollment?.scholar?.address?.region?.name || '-'}</span>
    },
    {
        id: "province",
        header: "Province",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.enrollment?.scholar?.address?.province?.name || '-'}</span>
    },
    {
        id: "city",
        header: "City",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.enrollment?.scholar?.address?.city?.name || '-'}</span>
    },
    {
        id: "district",
        header: "District",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.enrollment?.scholar?.address?.district?.name || '-'}</span>
    },
    // -------------------
    {
        accessorKey: "course.course_name",
        header: "Course",
        cell: ({ row }) => {
            const courseName = row.original.course?.course_name;
            return <span className="truncate max-w-[200px] block text-foreground font-medium text-xs" title={courseName}>{courseName || '-'}</span>;
        }
    },
    {
        accessorKey: "hei.hei_name",
        header: "HEI",
        cell: ({ row }) => {
            const heiName = row.original.hei?.hei_name;
            return <span className="truncate max-w-[180px] block text-muted-foreground text-xs" title={heiName}>{heiName || '-'}</span>;
        }
    },
    // ✅ Status Columns
    {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
            const status = row.original.payment_status || 'Pending';
            const color = status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
            return <Badge variant="outline" className={`border-0 ${color}`}>{status}</Badge>;
        }
    },
    {
        id: "billing_status",
        header: "Billing",
        cell: ({ row }) => {
            const status = row.original.billing_record?.status || 'Pending';
            return <span className="text-xs">{status}</span>;
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1">
                    <MasterlistEditModal record={row.original} />
                    {row.original.enrollment?.scholar?.id && (
                        <Link href={route("admin.tdp.scholar.show", row.original.enrollment.scholar.id)}>
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