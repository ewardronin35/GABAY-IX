import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TesMasterlistGridColumns"; 
import { FilterBar } from "./FilterBar"; 
import { List, Users, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";

// Types matching Index
type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

type TesMasterlistGridProps = {
    records: any;
    filters: any;
    academicYears: string[];
    semesters: any[];
    batches: string[];
    heiList: any[];
    regions?: LocationItem[];
    provinces?: LocationItem[];
    districts?: LocationItem[];
    cities?: LocationItem[];
};

export function TesMasterlistGrid({
    records,
    filters,
    academicYears,
    semesters,
    batches,
    heiList,
    regions = [],
    provinces = [],
    districts = [],
    cities = []
}: TesMasterlistGridProps) {
    
    const [isExporting, setIsExporting] = useState(false);

    if (!records) return null;

    const links = records.meta?.links || records.links || [];
    const total = records.meta?.total || records.total || 0;

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        let routeName = type === 'pdf' ? 'admin.tes.export-pdf' : 'admin.tes.export-excel';
        
        // Construct query string manually or use route() param handling
        // @ts-ignore
        window.location.href = route(routeName, filters);
        
        // Reset loader after delay (since we can't detect download finish easily)
        setTimeout(() => setIsExporting(false), 3000);
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <List className="w-5 h-5 text-primary" />
                            TES Masterlist
                        </CardTitle>
                        <CardDescription>
                            Validated list of scholars. Use checkboxes to select rows.
                        </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* STATS BADGE */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border mr-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>Total: <span className="font-bold text-foreground">{total.toLocaleString()}</span></span>
                        </div>

                        {/* EXPORT BUTTONS */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('excel')} 
                            disabled={isExporting}
                            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                            Export Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleExport('pdf')} 
                            disabled={isExporting}
                            className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div className="mt-5 bg-muted/30 p-2 rounded-xl border border-border">
                    <FilterBar 
                        filters={filters} 
                        searchKey="search_ml"
                        academicYears={academicYears} 
                        semesters={semesters}
                        batches={batches}
                        heiList={heiList}
                        regions={regions}
                        provinces={provinces}
                        districts={districts}
                        cities={cities}
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col relative bg-card rounded-md border border-gray-200 dark:border-gray-800">
                <div className="flex-1 overflow-auto">
                    <DataTable
                        columns={columns}
                        data={records.data}
                    />
                </div>
                
                <div className="p-3 border-t border-border bg-card">
                    <PaginationLinks links={links} />
                </div>
            </CardContent>
        </Card>
    );
}