"use client";

import type { ScholarEnrollment } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<ScholarEnrollment>[] = [
    {
        id: "name",
        header: "Name",
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
                    href={route("superadmin.tdp.scholar.show", row.original.scholar.id)} 
                    className="font-medium text-blue-600 hover:underline"
                >
                    {name}
                </Link>
            );
        },
    },
    {
        accessorKey: "scholar.email_address",
        header: "Email",
        // --- FIX: Add N/A ---
        cell: ({ row }) => row.original.scholar.email_address || "N/A"
    },
    {
        accessorKey: "scholar.contact_no",
        header: "Contact No.",
        // --- FIX: Add N/A ---
        cell: ({ row }) => row.original.scholar.contact_no || "N/A"
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Link
                href={route(
                    "superadmin.tdp.scholar.show",
                    row.original.scholar.id,
                )}
            >
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        ),
    },
];