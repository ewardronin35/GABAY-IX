// resources/js/pages/Admin/Tdp/Partials/FilterBar.tsx

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSearch } from "@/hooks/useSearch";
import { router } from "@inertiajs/react";

type FilterBarProps = {
    filters: {
        search_ml?: string;
        academic_year?: string;
        semester?: string;
    };
    academicYears: string[];
    semesters: string[];
};

export function FilterBar({ filters, academicYears, semesters }: FilterBarProps) {
    const { search, handleSearch } = useSearch(
        "superadmin.tdp.index",
        filters.search_ml || "",
        "search_ml"
    );

    // Handle combined filter changes
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = {
            search_ml: search,
            academic_year: filters.academic_year,
            semester: filters.semester,
            [key]: value || undefined,
        };
        
        router.get(route("superadmin.tdp.index"), newFilters as any, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
                type="search"
                placeholder="Search by scholar name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
            />
            <Select
                value={filters.academic_year || ""}
                onValueChange={(value) => handleFilterChange("academic_year", value)}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                    {/* --- ▼▼▼ FIX: Removed the line below ▼▼▼ --- */}
                    {/* <SelectItem value="">All Academic Years</SelectItem> */}
                    
                    {(academicYears || []).map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={filters.semester || ""}
                onValueChange={(value) => handleFilterChange("semester", value)}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                    {/* --- ▼▼▼ FIX: Removed the line below ▼▼▼ --- */}
                    {/* <SelectItem value="">All Semesters</SelectItem> */}

                    {(semesters || []).map((sem) => (
                        <SelectItem key={sem} value={sem}>
                            {sem}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}