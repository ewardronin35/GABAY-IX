import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps, Scholar, AcademicRecord, HEI, Course, Major, ScholarEnrollment, Address } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { academicRecordColumns, AcademicRecordWithRelations } from "./ShowScholarColumns";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';

// Define a more specific type for the page prop
type ShowScholarProps = PageProps & {
    scholar: Scholar & {
        address: (Address & {
            town_city: string | null;
            congressional_district: string | null;
        }) | null;
        enrollments: (ScholarEnrollment & {
            program?: { program_name?: string | null } | null;
            hei: HEI;
            // Use the exported type here so it matches the columns perfectly
            academic_records: AcademicRecordWithRelations[]; 
        })[];
    };
};

export default function ShowScholar({ auth, scholar }: ShowScholarProps) {
    
    if (!auth.user) return null;

    const {
        given_name, family_name, middle_name, extension_name,
        sex, contact_no, email_address, address, enrollments
    } = scholar;

    // Get TDP Enrollment
    const tdpEnrollment = enrollments?.[0];
    
    // Get History and Latest Record
    // (Assumes controller sorts academic_records by latest first)
    const history = tdpEnrollment?.academic_records || [];
    const latestRecord = history.length > 0 ? history[0] : null; 

    const fullName = [family_name, given_name, middle_name, extension_name].filter(Boolean).join(' ');

    const fullAddress = [
        address?.specific_address, 
        address?.town_city, 
        address?.province
    ].filter(Boolean).join(', ');

    return (
        <AuthenticatedLayout user={auth.user} page_title={fullName}>
            <Head title={fullName} />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    {/* ✅ FIX: Ensure this goes back to TDP index */}
                    <Link href={route('admin.tdp.index', { tab: 'hei' })}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to TDP List
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Scholar Info Card */}
                   <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Full Name" value={fullName} />
                                <InfoItem label="Sex" value={scholar.sex} />
                                <InfoItem label="Birthdate" value={scholar.birthdate} />
                                <InfoItem label="Email" value={scholar.email_address} />
                                <InfoItem label="Contact No." value={scholar.contact_no} />
                                <InfoItem label="HEI" value={tdpEnrollment?.hei?.hei_name} />
                                
                                {/* ✅ NEW: Academic Details */}
                                <div className="md:col-span-2 space-y-4 pt-2 border-t mt-2">
                                    <div className="font-semibold text-sm">Academic Status</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem label="Current Course" value={latestRecord?.course?.course_name} />
                                        <InfoItem label="Year Level" value={latestRecord?.year_level} />
                                        <InfoItem label="Award No." value={tdpEnrollment?.award_number} />
                                        <InfoItem label="Eligibility" value={latestRecord?.eligibility_equivalent} />
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-2 border-t mt-2">
                                    <InfoItem label="Address" value={fullAddress} />
                                    <div className="mt-2">
                                        <InfoItem label="District" value={scholar.address?.congressional_district} />
                                    </div>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Scholar History Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Academic & Payment History</CardTitle>
                            <CardDescription>
                                A full history of this scholar's records under the TDP program.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={academicRecordColumns} data={history} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper component for info items
const InfoItem = ({ label, value }: { label: string | null | undefined; value: string | number | null | undefined; }) => (
    <div>
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label || 'N/A'}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
            {value || "N/A"}
        </dd>
    </div>
);