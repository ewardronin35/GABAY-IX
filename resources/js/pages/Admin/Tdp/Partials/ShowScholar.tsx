import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type PageProps, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';

// --- Define Types (adjust fields as needed for your TdpScholar model) ---
interface Scholar {
    id: number;
    family_name: string;
    given_name: string;
    middle_name?: string;
    extension_name?: string;
    sex: string;
    province: string;
    town_city: string;
    contact_no: string;
    email_address: string;
    academic_records: AcademicRecord[]; // ✅ CHANGED: from academicRecords
}

interface AcademicRecord {
    id: number;
    academic_year: string;
    semester: string;
    year_level: string;
    hei: { hei_name: string };
    course: { course_name: string };
    validation_status: string;
    date_paid?: string;
    ada_no?: string;
    tdp_grant?: number;
}

interface ShowScholarProps extends PageProps {
    scholar: Scholar;
}

export default function ShowScholar({ auth, scholar }: ShowScholarProps) {
    const fullName = [scholar.given_name, scholar.middle_name, scholar.family_name, scholar.extension_name].filter(Boolean).join(' ');

    // You can remove this console.log now if you want
    console.log('--- SHOW SCHOLAR PROPS ---', scholar);

    return (
        <AuthenticatedLayout
            user={auth.user as User}
            page_title={`Scholar Profile: ${fullName}`}
        >
            <Head title="Scholar Profile" />

            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <Link href={route('superadmin.tdp.index')} className="text-sm text-primary hover:underline">
                    &larr; Back to TDP Module
                </Link>
                
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>{fullName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {scholar.email_address || 'N/A'}</p>
                            <p><strong>Contact:</strong> {scholar.contact_no || 'N/A'}</p>
                            <p><strong>Sex:</strong> {scholar.sex || 'N/A'}</p>
                            <p><strong>Location:</strong> {scholar.town_city}, {scholar.province}</p>
                        </CardContent>
                    </Card>

                    {/* Payment History Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Payment & Academic History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>A.Y. / Sem</TableHead>
                                        <TableHead>HEI</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Paid</TableHead>
                                        <TableHead className="text-right">Grant</TableHead>
                                    </TableRow>
                                </TableHeader>
                              <TableBody>
    {/* ▼▼▼ THIS IS THE FIX ▼▼▼ */}
    {/* ✅ CHANGED: from scholar.academicRecords */}
    {scholar.academic_records && scholar.academic_records.length > 0 ? (
        // ✅ CHANGED: from scholar.academicRecords
        scholar.academic_records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>{record.academic_year} / {record.semester}</TableCell>
                                                <TableCell>{record.hei?.hei_name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{record.validation_status}</Badge>
                                                </TableCell>
                                                <TableCell>{record.date_paid || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    {record.tdp_grant ? `₱${record.tdp_grant.toLocaleString()}` : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No academic records found.
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