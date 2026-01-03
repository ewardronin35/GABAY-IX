import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, GraduationCap, MapPin, CalendarClock, School, CreditCard } from 'lucide-react';
import { route } from 'ziggy-js';

export default function EstatShowScholar({ auth, enrollment, scholar, history }: any) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-zinc-800 dark:text-zinc-200 leading-tight flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-600"/>
                        Scholar Profile
                    </h2>
                    <Link href={route('admin.estatskolar.show-hei', { id: enrollment.hei_id })}>
                        <Button variant="outline" size="sm" className="gap-2 border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4"/> Back to HEI
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`${scholar.family_name}, ${scholar.given_name}`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* 1. PROFILE HEADER CARD (Dark Mode Ready) */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar Placeholder */}
                            <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-2xl font-bold border-4 border-white dark:border-zinc-950 shadow-sm">
                                {scholar.given_name[0]}{scholar.family_name[0]}
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                                        {scholar.family_name}, {scholar.given_name} {scholar.middle_name}
                                    </h1>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700">
                                            {enrollment.award_number}
                                        </Badge>
                                        <Badge className={`${enrollment.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
                                            {enrollment.status}
                                        </Badge>
                                        {scholar.is_pwd === 1 && <Badge className="bg-orange-500 text-white">PWD</Badge>}
                                        {scholar.is_solo_parent === 1 && <Badge className="bg-purple-500 text-white">Solo Parent</Badge>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <School className="h-4 w-4 text-zinc-400"/> 
                                        <span>{enrollment.hei?.hei_name || 'No HEI Assigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-zinc-400"/> 
                                        <span>{history[0]?.course?.course_name || 'Course Not Set'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-zinc-400"/> 
                                        <span>{scholar.address?.region_name || 'Region IX'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-zinc-400"/> 
                                        <span>Type: {enrollment.scholarship_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. HISTORY TABS / SECTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Financial Summary */}
                    <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-emerald-600"/> Financial Summary
                            </CardTitle>
                            <CardDescription>Total grants received</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Disbursed</p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    ₱{history.reduce((acc:number, h:any) => acc + Number(h.grant_amount || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <Separator className="dark:bg-zinc-800"/>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Records Count</span>
                                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{history.length} Semesters</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">First Entry</span>
                                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{enrollment.entry_date || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Academic & Financial History Table */}
                    <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarClock className="h-5 w-5 text-blue-600"/> Program History
                            </CardTitle>
                            <CardDescription>Semester-by-semester academic and financial records.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                    <TableRow className="border-zinc-200 dark:border-zinc-800">
                                        <TableHead className="w-[150px]">Academic Year</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Year Level</TableHead>
                                        <TableHead>GWA</TableHead>
                                        <TableHead className="text-right">Grant Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length > 0 ? (
                                        history.map((rec: any) => (
                                            <TableRow key={rec.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-200">
                                                    {rec.academic_year?.name}
                                                </TableCell>
                                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                    {rec.semester?.name}
                                                </TableCell>
                                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                    {rec.year_level || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {rec.gwa ? <Badge variant="outline">{rec.gwa}</Badge> : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                                    {Number(rec.grant_amount) > 0 ? `₱${Number(rec.grant_amount).toLocaleString()}` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                                No history records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}