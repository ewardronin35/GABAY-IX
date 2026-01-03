import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, MapPin, GraduationCap, School, Calendar, Wallet, CheckCircle2, Phone, Mail } from 'lucide-react';
import { route } from 'ziggy-js';

export default function StufapScholarHistory({ auth, scholar, enrollment, records }: any) {
    const addr = scholar.address;
    
    // Determine back link logic
    const backRoute = enrollment.hei_id 
        ? route('admin.stufaps.show-hei', { hei: enrollment.hei_id })
        : route('admin.stufaps.index');

    // Calculate Financials
    const totalGrant = records.reduce((acc: number, r: any) => acc + Number(r.grant_amount || 0), 0);
    const totalRecords = records.length;
    const validatedCount = records.filter((r: any) => r.validation_status === 'Validated').length;

    // Currency Formatter
    const formatCurrency = (val: any) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(val || 0));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Scholar History (StuFAP)
                    </h2>
                    <Button variant="outline" size="sm" asChild className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                        <Link href={backRoute}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`History: ${scholar.family_name}, ${scholar.given_name}`} />

            <div className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Header Profile Card */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar / Initials */}
                                <div className="flex-shrink-0 flex justify-center">
                                    <div className="h-24 w-24 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-3xl font-bold text-teal-700 dark:text-teal-300 border-4 border-white dark:border-gray-700 shadow-sm">
                                        {scholar.given_name?.[0]}{scholar.family_name?.[0]}
                                    </div>
                                </div>
                                
                                {/* Scholar Details */}
                                <div className="flex-grow space-y-2 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center md:justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                                                {scholar.family_name}, {scholar.given_name} {scholar.middle_name}
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs dark:text-gray-300 dark:border-gray-600">
                                                    Award No: {enrollment.award_number || 'N/A'}
                                                </Badge>
                                                <Badge className="bg-blue-600 hover:bg-blue-700">
                                                    {enrollment.status?.toUpperCase() || 'ACTIVE'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {scholar.email_address || 'No Email'}
                                        </div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {scholar.contact_no || scholar.mobile_no || 'No Contact'}
                                        </div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            {addr ? `${addr.town_city}, ${addr.province}` : 'No Address'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Stats & Info */}
                        <div className="space-y-6">
                            
                            {/* Financial Summary */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex items-center dark:text-white">
                                        <Wallet className="mr-2 h-5 w-5 text-green-600" /> 
                                        Financial Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">Total Grants Received</p>
                                        <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                            {formatCurrency(totalGrant)}
                                        </h3>
                                    </div>
                                    <Separator className="my-4 dark:bg-gray-700" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-500">Total Records</p>
                                            <p className="text-xl font-semibold dark:text-white">{totalRecords}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-500">Validated</p>
                                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{validatedCount}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* School Info */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center dark:text-white">
                                        <School className="mr-2 h-5 w-5 text-indigo-500" /> 
                                        Current Institution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">HEI Name</p>
                                        <p className="text-sm font-medium dark:text-gray-200 mt-0.5">
                                            {enrollment.hei?.name || enrollment.hei?.hei_name || 'Unknown HEI'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Application No.</p>
                                        <p className="text-sm font-medium dark:text-gray-200 mt-0.5">
                                            {enrollment.application_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Entry Year</p>
                                        <p className="text-sm font-medium dark:text-gray-200 mt-0.5">
                                            {enrollment.academic_year_applied || 'N/A'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: History Table */}
                        <div className="lg:col-span-2">
                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center dark:text-white">
                                        <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                                        Academic History
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Record of enrollment, grades, and financial grants.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border dark:border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-700">
                                                <TableRow className="dark:border-gray-700 hover:bg-transparent">
                                                    <TableHead className="w-[180px] dark:text-gray-300 font-bold">AY / Semester</TableHead>
                                                    <TableHead className="dark:text-gray-300 font-bold">Course / Details</TableHead>
                                                    <TableHead className="text-center dark:text-gray-300 font-bold">GWA</TableHead>
                                                    <TableHead className="text-right dark:text-gray-300 font-bold">Amount</TableHead>
                                                    <TableHead className="text-center dark:text-gray-300 font-bold">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="bg-white dark:bg-gray-800">
                                                {records.length > 0 ? (
                                                    records.map((record: any) => (
                                                        <TableRow key={record.id} className="dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                            <TableCell className="font-medium dark:text-gray-200 align-top">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                                    {record.academic_year?.name || 'Unknown AY'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground dark:text-gray-400 pl-5">
                                                                    {record.semester?.name || 'Term'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="dark:text-gray-300 align-top">
                                                                <div className="text-sm font-medium">
                                                                    {record.course?.name || record.course_name || 'Course Not Specified'}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    Year Level: <span className="font-semibold text-gray-700 dark:text-gray-300">{record.year_level}</span>
                                                                    {record.units_enrolled && ` • Units: ${record.units_enrolled}`}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400 align-top pt-4">
                                                                {record.gwa || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono text-green-600 dark:text-green-400 font-bold align-top pt-4">
                                                                {record.grant_amount ? formatCurrency(record.grant_amount) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-center align-top pt-3">
                                                                <Badge 
                                                                    variant={record.validation_status === 'Validated' ? 'default' : 'secondary'}
                                                                    className={
                                                                        record.validation_status === 'Validated' 
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800' 
                                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                                    }
                                                                >
                                                                    {record.validation_status || 'Pending'}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow className="dark:border-gray-700 hover:bg-transparent">
                                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground dark:text-gray-500">
                                                            No academic history found for this scholar.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}