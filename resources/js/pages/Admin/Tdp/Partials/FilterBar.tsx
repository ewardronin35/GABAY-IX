import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "@/hooks/useSearch";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';
import { HEI } from "@/types";

type FilterBarProps = {
    filters: any;
    searchKey: "search_ml" | "search_db";
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: Pick<HEI, "id" | "hei_name">[];
    courses?: { id: number; course_name: string }[];
};

export function FilterBar({
    filters,
    searchKey,
    academicYears,
    semesters,
    batches,
    heiList,
    courses = [],
}: FilterBarProps) {
    // Using the hook with a debounce is key for performance
    // Ensure useSearch implements debounce (e.g., 300ms or 500ms)
    const { search, handleSearch } = useSearch(
        "superadmin.tdp.index",
        filters[searchKey] || "",
        searchKey
    );

    const handleFilterChange = (key: string, value: string) => {
        const updatedValue = value === "all" ? undefined : value;
        const newFilters = { ...filters, [searchKey]: search, [key]: updatedValue };
        router.get(route("superadmin.tdp.index"), newFilters as any, {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    const getVal = (key: string) => filters[key] || "all";

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
            <Input
                placeholder="Search DB..."
                value={search}
                onChange={(e) => handleSearch(e.currentTarget.value)}
                className="w-full sm:max-w-xs"
            />
            <Select value={getVal("academic_year")} onValueChange={(v) => handleFilterChange("academic_year", v)}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="All A.Y." /></SelectTrigger>
                <SelectContent className="z-[9999]">
                    <SelectItem value="all">All A.Y.</SelectItem>
                    {(academicYears || []).filter(Boolean).map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* 2. Semester */}
            <Select value={getVal("semester")} onValueChange={(v) => handleFilterChange("semester", v)}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Sems" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

             {/* 3. Batch */}
             <Select value={getVal("batch_no")} onValueChange={(v) => handleFilterChange("batch_no", v)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map((b) => (
                        <SelectItem key={b} value={String(b)}>{b}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 4. HEI (School) */}
            <Select value={getVal("hei_id")} onValueChange={(v) => handleFilterChange("hei_id", v)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Schools</SelectItem>
                    {heiList.map((h) => (
                        <SelectItem key={h.id} value={String(h.id)}>{h.hei_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 5. Degree Program (Course) */}
            <Select value={getVal("course_id")} onValueChange={(v) => handleFilterChange("course_id", v)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Programs</SelectItem>
                    {courses.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.course_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}