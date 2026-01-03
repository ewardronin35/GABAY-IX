import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "@/hooks/useSearch";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';
import { HEI } from "@/types";
import { useMemo } from "react";

// Types for Location Data
type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

type FilterBarProps = {
    filters: any;
    searchKey: "search_ml" | "search_db";
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: Pick<HEI, "id" | "hei_name">[];
    courses?: { id: number; course_name: string }[];
    // ✅ Added Location Props
    regions?: LocationItem[];
    provinces?: LocationItem[];
    districts?: LocationItem[];
    cities?: LocationItem[];
};

export function FilterBar({
    filters,
    searchKey,
    academicYears,
    semesters,
    batches,
    heiList,
    courses = [],
    regions = [],
    provinces = [],
    districts = [],
    cities = [],
}: FilterBarProps) {
    
    const { search, handleSearch } = useSearch(
        "admin.cmsp.index",
        filters[searchKey] || "",
        searchKey
    );

    const handleFilterChange = (key: string, value: string) => {
        const updatedValue = value === "all" ? undefined : value;
        const newFilters = { ...filters, [searchKey]: search, [key]: updatedValue };

        // ✅ Reset child filters when parent changes
        if (key === 'region_id') { 
            newFilters.province_id = undefined; 
            newFilters.city_id = undefined; 
            newFilters.district_id = undefined; 
        }
        if (key === 'province_id') { 
            newFilters.city_id = undefined; 
            newFilters.district_id = undefined; 
        }

        router.get(route("admin.cmsp.index"), newFilters as any, {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    const getVal = (key: string) => filters[key] || "all";

    // ✅ Dependent Filter Logic
    const filteredProvinces = useMemo(() => {
        if (!filters.region_id) return provinces;
        return provinces.filter(p => String(p.region_id) === String(filters.region_id));
    }, [filters.region_id, provinces]);

    const filteredCities = useMemo(() => {
        if (!filters.province_id) return cities;
        return cities.filter(c => String(c.province_id) === String(filters.province_id));
    }, [filters.province_id, cities]);

    const filteredDistricts = useMemo(() => {
        if (!filters.province_id) return districts;
        return districts.filter(d => String(d.province_id) === String(filters.province_id));
    }, [filters.province_id, districts]);

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Academic & Institution Filters */}
            <div className="flex flex-wrap gap-2">
                <Input
                    placeholder="Search Name/Award No..."
                    value={search}
                    onChange={(e) => handleSearch(e.currentTarget.value)}
                    className="w-full sm:max-w-xs"
                />
                <Select value={getVal("academic_year")} onValueChange={(v) => handleFilterChange("academic_year", v)}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="All A.Y." /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                        <SelectItem value="all">All A.Y.</SelectItem>
                        {(academicYears || []).filter(Boolean).map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("semester")} onValueChange={(v) => handleFilterChange("semester", v)}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Semester" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("batch_no")} onValueChange={(v) => handleFilterChange("batch_no", v)}>
                    <SelectTrigger className="w-[110px]"><SelectValue placeholder="Batch" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches.map((b) => <SelectItem key={b} value={String(b)}>{b}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("hei_id")} onValueChange={(v) => handleFilterChange("hei_id", v)}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Schools" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                        <SelectItem value="all">All Schools</SelectItem>
                        {heiList.map((h) => <SelectItem key={h.id} value={String(h.id)}>{h.hei_name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("course_id")} onValueChange={(v) => handleFilterChange("course_id", v)}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Programs" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                        <SelectItem value="all">All Programs</SelectItem>
                        {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.course_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Row 2: Location Filters (Only show if location props exist) */}
            {regions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                    <span className="text-xs font-medium text-muted-foreground self-center mr-1">Location:</span>
                    
                    <Select value={getVal("region_id")} onValueChange={(v) => handleFilterChange("region_id", v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={getVal("province_id")} onValueChange={(v) => handleFilterChange("province_id", v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Province" /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">All Provinces</SelectItem>
                            {filteredProvinces.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={getVal("city_id")} onValueChange={(v) => handleFilterChange("city_id", v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="City/Mun" /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">All Cities</SelectItem>
                            {filteredCities.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={getVal("district_id")} onValueChange={(v) => handleFilterChange("district_id", v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="District" /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">All Districts</SelectItem>
                            {filteredDistricts.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}