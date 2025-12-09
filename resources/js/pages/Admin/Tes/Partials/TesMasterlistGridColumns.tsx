// resources/js/pages/Admin/Tes/Partials/TesMasterlistGridColumns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Ensure you have this modal or remove it if not needed for TES yet
// import { MasterlistEditModal } from "./MasterlistEditModal"; 

type TesRowData = {
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
};

export const columns: ColumnDef<TesRowData>[] = [
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
                // 🔴 FIX: Changed route to 'superadmin.tes.scholar.show'
                <Link 
                    href={route("superadmin.tes.scholar.show", scholarId)} 
                    className="font-medium text-primary hover:underline decoration-primary/50 underline-offset-4 transition-colors"
                >
                    {name}
                </Link>
            );
        },
    },
    {
        accessorKey: "course.course_name",
        header: "Course",
        cell: ({ row }) => {
            const courseName = row.original.course?.course_name;
            return <span className="truncate max-w-[200px] block text-foreground font-medium" title={courseName}>{courseName || '-'}</span>;
        }
    },
    {
        accessorKey: "enrollment.award_number",
        header: "Award No",
        cell: ({ row }) => {
            const awardNo = row.original.enrollment?.award_number;
            return (
                <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                    {awardNo || 'N/A'}
                </span>
            );
        }
    },
    {
        accessorKey: "hei.hei_name",
        header: "HEI",
        cell: ({ row }) => {
            const heiName = row.original.hei?.hei_name;
            return <span className="truncate max-w-[200px] block text-muted-foreground text-xs" title={heiName}>{heiName || '-'}</span>;
        }
    },
    {
        id: "program", 
        header: "Program",
        accessorFn: (row) => row.enrollment?.program?.program_name || 'TES',
        cell: ({ row }) => {
            const program = row.getValue("program") as string;
            return (
                <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 border-0">
                    {program}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-1">
                    {/* Restore MasterlistEditModal if you have a TES version */}
                    {/* <MasterlistEditModal record={row.original} /> */}
                    
                    {/* View Icon */}
                    {row.original.enrollment?.scholar?.id && (
                        // 🔴 FIX: Changed route to 'superadmin.tes.scholar.show'
                        <Link href={route("superadmin.tes.scholar.show", row.original.enrollment.scholar.id)}>
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