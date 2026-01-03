import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, School, GraduationCap, History, Eye } from 'lucide-react';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { route } from 'ziggy-js';

export default function EstatShowHei({ auth, hei, scholars, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.estatskolar.show-hei', { id: hei.id }), 
            { search }, 
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-zinc-800 dark:text-zinc-200 leading-tight flex items-center gap-2">
                        <School className="h-5 w-5 text-emerald-600"/>
                        <span className="truncate max-w-[60vw]">{hei.hei_name}</span>
                    </h2>
                    <Link href={route('admin.estatskolar.index')}>
                        <Button variant="outline" size="sm" className="gap-2 border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4"/> Back
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={hei.hei_name} />

            <div className="py-6 max-w-[100vw] mx-auto sm:px-4 lg:px-6">
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">Grantees Masterlist</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Managing {scholars.total} records for this institution.
                                </CardDescription>
                            </div>
                            <form onSubmit={handleSearch} className="relative w-full md:w-[300px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input 
                                    placeholder="Search student or award no..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    className="pl-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                                />
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                <TableRow className="border-zinc-200 dark:border-zinc-800">
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Award No.</TableHead>
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Name</TableHead>
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Course</TableHead>
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Year Level</TableHead>
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Status</TableHead>
                                    <TableHead className="text-zinc-700 dark:text-zinc-300">Special Group</TableHead>
                                    <TableHead className="text-right text-zinc-700 dark:text-zinc-300">History</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scholars.data.length > 0 ? (
                                    scholars.data.map((enrollment: any) => {
                                        const scholar = enrollment.scholar;
                                        const record = enrollment.academic_records?.[0] || {};
                                        return (
                                            <TableRow key={enrollment.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <TableCell className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                                    {enrollment.award_number}
                                                </TableCell>
                                                <TableCell className="uppercase font-medium text-zinc-700 dark:text-zinc-200">
                                                    {scholar.family_name}, {scholar.given_name}
                                                </TableCell>
                                                <TableCell className="truncate max-w-[200px] text-zinc-600 dark:text-zinc-400">
                                                    {record.course?.course_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                    {record.year_level || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex gap-1 flex-wrap">
                                                    {scholar.is_pwd === 1 && <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20">PWD</Badge>}
                                                    {scholar.is_solo_parent === 1 && <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20">Solo</Badge>}
                                                    {scholar.is_ip === 'Yes' && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">IP</Badge>}
                                                </TableCell>
                                                
                                                {/* ACTION COLUMN */}
                                                <TableCell className="text-right">
                                                    <Link href={route('admin.estatskolar.show-scholar', { id: enrollment.id })}>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:bg-zinc-800">
                                                            <History className="h-4 w-4" />
                                                            <span className="sr-only">History</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            No scholars found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <PaginationLinks links={scholars.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}