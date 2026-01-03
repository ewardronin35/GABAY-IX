import React from 'react';
import { Link } from '@inertiajs/react';
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { 
    School, 
    MapPin, 
    Eye, 
    Users, 
    Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { route } from "ziggy-js";

export function MsrsHeiGrid({ paginatedHeis, filters }: any) {
    const { search, handleSearch } = useSearch("admin.msrs.index", filters?.search_hei || "", "search_hei");

    if (!paginatedHeis || !paginatedHeis.data) {
        return (
            <div className="p-8 text-center text-muted-foreground border rounded-md bg-muted/10">
                No HEI data available.
            </div>
        );
    }

    const safeRoute = (name: string, params?: any) => {
        try { return route(name, params); } catch (e) { return '#'; }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search Institution..." 
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left caption-bottom">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b border-border transition-colors hover:bg-muted/50 bg-muted/40">
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-[40%]">
                                    Institution Name
                                </th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-[20%]">
                                    Type / Category
                                </th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-[20%]">
                                    Location
                                </th>
                                <th className="h-12 px-6 text-center align-middle font-medium text-muted-foreground w-[10%]">
                                    Scholars
                                </th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground w-[10%]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {paginatedHeis.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center align-middle text-muted-foreground">
                                        No institutions found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedHeis.data.map((hei: any) => (
                                    <tr 
                                        key={hei.id} 
                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-6 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <School className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground line-clamp-1" title={hei.hei_name}>
                                                        {hei.hei_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {hei.hei_code || `ID: ${hei.id}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <Badge variant="secondary" className="font-normal text-xs">
                                                {hei.type_of_heis === 'SUC' ? 'State University' : (hei.type_of_heis || 'Private HEI')}
                                            </Badge>
                                        </td>
                                        <td className="p-6 align-middle text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>
                                                    {typeof hei.province === 'object' ? hei.province?.name : (hei.province || 'Region IX')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle text-center">
                                            <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                {hei.enrollments_count || 0}
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle text-right">
                                            {/* ✅ CORRECTED ROUTE: admin.msrs.hei.show */}
                                            <Link href={safeRoute('admin.msrs.hei.show', hei.id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Details</span>
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <PaginationLinks links={paginatedHeis.links} />
            </div>
        </div>
    );
}