import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, GraduationCap, MapPin, Calendar, CreditCard, Printer } from 'lucide-react'; // Added Printer icon

export default function CoschoShowScholar({ auth, enrollment, scholar, history }: any) {
    const address = scholar.address || {};
    const fullAddress = [address.barangay, address.town_city, address.province].filter(Boolean).join(', ');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${scholar.family_name} - History`} />

            <div className="container mx-auto py-8 space-y-6 max-w-5xl">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to HEI
                    </Button>
                    
                    {/* NEW PRINT NOA BUTTON */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => window.open(route('admin.coscho.generate-noa', enrollment.id), '_blank')}
                    >
                        <Printer className="h-4 w-4" /> Print Notice of Award
                    </Button>
                </div>

                {/* Profile Header */}
                <Card className="border-t-4 border-t-blue-600 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold uppercase text-slate-900 dark:text-white">
                                        {scholar.family_name}, {scholar.given_name} {scholar.middle_name} {scholar.extension_name}
                                    </h1>
                                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><CreditCard className="h-3 w-3"/> Award No: <span className="font-mono text-slate-900 dark:text-slate-200">{enrollment.award_number}</span></span>
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {fullAddress || 'No Address'}</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> DOB: {scholar.date_of_birth || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={enrollment.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-gray-500'}>
                                    {enrollment.status}
                                </Badge>
                                <div className="text-xs text-muted-foreground">HEI: {enrollment.hei?.hei_name}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Academic History Timeline (Existing Code...) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600"/>
                            Academic History & Financial Benefits
                        </CardTitle>
                        <CardDescription>Record of enrollment, grades, and disbursements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-center">Year Level</TableHead>
                                    <TableHead className="text-center">GWA</TableHead>
                                    <TableHead className="text-right">Grant Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((record: any) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.academic_year?.name}</TableCell>
                                        <TableCell>{record.semester?.name || '1st Semester'}</TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={record.course?.course_name}>
                                            {record.course?.course_name || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-center">{record.year_level}</TableCell>
                                        <TableCell className="text-center">{record.gwa || '-'}</TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600 font-bold">
                                            {record.grant_amount ? `₱${Number(record.grant_amount).toLocaleString()}` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No academic records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}