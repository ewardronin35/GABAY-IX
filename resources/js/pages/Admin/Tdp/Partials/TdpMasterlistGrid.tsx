// resources/js/pages/Admin/Tdp/Partials/TdpMasterlistGrid.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TdpPageProps } from "../Index";
import { Pagination } from "@/components/ui/pagination"; // This is the component
import { PaginationLinks } from "@/components/ui/PaginationLinks"; // This is our helper
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpMasterlistGridColumns";
import { FilterBar } from "./FilterBar";
import { HEI } from "@/types";

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
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>TDP Masterlist (View Only)</CardTitle>
                <CardDescription>
                    A read-only list of all TDP scholars.
                </CardDescription>
                <div className="mt-4">
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
            <CardContent>
                <DataTable
                    columns={columns}
                    data={enrollments.data}
                />
                {/* FIX: Use PaginationLinks and pass the correct meta.links */}
                <PaginationLinks links={enrollments.meta.links} />
            </CardContent>
        </Card>
    );
}