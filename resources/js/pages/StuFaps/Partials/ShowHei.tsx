import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, School, GraduationCap, Eye } from 'lucide-react'; // ✅ Imported Eye Icon
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { route } from 'ziggy-js';

export default function StufapShowHei({ auth, hei, scholars, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.stufaps.show-hei', { hei: hei.id }), 
            { search }, 
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                        <School className="h-5 w-5" />
                        HEI Profile
                    </h2>
                    <Link href={route('admin.stufaps.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Masterlist
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`${hei.hei_name} - Scholars`} />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* HEI Header */}
                <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                                    {hei.hei_name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{hei.type_of_heis || 'HEI'}</Badge>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> 
                                        {hei.address || 'Region IX'}
                                    </span>
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Scholars</div>
                                <div className="text-3xl font-bold">{scholars.total}</div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Scholars List */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-green-600" />
                                Enrolled Scholars
                            </CardTitle>
                            
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input 
                                    placeholder="Search student or award no..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-[250px]"
                                />
                                <Button type="submit" size="icon" variant="secondary">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
                                    <TableRow>
                                        <TableHead>Award No</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Program/Course</TableHead>
                                        <TableHead className="text-center">Year Level</TableHead>
                                        <TableHead className="text-right">Total Grant</TableHead>
                                        <TableHead className="text-center w-[100px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scholars.data.length > 0 ? (
                                        scholars.data.map((enrollment: any) => {
                                            // Handle naming convention mismatch if exists
                                            const records = enrollment.academicrecords || enrollment.academic_records || [];
                                            const latestRecord = records[0] || {};
                                            
                                            const totalGrant = records.reduce((acc: number, r: any) => 
                                                acc + Number(r.grant_amount || 0), 0
                                            );

                                            const scholar = enrollment.scholar || {};
                                            const fullName = [scholar.family_name, scholar.given_name]
                                                .filter(Boolean)
                                                .join(', ') || "Unknown Name";

                                            return (
                                                <TableRow key={enrollment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {enrollment.award_number}
                                                    </TableCell>
                                                    <TableCell className="font-medium uppercase">
                                                        {fullName}
                                                    </TableCell>
                                                    <TableCell className="max-w-[250px] truncate" title={latestRecord.course?.course_name}>
                                                        {latestRecord.course?.course_name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {latestRecord.year_level || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600">
                                                        ₱{totalGrant.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {/* ✅ NEW: Link to the separate history page */}
                                                        {scholar.id ? (
                                                            <Link href={route('admin.stufaps.scholar.show', { scholar: scholar.id })}>
                                                                <Button variant="ghost" size="icon" title="View Full History">
                                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">No ID</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No scholars found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4">
                            <PaginationLinks links={scholars.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}