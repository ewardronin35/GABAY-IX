import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Users } from 'lucide-react';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { route } from 'ziggy-js';

export function CmspScholarTabs({ hei, scholars, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');

    // Debounced Search specific to this component
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                router.get(
                    route('admin.cmsp.show-hei', { id: hei.id }), 
                    { search }, 
                    { preserveState: true, replace: true, only: ['scholars', 'filters'] }
                );
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const scholarData = scholars?.data || [];

    return (
        <div className="space-y-4">
            {/* Search Bar Header */}
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" /> 
                    Scholar Masterlist
                </h3>
                <div className="relative w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search scholar name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Masterlist Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-center">GWA</TableHead>
                                    <TableHead className="text-center">Year</TableHead>
                                    <TableHead className="text-right">Grant</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scholarData.length > 0 ? (
                                    scholarData.map((record: any) => {
                                        const s = record.enrollment?.scholar;
                                        return (
                                            <TableRow key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <TableCell className="font-medium uppercase">
                                                    {s?.family_name}, {s?.given_name}
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{record.enrollment?.scholarship_type}</Badge></TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={record.course?.course_name}>
                                                    {record.course?.course_name || '-'}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-amber-600 font-bold">{record.gwa || '-'}</TableCell>
                                                <TableCell className="text-center">{record.year_level}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">
                                                    ₱{Number(record.grant_amount).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Link href={route('admin.cmsp.scholar.show', { id: s?.id || 0 })}> 
                                                        <Button size="icon" variant="ghost">
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No records found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {scholars?.links && <div className="mt-4"><PaginationLinks links={scholars.links} /></div>}
        </div>
    );
}