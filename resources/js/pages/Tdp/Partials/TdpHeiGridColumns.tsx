"use client";

import type { ScholarEnrollment } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper function to handle Server-Side Sorting
const toggleSort = (field: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentSort = params.get('sort');
    const currentDirection = params.get('direction');

    let newDirection = 'asc';
    if (currentSort === field && currentDirection === 'asc') {
        newDirection = 'desc';
    }

    params.set('sort', field);
    params.set('direction', newDirection);
    
    // Visit the new URL to trigger server sort
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true });
};

// Component for the Sortable Header
const SortableHeader = ({ title, field }: { title: string, field: string }) => {
    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => toggleSort(field)}
        >
            <span>{title}</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

export const columns: ColumnDef<ScholarEnrollment>[] = [
    {
        id: "name",
        header: () => <SortableHeader title="Name" field="name" />, // CLICKABLE HEADER
        accessorFn: (row) =>
            [
                row.scholar.family_name,
                row.scholar.given_name,
                row.scholar.middle_name,
            ]
                .filter(Boolean)
                .join(", "),
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return (
                <Link 
                    href={route("admin.tdp.scholar.show", row.original.scholar.id)} 
                    className="font-medium text-blue-600 hover:underline uppercase"
                >
                    {name}
                </Link>
            );
        },
    },
    {
        accessorKey: "scholar.email_address",
        header: "Email",
        cell: ({ row }) => <span className="text-xs text-gray-600">{row.original.scholar.email_address || "N/A"}</span>
    },
    {
        accessorKey: "award_number",
        header: () => <SortableHeader title="Award No" field="award_number" />, // CLICKABLE HEADER
        cell: ({ row }) => <Badge variant="outline">{row.original.award_number || "N/A"}</Badge>
    },
    {
        id: "course",
        header: "Course", // Course sorting is complex on server, keeping simple for now
        cell: ({ row }) => {
            const records = (row.original as any).academic_records || [];
            const latest = records.length > 0 ? records[0] : null;
            return (
                <span className="max-w-[200px] truncate block text-xs" title={latest?.course?.course_name || "N/A"}>
                    {latest?.course?.course_name || "N/A"}
                </span>
            );
        }
    },
    {
        id: "year_level",
        header: () => <SortableHeader title="Year" field="year_level" />, // CLICKABLE HEADER
        cell: ({ row }) => {
            const records = (row.original as any).academic_records || [];
            const latest = records.length > 0 ? records[0] : null;
            return <div className="text-center font-medium">{latest?.year_level || "-"}</div>;
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Link
                href={route(
                    "admin.tdp.scholar.show",
                    row.original.scholar.id,
                )}
            >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4 text-gray-500" />
                </Button>
            </Link>
        ),
    },
];