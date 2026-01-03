import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, router } from "@inertiajs/react";
import type { TdpPageProps } from "../Index";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Eye, Filter, ArrowUpDown, X } from "lucide-react";
import { route } from "ziggy-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

type TdpHeiGridProps = {
    paginatedHeis: any;
    filters: TdpPageProps["filters"];
    batches: string[];
};

export function TdpHeiGrid({ paginatedHeis, filters, batches = [] }: TdpHeiGridProps) {
    
    const { handleSearch } = useSearch(
        "admin.tdp.index",
        filters.search_hei || "", 
        "search_hei"              
    );

    // --- 1. DEBOUNCED SEARCH STATE ---
    const [searchTerm, setSearchTerm] = useState(filters.search_hei || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search_hei || "")) {
                handleSearch(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // --- 2. SORTING LOGIC ---
    const toggleSort = (field: string) => {
        const params = new URLSearchParams(window.location.search);
        const currentSort = params.get('sort');
        const currentDirection = params.get('direction');

        let newDirection = 'asc';
        if (currentSort === field && currentDirection === 'asc') {
            newDirection = 'desc';
        }

        params.set('sort', field);
        params.set('direction', newDirection);
        params.delete('page');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); 
        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true });
    };

    // --- 3. PAGINATION SAFETY CHECK ---
    const paginationLinks = paginatedHeis?.meta?.links || paginatedHeis?.links || [];

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Participating HEIs</CardTitle>
                        <CardDescription>
                            List of schools with enrolled TDP scholars
                        </CardDescription>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Search HEI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Select 
                            value={filters.hei_type || "all"} 
                            onValueChange={(v) => handleFilterChange("hei_type", v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-3 h-3 mr-2" />
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="SUC">SUC</SelectItem>
                                <SelectItem value="LUC">LUC</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select 
                            value={filters.batch || "all"} 
                            onValueChange={(v) => handleFilterChange("batch", v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-3 h-3 mr-2" />
                                <SelectValue placeholder="Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Batches</SelectItem>
                                {batches.map((b) => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[400px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="-ml-3 h-8 hover:bg-gray-100 font-bold text-xs uppercase"
                                        onClick={() => toggleSort('hei_name')}
                                    >
                                        HEI Name
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                
                                <TableHead>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="-ml-3 h-8 hover:bg-gray-100 font-bold text-xs uppercase"
                                        onClick={() => toggleSort('type_of_heis')}
                                    >
                                        Type
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                
                                <TableHead className="text-center">
                                    {/* FIXED: Removed 'hei' variable from here */}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 hover:bg-gray-100 font-bold text-xs uppercase"
                                        onClick={() => toggleSort('scholars_count')}
                                    >
                                        Total Grantees
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedHeis.data.length > 0 ? (
                                paginatedHeis.data.map((hei: any) => (
                                    <TableRow key={hei.id}>
                                        <TableCell className="font-medium">
                                            {hei.hei_name}
                                            <div className="text-xs text-muted-foreground">{hei.hei_code || "No Code"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{hei.type_of_heis || "N/A"}</Badge>
                                        </TableCell>
                                        
                                        {/* FIXED: Used 'enrollments_count' here inside the loop */}
                                        <TableCell className="text-center">
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
                                                {hei.enrollments_count ?? 0} Grantees
                                            </Badge>
                                        </TableCell>
                                        
                                        <TableCell className="text-right">
                                            <Link
                                                href={route(
                                                    "admin.tdp.hei.show",
                                                    hei.id
                                                )}
                                            >
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No HEIs found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {paginationLinks.length > 0 && (
                    <div className="mt-4">
                        <PaginationLinks links={paginationLinks} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}