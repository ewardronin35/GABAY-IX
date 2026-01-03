import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "@/hooks/useSearch";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';
import { HEI } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

type FilterBarProps = {
    filters: any;
    searchKey: "search_ml" | "search_db";
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: Pick<HEI, "id" | "hei_name">[];
    courses?: { id: number; course_name: string }[];
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
    cities = []
}: FilterBarProps) {
    
    const { search, handleSearch } = useSearch(
        "admin.tes.index",
        filters[searchKey] || "",
        searchKey
    );

    const handleFilterChange = (key: string, value: string) => {
        const updatedValue = value === "all" ? undefined : value;
        
        let nextFilters = { ...filters, [searchKey]: search, tab: 'masterlist', [key]: updatedValue };
        
        // Reset children when parent changes to prevent invalid states
        if (key === 'region_id') {
            nextFilters.province_id = undefined;
            nextFilters.district_id = undefined;
            nextFilters.city_id = undefined;
        }
        if (key === 'province_id') {
            nextFilters.district_id = undefined;
            nextFilters.city_id = undefined;
        }

        router.get(route("admin.tes.index"), nextFilters, {
            preserveState: true, replace: true, preserveScroll: true,
        });
    };

    const getVal = (key: string) => filters[key] || "all";

    // --- ENHANCED CASCADING LOGIC ---
    const selectedRegionId = filters.region_id ? Number(filters.region_id) : null;
    const selectedProvinceId = filters.province_id ? Number(filters.province_id) : null;

    // 1. Filter Provinces: Show all if no Region selected, otherwise filter by Region
    const filteredProvinces = selectedRegionId 
        ? provinces.filter(p => p.region_id === selectedRegionId)
        : provinces;

    // 2. Filter Cities: 
    //    - If Province selected -> Show cities in Province
    //    - Else if Region selected -> Show cities in all Provinces of that Region
    //    - Else -> Show all
    const filteredCities = (() => {
        if (selectedProvinceId) return cities.filter(c => c.province_id === selectedProvinceId);
        if (selectedRegionId) {
            const validProvIds = provinces.filter(p => p.region_id === selectedRegionId).map(p => p.id);
            return cities.filter(c => validProvIds.includes(c.province_id || 0));
        }
        return cities;
    })();

    // 3. Filter Districts: Same logic as Cities
    const filteredDistricts = (() => {
        if (selectedProvinceId) return districts.filter(d => d.province_id === selectedProvinceId);
        if (selectedRegionId) {
            const validProvIds = provinces.filter(p => p.region_id === selectedRegionId).map(p => p.id);
            return districts.filter(d => validProvIds.includes(d.province_id || 0));
        }
        return districts;
    })();

    return (
        <div className="flex flex-col gap-3">
            {/* Top Row: Core Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <Input
                    placeholder="Search masterlist..."
                    value={search}
                    onChange={(e) => handleSearch(e.currentTarget.value)}
                    className="w-full sm:max-w-xs bg-background"
                />
                
                <Select value={getVal("academic_year")} onValueChange={(v) => handleFilterChange("academic_year", v)}>
                    <SelectTrigger className="w-[130px] bg-background"><SelectValue placeholder="A.Y." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All A.Y.</SelectItem>
                        {academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("batch_no")} onValueChange={(v) => handleFilterChange("batch_no", v)}>
                    <SelectTrigger className="w-[120px] bg-background"><SelectValue placeholder="Batch" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches.map((b) => <SelectItem key={b} value={String(b)}>Batch {b}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={getVal("hei_id")} onValueChange={(v) => handleFilterChange("hei_id", v)}>
                    <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder="Select HEI" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All HEIs</SelectItem>
                        {heiList.map((h) => <SelectItem key={h.id} value={String(h.id)}>{h.hei_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Bottom Row: Location Filters */}
            <div className="flex flex-wrap gap-2 items-center border-t border-dashed pt-3 border-border">
                <span className="text-xs font-medium text-muted-foreground mr-2">Location:</span>
                
                {/* Region */}
                <Select value={getVal("region_id")} onValueChange={(v) => handleFilterChange("region_id", v)}>
                    <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Province */}
                <Select value={getVal("province_id")} onValueChange={(v) => handleFilterChange("province_id", v)}>
                    <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Province" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {filteredProvinces.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* District */}
                <Select value={getVal("district_id")} onValueChange={(v) => handleFilterChange("district_id", v)}>
                    <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="District" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {filteredDistricts.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* City */}
                <Select value={getVal("city_id")} onValueChange={(v) => handleFilterChange("city_id", v)}>
                    <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="City/Municipality" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {filteredCities.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.get(route("admin.tes.index"), { tab: 'masterlist' })}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                >
                    <X className="w-4 h-4 mr-1" /> Reset
                </Button>
            </div>
        </div>
    );
}