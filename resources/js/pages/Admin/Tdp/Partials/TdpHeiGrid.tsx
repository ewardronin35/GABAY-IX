// resources/js/pages/Admin/Tdp/Partials/TdpHeiGrid.tsx

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
import { Badge } from "@/components/ui/badge";
import { Link } from "@inertiajs/react";
import type { TdpPageProps } from "../Index";
import { Pagination } from "@/components/ui/pagination"; 
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
// --- ▼▼▼ FIX: Import Button and Eye icon ▼▼▼ ---
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { route } from "ziggy-js";
// --- ▲▲▲ END OF FIX ▲▲▲ ---

type TdpHeiGridProps = {
    paginatedHeis: TdpPageProps["paginatedHeis"];
    filters: TdpPageProps["filters"];
};

export function TdpHeiGrid({ paginatedHeis, filters }: TdpHeiGridProps) {
    const { search, handleSearch } = useSearch("superadmin.tdp.index", filters.search_db, "search_db");

    return (
        <Card>
            <CardHeader>
                <CardTitle>TDP Database by HEI</CardTitle>
                <CardDescription>
                    A paginated list of all HEIs with TDP scholars.
                </CardDescription>
                <Input
                    type="search"
                    placeholder="Search HEIs..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>HEI Name</TableHead>
                                <TableHead>Total Scholars</TableHead>
                                {/* --- ▼▼▼ FIX: Added Actions column ▼▼▼ --- */}
                                <TableHead className="text-right">Actions</TableHead>
                                {/* --- ▲▲▲ END OF FIX ▲▲▲ --- */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedHeis.data.length > 0 ? (
                                paginatedHeis.data.map((hei) => (
                                    <TableRow key={hei.id}>
                                        <TableCell className="font-medium">
                                            {hei.hei_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {hei.scholar_count}
                                            </Badge>
                                        </TableCell>
                                        {/* --- ▼▼▼ FIX: Added Action button cell ▼▼▼ --- */}
                                        <TableCell className="text-right">
                                            <Link
                                                href={route(
                                                    "superadmin.tdp.hei.show",
                                                    hei.id
                                                )}
                                            >
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                        {/* --- ▲▲▲ END OF FIX ▲▲▲ --- */}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3} // <-- Changed from 2 to 3
                                        className="h-24 text-center"
                                    >
                                        No HEIs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination paginator={paginatedHeis} className="mt-4" />
            </CardContent>
        </Card>
    );
}