import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps, Scholar, HEI, ScholarEnrollment, Address } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { academicRecordColumns } from "./ShowScholarColumns"; 
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';

// Define types locally or import
type ShowScholarProps = PageProps & {
    scholar: Scholar & {
        address: (Address & {
            town_city: string | null;
            congressional_district: string | null;
        }) | null;
        enrollments: (ScholarEnrollment & {
            program?: { program_name?: string | null } | null;
            hei: HEI;
            academic_records: any[]; 
        })[];
    };
};

export default function ShowScholar({ auth, scholar }: ShowScholarProps) {
    if (!auth.user) return null;

    const { given_name, family_name, middle_name, extension_name, sex, contact_no, email_address, address, enrollments } = scholar;
    const fullName = [family_name, given_name, middle_name, extension_name].filter(Boolean).join(', ');
    const fullAddress = [address?.specific_address, address?.barangay, address?.town_city, address?.province, address?.region].filter(Boolean).join(', ');

    // 1. Find TES Enrollment
    const tesEnrollment = enrollments.find(e => 
        e.program?.program_name?.toUpperCase().includes('TES')
    );

    // 2. Get History
    // Sort by Academic Year / Semester descending to show latest on top
    const history = (tesEnrollment?.academic_records || []).sort((a, b) => b.id - a.id);

    // 3. Get Latest Course (from the most recent academic record)
    const latestCourse = history.length > 0 ? history[0].course?.course_name : "N/A";

    return (
        <AuthenticatedLayout user={auth.user} page_title={`${fullName} - TES Profile`}>
            <Head title={`Scholar: ${fullName}`} />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Link href={route('admin.tes.index', { tab: 'masterlist' })}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to TES Masterlist
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Badge variant={tesEnrollment ? "default" : "destructive"}>
                            {tesEnrollment ? `TES Scholar` : "Not Enrolled in TES"}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Scholar Details Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <InfoItem label="Name" value={fullName} />
                                <InfoItem label="Email" value={email_address} />
                                <InfoItem label="Contact" value={contact_no} />
                                <InfoItem label="Sex" value={sex} />
                                <InfoItem label="HEI" value={tesEnrollment?.hei?.hei_name} />
                                {/* ✅ ADDED: Course Display */}
                                <InfoItem label="Course" value={latestCourse} />
                                <InfoItem label="Award No." value={tesEnrollment?.award_number} />
                                <InfoItem label="Address" value={fullAddress} />
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Scholar History Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Academic & Payment History (TES)</CardTitle>
                            <CardDescription>
                                A full history of this scholar's records under the TES program.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {history.length > 0 ? (
                                <DataTable columns={academicRecordColumns} data={history} />
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    No academic history found for TES.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || "N/A"}</dd>
    </div>
);