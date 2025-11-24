// resources/js/pages/Admin/Tdp/Partials/ShowScholar.tsx
import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps, Scholar, AcademicRecord, HEI, Course, Major, ScholarEnrollment, Address } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { academicRecordColumns } from "./ShowScholarColumns"; 
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';

// Define a more specific type for the page prop
type ShowScholarProps = PageProps & {
    scholar: Scholar & {
        // --- THIS IS THE FIX ---
        // Update the type to match the snake_case from the database
        address: Address & {
            congressional_district: string | null;
            specific_address?: string | null;
            // Add other fields if you use them directly, otherwise 'Address' type is fine
        } | null;
        enrollments: (ScholarEnrollment & {
            program?: { program_name?: string | null } | null;
            hei: HEI;
            academic_records: (AcademicRecord & { // <-- FIX TYPE
                course: Course | null;
                major: Major | null;
            })[];
        })[];
        // --- END OF FIX ---
    };
};

export default function ShowScholar({ auth, scholar }: ShowScholarProps) {
    
    console.log('--- FRONTEND: 1. RECEIVED SCHOLAR PROP ---');
    console.log(JSON.stringify(scholar, null, 2));
    if (!auth.user) return null;

    const {
        given_name, family_name, middle_name, extension_name,
        sex, contact_no, email_address, address, enrollments
    } = scholar;
    
    const tdpEnrollment = enrollments?.[0];
    
    // --- THIS IS THE FIX ---
    // Change from .academicRecords to .academic_records
    const history = tdpEnrollment?.academic_records || [];
    // --- END OF FIX ---
    
    const fullName = [family_name, given_name, middle_name, extension_name].filter(Boolean).join(' ');

    // Use the renamed 'specific_address' field from your migration
    const fullAddress = [
        address?.specific_address, // <-- FIX: Use specific_address
        address?.town_city, 
        address?.province
    ].filter(Boolean).join(', ');

    return (
        <AuthenticatedLayout user={auth.user} page_title={fullName}>
            <Head title={fullName} />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Link href={route('superadmin.tdp.index', { tab: 'database' })}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Database
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Scholar Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{fullName}</CardTitle>
                            <CardDescription>
                                Scholar's personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <InfoItem label="Sex" value={sex} />
                            <InfoItem label="Email" value={email_address} />
                            <InfoItem label="Contact No." value={contact_no} />
                            <InfoItem label="Program" value={tdpEnrollment?.program?.program_name} />
                            <InfoItem label="HEI" value={tdpEnrollment?.hei?.hei_name} />
                            <InfoItem label="Award No." value={tdpEnrollment?.award_number} />
                            <InfoItem label="Address" value={fullAddress} />
                            <InfoItem label="District" value={address?.congressional_district} />
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
const InfoItem = ({ label, value }: { label: string | null | undefined; value: string | null | undefined; }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label || 'N/A'}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {value || "N/A"}
        </dd>
    </div>
);