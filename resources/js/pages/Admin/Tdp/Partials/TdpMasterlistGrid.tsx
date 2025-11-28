// resources/js/pages/Admin/Tdp/Partials/TdpMasterlistGrid.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TdpPageProps } from "../Index";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpMasterlistGridColumns";
import { FilterBar } from "./FilterBar";
import { Badge } from "@/components/ui/badge";
import { Users, Database } from "lucide-react";

type TdpMasterlistGridProps = {
    enrollments: TdpPageProps["enrollments"];
    filters: TdpPageProps["filters"];
    academicYears: TdpPageProps["academicYears"];
    semesters: TdpPageProps["semesters"];
    batches: TdpPageProps["batches"];
    heiList: TdpPageProps["heiList"];
};

export function TdpMasterlistGrid({
    enrollments,
    filters,
    academicYears,
    semesters,
    batches,
    heiList
}: TdpMasterlistGridProps) {
    
    // @ts-ignore
    const links = enrollments.meta?.links || enrollments.links || [];
    // @ts-ignore
    const total = enrollments.meta?.total || enrollments.total || 0;
    // @ts-ignore
    const from = enrollments.meta?.from || enrollments.from || 0;
    // @ts-ignore
    const to = enrollments.meta?.to || enrollments.to || 0;

    return (
        <Card className="border-border shadow-sm h-full flex flex-col bg-card text-card-foreground">
            <CardHeader className="pb-4 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-lg shadow-sm">
                                <Database className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">
                                    TDP Masterlist
                                </CardTitle>
                                <CardDescription className="mt-1 text-muted-foreground flex items-center gap-2">
                                    View-only database of all scholars.
                                    {total > 0 && (
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            Displaying {from}-{to} of {total}
                                        </Badge>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stat Pill */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Total Scholars: <span className="font-bold text-foreground">{total.toLocaleString()}</span></span>
                    </div>
                </div>

                {/* Filter Bar Container */}
                <div className="mt-5 bg-muted/30 p-1.5 rounded-xl border border-border">
                    <FilterBar 
                        filters={filters} 
                        searchKey="search_ml"
                        academicYears={academicYears} 
                        semesters={semesters}
                        batches={batches}
                        heiList={heiList}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col relative bg-card">
                <div className="flex-1 overflow-auto">
                    <DataTable
                        columns={columns}
                        data={enrollments.data}
                    />
                </div>
                
                {/* Pagination Footer */}
                <div className="p-3 border-t border-border bg-card">
                    <PaginationLinks links={links} />
                </div>
            </CardContent>
        </Card>
    );
}