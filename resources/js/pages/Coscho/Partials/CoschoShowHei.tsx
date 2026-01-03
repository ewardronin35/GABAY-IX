import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, User, School, MapPin } from 'lucide-react';
import { route } from 'ziggy-js';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

export default function CoschoShowHei({ auth, hei, scholars, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.coscho.show-hei', hei.id), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${hei.hei_name} - COSCHO Scholars`} />

            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <School className="h-6 w-6 text-blue-600"/> 
                            {hei.hei_name}
                        </h1>
                        <p className="text-muted-foreground">{hei.hei_code} • {hei.type_of_heis}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Enrolled Scholars</CardTitle>
                            <CardDescription>List of students under COSCHO Program</CardDescription>
                        </div>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or award no..."
                                    className="pl-8 w-[300px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Award No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scholars.data.map((record: any) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-mono text-xs">{record.award_number}</TableCell>
                                        <TableCell>
                                            <div className="font-medium uppercase">
                                                {record.scholar.family_name}, {record.scholar.given_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{record.scholar.sex}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {record.academic_records?.[0]?.course?.course_name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'ACTIVE' ? 'default' : 'secondary'} className={record.status === 'ACTIVE' ? 'bg-emerald-500' : ''}>
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('admin.coscho.show-scholar', record.id)}>
                                                <Button size="sm" variant="outline">
                                                    <User className="h-3 w-3 mr-2"/> View History
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {scholars.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colspan={5} className="text-center py-8 text-muted-foreground">
                                            No scholars found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <PaginationLinks links={scholars.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}