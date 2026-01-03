import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TdpPageProps } from "../Index";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpMasterlistGridColumns";
import { FilterBar } from "./FilterBar";
import { Badge } from "@/components/ui/badge";
import { Users, Database, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";

type TdpMasterlistGridProps = {
    enrollments: TdpPageProps["enrollments"];
    filters: TdpPageProps["filters"];
    academicYears: TdpPageProps["academicYears"];
    semesters: TdpPageProps["semesters"];
    batches: TdpPageProps["batches"];
    heiList: TdpPageProps["heiList"];
    courses?: TdpPageProps["courses"];
    regions?: TdpPageProps["regions"];
    provinces?: TdpPageProps["provinces"];
    districts?: TdpPageProps["districts"];
    cities?: TdpPageProps["cities"];
};

export function TdpMasterlistGrid({
    enrollments,
    filters,
    academicYears,
    semesters,
    batches,
    heiList,
    courses,
    regions,
    provinces,
    districts,
    cities
}: TdpMasterlistGridProps) {
    
    const [isExporting, setIsExporting] = useState(false);

    // @ts-ignore
    const links = enrollments.meta?.links || enrollments.links || [];
    // @ts-ignore
    const total = enrollments.meta?.total || enrollments.total || 0;
    // @ts-ignore
    const from = enrollments.meta?.from || enrollments.from || 0;
    // @ts-ignore
    const to = enrollments.meta?.to || enrollments.to || 0;

    // ✅ HANDLE EXPORT
    const handleExport = (format: 'pdf' | 'excel') => {
        setIsExporting(true);
        
        // Determine Route
        const routeName = format === 'pdf' ? 'admin.tdp.export-pdf' : 'admin.tdp.export-excel';
        
        // Map 'search_ml' (Masterlist Search) to 'search_db' (Controller expected key)
        const exportFilters = {
            ...filters,
            search_db: filters.search_ml 
        };

        // Trigger Download
        window.location.href = route(routeName, exportFilters);

        // Reset loading state after a delay
        setTimeout(() => setIsExporting(false), 3000);
    };

    return (
        <Card className="border-border shadow-sm h-full flex flex-col bg-card text-card-foreground">
            <CardHeader className="pb-4 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Title Section */}
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
                    
                    {/* Actions Section: Total Count + Export Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>Total: <span className="font-bold text-foreground">{total.toLocaleString()}</span></span>
                        </div>

                        {/* ✅ EXPORT BUTTONS */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleExport('excel')} 
                                disabled={isExporting}
                                className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/30"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                                Excel
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => handleExport('pdf')} 
                                disabled={isExporting}
                                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mt-5 bg-muted/30 p-1.5 rounded-xl border border-border">
                    <FilterBar 
                        filters={filters} 
                        searchKey="search_ml"
                        academicYears={academicYears} 
                        semesters={semesters}
                        batches={batches}
                        heiList={heiList}
                        courses={courses}
                        regions={regions}
                        provinces={provinces}
                        districts={districts}
                        cities={cities}
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