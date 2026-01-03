import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, ScholarEnrollment, HEI, Course } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./TdpHeiGridColumns"; 
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HeiFileUpload } from '../../Tes/Partials/HeiFileUpload'; 
import { useMemo, useState, useEffect } from 'react';

type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

type TdpShowHeiProps = PageProps & {
    hei: HEI;
    enrollments: any; // Using 'any' to safely handle pagination structure
    documents: any[];
    filters?: { 
        search?: string;
        academic_year?: string;
        batch_no?: string;
        course_id?: string;
        region_id?: string;
        province_id?: string;
        city_id?: string;
        district_id?: string;
    };
    academicYears?: string[];
    batches?: string[];
    courses?: Pick<Course, "id" | "course_name">[];
    regions?: LocationItem[];
    provinces?: LocationItem[];
    districts?: LocationItem[];
    cities?: LocationItem[];
};

export default function TdpShowHei({ 
    auth, 
    hei, 
    enrollments, 
    filters = {}, 
    documents = [],
    academicYears = [], 
    batches = [], 
    courses = [],
    regions = [],
    provinces = [],
    districts = [],
    cities = []
}: TdpShowHeiProps) {
    if (!auth.user) return null;

    // --- 1. SEARCH & FILTER HANDLING ---
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    const { handleSearch } = useSearch(
        route('admin.tdp.hei.show', hei.id),
        filters.search || "",
        "search"
    );

    // Debounce Effect for Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || "")) {
                handleSearch(searchTerm);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Handle Dropdown Changes
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        
        // Reset dependent filters
        if (key === 'region_id') { 
            newFilters.province_id = ''; 
            newFilters.city_id = ''; 
            newFilters.district_id = ''; 
        }
        if (key === 'province_id') { 
            newFilters.city_id = ''; 
            newFilters.district_id = ''; 
        }

        router.get(
            route('admin.tdp.hei.show', hei.id),
            { ...newFilters, search: searchTerm },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get(route('admin.tdp.hei.show', hei.id));
    };

    // --- 2. LOCATION DEPENDENCY LOGIC ---
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

    // --- 3. SAFE PAGINATION DATA ---
    const totalGrantees = enrollments?.meta?.total ?? enrollments?.total ?? 0;
    const paginationLinks = enrollments?.meta?.links ?? enrollments?.links ?? [];

    return (
        <AuthenticatedLayout user={auth.user} page_title={`${hei.hei_name} - TDP Grantees`}>
            <Head title={hei.hei_name} />
            
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* HEADER & BACK BUTTON */}
                <div className="flex items-center justify-between">
                    <Link href={route('admin.tdp.index', { tab: 'hei' })}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to HEI List
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold">{hei.hei_name}</CardTitle>
                                <CardDescription>
                                    All TDP grantees enrolled at this institution.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit">
                                <Users className="h-4 w-4" />
                                <span>{totalGrantees.toLocaleString()} Grantees Found</span>
                            </Badge>
                        </div>
                        
                        {/* FILTERS SECTION */}
                        <div className="mt-6 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {/* SEARCH */}
                                <Input
                                    placeholder="Search grantee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-[200px]"
                                />

                                {/* ACADEMIC YEAR */}
                                <Select value={filters.academic_year || "all"} onValueChange={(v) => handleFilterChange("academic_year", v)}>
                                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All A.Y." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All A.Y.</SelectItem>
                                        {academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {/* BATCH */}
                                <Select value={filters.batch_no || "all"} onValueChange={(v) => handleFilterChange("batch_no", v)}>
                                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Batch" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {batches.map(b => <SelectItem key={b} value={String(b)}>Batch {b}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {/* COURSE */}
                                <Select value={filters.course_id || "all"} onValueChange={(v) => handleFilterChange("course_id", v)}>
                                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Course" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses</SelectItem>
                                        {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.course_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {/* CLEAR FILTERS */}
                                <Button variant="ghost" size="icon" onClick={clearFilters} title="Reset Filters">
                                    <X className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            {/* LOCATION FILTERS (DEPENDENT) */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t items-center">
                                <span className="text-xs font-medium text-muted-foreground self-center mr-2 flex gap-1">
                                    <Filter className="w-3 h-3"/> Location:
                                </span>
                                
                                <Select value={filters.region_id || "all"} onValueChange={(v) => handleFilterChange("region_id", v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Regions</SelectItem>
                                        {regions.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.province_id || "all"} onValueChange={(v) => handleFilterChange("province_id", v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Province" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Provinces</SelectItem>
                                        {filteredProvinces.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.city_id || "all"} onValueChange={(v) => handleFilterChange("city_id", v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="City/Mun" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cities</SelectItem>
                                        {filteredCities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={filters.district_id || "all"} onValueChange={(v) => handleFilterChange("district_id", v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="District" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {filteredDistricts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={enrollments.data} />
                        
                        {/* PAGINATION */}
                        {paginationLinks.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                                <PaginationLinks links={paginationLinks} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* FILE UPLOAD SECTION */}
                <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">School Documents & Validation Files</h3>
                    <HeiFileUpload heiId={hei.id} documents={documents} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}