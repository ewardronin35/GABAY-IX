import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, School, MapPin, Eye, Search, Filter
} from "lucide-react";
import { route } from "ziggy-js";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PaginationLinks } from "@/components/ui/PaginationLinks";

interface Props {
    auth: any;
    hei: any;
    enrollments: {
        data: any[];
        links: any[];
        total: number;
        from: number;
        to: number;
        current_page: number;
        last_page: number;
    };
    filters?: any;
    academicYears: any[];
}

const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('enrolled') || s.includes('validated')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('graduated')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('terminated') || s.includes('dropped') || s.includes('waived')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
};

export default function ShowHei({ auth, hei, enrollments, filters, academicYears = [] }: Props) {
    // Default to 'all' if empty so the select works properly
    const [params, setParams] = useState({
        search: filters?.search || '',
        academic_year: filters?.academic_year || 'all',
    });

    const safeRoute = (name: string, routeParams?: any) => {
        try { return route(name, routeParams); } catch (e) { return '#'; }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.msrs.hei.show', hei.id), params, { preserveState: true, preserveScroll: true });
    };

    const updateFilter = (key: string, value: string) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        router.get(route('admin.msrs.hei.show', hei.id), newParams, { preserveState: true, preserveScroll: true });
    };

    const records = enrollments?.data || [];
    const safeAcademicYears = Array.isArray(academicYears) ? academicYears : [];

    return (
        <AuthenticatedLayout user={auth?.user} page_title={hei?.hei_name}>
            <Head title={`MSRS - ${hei?.hei_name}`} />

            <div className="flex flex-col space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href={safeRoute('admin.msrs.index')}>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{hei?.hei_name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5"><School className="h-3.5 w-3.5"/> {hei?.type_of_heis || 'HEI'}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/> {hei?.province?.name || 'Region IX'}</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between bg-card border border-border p-4 rounded-lg shadow-sm">
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input 
                                type="text" placeholder="Search scholar..." 
                                className="h-9 w-full rounded-md border border-input bg-background pl-9 text-sm"
                                value={params.search}
                                onChange={e => setParams({...params, search: e.target.value})}
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary">Search</Button>
                    </form>
                    
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select 
                            value={params.academic_year} 
                            onValueChange={(val) => updateFilter('academic_year', val)}
                        >
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Select Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Academic Years</SelectItem>
                                {safeAcademicYears.map((ay) => (
                                    <SelectItem key={ay.id} value={ay.name}>
                                        {ay.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left caption-bottom">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b border-border transition-colors hover:bg-muted/50 bg-muted/20">
                                    <th className="h-12 px-6">Award No.</th>
                                    <th className="h-12 px-6">Scholar Name</th>
                                    <th className="h-12 px-6">Course</th>
                                    <th className="h-12 px-6 text-center">Level</th>
                                    <th className="h-12 px-6 text-center">Status</th>
                                    <th className="h-12 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {records.length === 0 ? (
                                    <tr><td colSpan={6} className="h-32 text-center text-muted-foreground">No scholars found.</td></tr>
                                ) : (
                                    records.map((record: any, index: number) => {
                                        const enrollment = record.enrollment || {};
                                        const scholar = enrollment.scholar || {};
                                        const rowKey = record.id ? `record-${record.id}` : `row-${index}`;

                                        return (
                                            <tr key={rowKey} className="border-b border-border transition-colors hover:bg-muted/50">
                                                <td className="p-6 align-middle font-mono text-xs text-muted-foreground">{enrollment.award_number || 'N/A'}</td>
                                                <td className="p-6 align-middle font-medium">{scholar.family_name}, {scholar.given_name}</td>
                                                <td className="p-6 align-middle text-muted-foreground text-xs">{record.course?.name || 'Medicine'}</td>
                                                <td className="p-6 align-middle text-center">{record.year_level || '-'}</td>
                                                <td className="p-6 align-middle text-center">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(enrollment.status)}`}>
                                                        {enrollment.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-6 align-middle text-right">
                                                    {scholar.id ? (
                                                        <Link href={safeRoute('admin.msrs.scholars.show', scholar.id)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    ) : <span className="text-xs text-muted-foreground">No ID</span>}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {enrollments?.total > 0 && (
                        <div className="p-4 border-t border-border">
                            <PaginationLinks links={enrollments.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}