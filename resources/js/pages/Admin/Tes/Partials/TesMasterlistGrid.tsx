// resources/js/pages/Admin/Tes/Partials/TesMasterlistGrid.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TesPageProps } from "../Index"; // Check if this type exists in your Index.tsx
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { DataTable } from "@/components/ui/data-table";

// 🔴 FIX: Change this import from "Tdp" to "Tes"
import { columns } from "./TesMasterlistGridColumns"; 

import { FilterBar } from "./FilterBar"; // Ensure FilterBar is available or copied
import { Badge } from "@/components/ui/badge";
import { Users, Database } from "lucide-react";

type TesMasterlistGridProps = {
    enrollments: any; // Use proper type if available
    filters: any;
    academicYears: string[];
    semesters: any[];
    batches: string[];
    heiList: any[];
};

export function TesMasterlistGrid({
    enrollments,
    filters,
    academicYears,
    semesters,
    batches,
    heiList
}: TesMasterlistGridProps) {
    
    const links = enrollments.meta?.links || enrollments.links || [];
    const total = enrollments.meta?.total || enrollments.total || 0;
    const from = enrollments.meta?.from || enrollments.from || 0;
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
                                    TES Masterlist
                                </CardTitle>
                                <CardDescription className="mt-1 text-muted-foreground flex items-center gap-2">
                                    View-only database of all TES scholars.
                                    {total > 0 && (
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            Displaying {from}-{to} of {total}
                                        </Badge>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Total Scholars: <span className="font-bold text-foreground">{total.toLocaleString()}</span></span>
                    </div>
                </div>

                <div className="mt-5 bg-muted/30 p-1.5 rounded-xl border border-border">
                    {/* Ensure FilterBar is compatible or create a TesFilterBar */}
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
                
                <div className="p-3 border-t border-border bg-card">
                    <PaginationLinks links={links} />
                </div>
            </CardContent>
        </Card>
    );
}