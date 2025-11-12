"use client";

import type { ScholarEnrollment } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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
            return <div className="font-medium">{name}</div>;
        },
    },
    {
        accessorKey: "scholar.email_address",
        header: "Email",
    },
    {
        accessorKey: "scholar.contact_no",
        header: "Contact No.",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            // --- ▼▼▼ THIS IS THE FIX ▼▼▼ ---
            <Link
                href={route(
                    "superadmin.tdp.scholar.show",
                    row.original.scholar.id,
                )}
            >
            {/* --- ▲▲▲ END OF FIX ▲▲▲ --- */}
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        ),
    },
];