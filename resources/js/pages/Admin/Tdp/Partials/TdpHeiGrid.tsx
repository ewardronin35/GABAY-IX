import { router, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { Eye } from 'lucide-react';
import {PaginationLinks} from '@/components/ui/PaginationLinks'; // Assuming you have this
import {route} from 'ziggy-js';
// Props for the grid
interface Paginator<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Hei {
    id: number;
    hei_name: string;
    scholar_count: number; // This comes from 'withCount' in the controller
}

interface TdpHeiGridProps {
    heis: Paginator<Hei>;
    filters?: {
        search_hei?: string;
    };
}

export function TdpHeiGrid({ heis, filters }: TdpHeiGridProps) {
    
    // Handle search filtering
    const handleSearch = useDebouncedCallback((value: string) => {
        router.get(
            route('superadmin.tdp.index'), // Assumes this is your route name
            { search_hei: value },
            { preserveState: true, replace: true }
        );
    }, 300);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <Input
                placeholder="Search by HEI name..."
                defaultValue={filters?.search_hei}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
            />

            {/* Data Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>HEI Name</TableHead>
                            <TableHead className="w-[150px] text-center">Scholar Count</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {heis.data.length > 0 ? (
                            heis.data.map((hei) => (
                                <TableRow key={hei.id}>
                                    <TableCell className="font-medium">{hei.hei_name}</TableCell>
                                    <TableCell className="text-center">{hei.scholar_count}</TableCell>
                                    <TableCell className="text-right">
                                        {/* This link points to a route we will create in the next step */}
                                        <Link href={route('superadmin.tdp.hei.show', { hei: hei.id })}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No HEIs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination */}
<PaginationLinks links={heis.links} />        </div>
    );
}