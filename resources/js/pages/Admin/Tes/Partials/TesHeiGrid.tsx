// resources/js/pages/Admin/Tdp/Partials/TdpHeiGrid.tsx
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@inertiajs/react";
import type { TdpPageProps } from "../Index";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; // Use correct pagination
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { route } from "ziggy-js";

type TdpHeiGridProps = {
    paginatedHeis: TdpPageProps["paginatedHeis"];
    filters: TdpPageProps["filters"];
};

export function TesHeiGrid({ paginatedHeis, filters }: TdpHeiGridProps) {
    
    // --- FIX: Use 'search_hei' to match the controller ---
    const { search, handleSearch } = useSearch(
        "superadmin.tdp.index",
        filters.search_hei || "", // Use 'search_hei'
        "search_hei"              // Use 'search_hei'
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>TDP Schools (HEIs)</CardTitle>
                <CardDescription>
                    List of schools with active TDP scholars.
                </CardDescription>
                <div className="mt-4">
                    <Input
                        placeholder="Search by HEI name..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full sm:max-w-xs"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>HEI Name</TableHead>
                                <TableHead>Scholar Count</TableHead>
                                <TableHead>Actions</TableHead>
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
                                            {/* --- FIX: Use enrollments_count (from controller's withCount) --- */}
                                            <Badge>{hei.enrollments_count} Scholars</Badge>
                                        </TableCell>
                                        <TableCell>
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
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-24 text-center"
                                    >
                                        No HEIs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* --- FIX: Use PaginationLinks and safely access .meta.links --- */}
                <PaginationLinks links={paginatedHeis?.meta?.links || []} />

            </CardContent>
        </Card>
    );
}