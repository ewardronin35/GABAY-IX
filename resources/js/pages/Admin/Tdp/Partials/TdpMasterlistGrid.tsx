// resources/js/pages/Admin/Tdp/Partials/TdpMasterlistGrid.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TdpPageProps } from "../Index";
import { Pagination } from "@/components/ui/pagination";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpMasterlistGridColumns"; // We will create this file
import { FilterBar } from "./FilterBar"; // Import the new filter bar

type TdpMasterlistGridProps = {
    enrollments: TdpPageProps["enrollments"];
    filters: TdpPageProps["filters"];
    academicYears: TdpPageProps["academicYears"];
    semesters: TdpPageProps["semesters"];
};

export function TdpMasterlistGrid({ enrollments, filters, academicYears, semesters }: TdpMasterlistGridProps) {
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>TDP Masterlist (View Only)</CardTitle>
                <CardDescription>
                    A read-only list of all TDP scholars.
                </CardDescription>
                <FilterBar 
                    filters={filters} 
                    academicYears={academicYears} 
                    semesters={semesters} 
                />
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={enrollments.data}
                />
                <Pagination paginator={enrollments} className="mt-4" />
            </CardContent>
        </Card>
    );
}