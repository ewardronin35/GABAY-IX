import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, MapPin, Phone, Mail, History, Users, Award, Calculator, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function CmspShowScholar({ auth, scholar }: any) {
    const enrollment = scholar.enrollments?.[0]; // Assuming primary CMSP enrollment
    const history = enrollment?.academic_records || [];
    const addr = scholar.address;
    
    // Helper to find relative from normalized 'relatives' array or fallback to flat fields
    const getRelative = (type: string) => {
        if (scholar.relatives && Array.isArray(scholar.relatives)) {
            return scholar.relatives.find((r: any) => r.relationship_type === type);
        }
        return null;
    };

    const father = getRelative('FATHER');
    const mother = getRelative('MOTHER');

    // Helper to check boolean/doc flags
    const DocStatus = ({ hasDoc, label }: { hasDoc: boolean; label: string }) => (
        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {hasDoc ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-red-400 dark:text-red-600" />
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Scholar Profile
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()} className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            }
        >
            <Head title={`${scholar.family_name}, ${scholar.given_name}`} />

            <div className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Card */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 flex justify-center">
                                    <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-300 border-4 border-white dark:border-gray-700 shadow-sm">
                                        {scholar.given_name?.[0]}{scholar.family_name?.[0]}
                                    </div>
                                </div>
                                <div className="flex-grow space-y-2 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center md:justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {scholar.family_name}, {scholar.given_name} {scholar.middle_name} {scholar.extension_name}
                                            </h1>
                                            <p className="text-muted-foreground dark:text-gray-400 font-mono mt-1">
                                                {scholar.lrn ? `LRN: ${scholar.lrn}` : 'No LRN Provided'}
                                            </p>
                                        </div>
                                        <Badge className="mt-2 md:mt-0 text-md px-4 py-1" variant={enrollment?.status === 'Enrolled' ? 'default' : 'secondary'}>
                                            {enrollment?.scholarship_type || 'Scholar'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <Mail className="h-4 w-4" /> {scholar.email_address || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <Phone className="h-4 w-4" /> {scholar.contact_no || scholar.mobile_no || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <User className="h-4 w-4" /> {scholar.sex === 'M' ? 'Male' : 'Female'} | {scholar.civil_status}
                                        </div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <MapPin className="h-4 w-4" /> {addr?.town_city}, {addr?.province}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column: Personal Info & Ranking */}
                        <div className="space-y-6">
                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg dark:text-white">
                                        <Calculator className="mr-2 h-5 w-5 text-amber-500" /> 
                                        Ranking Points
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">GWA Points</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{enrollment?.grade_points ?? '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Income Points</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{enrollment?.income_points ?? '-'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Total Points</span>
                                        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{enrollment?.total_points ?? '-'}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-gray-500 mt-2">
                                        Qualified for: {enrollment?.qualified_scholarships || 'N/A'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg dark:text-white">
                                        <FileText className="mr-2 h-5 w-5 text-indigo-500" /> 
                                        Submitted Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    {/* These rely on the mapped doc check we did in import, or normalized table if updated */}
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'INCOME_PROOF' && d.is_submitted) || !!enrollment?.doc_proof_income} label="Proof of Income" />
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'GOOD_MORAL' && d.is_submitted) || !!enrollment?.doc_good_moral} label="Good Moral" />
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'SOLO_PARENT_CERT' && d.is_submitted) || !!enrollment?.doc_solo_parent} label="Solo Parent Cert" />
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'IP_CERT' && d.is_submitted) || !!enrollment?.doc_ip_cert} label="Indigenous People Cert" />
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'PWD_CERT' && d.is_submitted) || !!enrollment?.doc_pwd_cert} label="PWD Certificate" />
                                    <DocStatus hasDoc={enrollment?.application_documents?.some((d:any) => d.document_type === 'GUARDIAN_AFFIDAVIT' && d.is_submitted) || !!enrollment?.doc_guardian_affidavit} label="Guardian Affidavit" />
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg dark:text-white">
                                        <Users className="mr-2 h-5 w-5 text-green-600" /> 
                                        Family Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4 dark:text-gray-300">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <span className="font-semibold block text-gray-700 dark:text-gray-200 mb-1">Father</span>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {father?.full_name || scholar.father_name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {father?.occupation || scholar.father_occupation ? `Occ: ${father?.occupation || scholar.father_occupation}` : ''}
                                            {father?.is_living !== undefined ? (father.is_living ? ' (Living)' : ' (Deceased)') : ''}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <span className="font-semibold block text-gray-700 dark:text-gray-200 mb-1">Mother</span>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {mother?.full_name || scholar.mother_name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {mother?.occupation || scholar.mother_occupation ? `Occ: ${mother?.occupation || scholar.mother_occupation}` : ''}
                                            {mother?.is_living !== undefined ? (mother.is_living ? ' (Living)' : ' (Deceased)') : ''}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="font-semibold block text-gray-700 dark:text-gray-400">Total Family Income</span>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            ₱{Number(scholar.family_income).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-700 dark:text-gray-400">Siblings</span>
                                        {scholar.siblings_count || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Academic History & Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg dark:text-white">
                                        <Award className="mr-2 h-5 w-5 text-purple-500" />
                                        Current Application Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs">Application Type</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{enrollment?.application_type || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs">Application Year</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{enrollment?.application_year || enrollment?.academic_year_applied || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs">Entry Date</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{enrollment?.entry_date || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs">App Date</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{enrollment?.application_date || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs">Intended School (HEI)</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-base">
                                            {enrollment?.hei?.name || enrollment?.hei?.hei_name || 'Unknown HEI'}
                                        </span>
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            {enrollment?.school_type || enrollment?.hei?.hei_type || '-'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg dark:text-white">
                                        <History className="mr-2 h-5 w-5 text-blue-500" /> 
                                        Academic Records
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">History of enrollment and grades.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border dark:border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-700">
                                                <TableRow className="dark:border-gray-700 hover:bg-transparent">
                                                    <TableHead className="text-gray-700 dark:text-gray-300 font-bold">AY / Sem</TableHead>
                                                    <TableHead className="text-gray-700 dark:text-gray-300 font-bold">School / Course</TableHead>
                                                    <TableHead className="text-center text-gray-700 dark:text-gray-300 font-bold">Year</TableHead>
                                                    <TableHead className="text-center text-gray-700 dark:text-gray-300 font-bold">GWA</TableHead>
                                                    <TableHead className="text-right text-gray-700 dark:text-gray-300 font-bold">Grant</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="bg-white dark:bg-gray-800">
                                                {history.length > 0 ? (
                                                    history.map((rec: any) => (
                                                        <TableRow key={rec.id} className="dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                            <TableCell className="font-medium dark:text-gray-200 align-top">
                                                                <div className="whitespace-nowrap">{rec.academic_year?.name || '2024-2025'}</div>
                                                                <span className="text-xs text-muted-foreground dark:text-gray-400">{rec.semester?.name || '1st Semester'}</span>
                                                            </TableCell>
                                                            <TableCell className="dark:text-gray-300 align-top">
                                                                <div className="font-semibold text-xs text-gray-700 dark:text-gray-200 mb-1">
                                                                    {rec.hei?.name || rec.hei?.hei_name || 'N/A'}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {rec.course?.course_name || rec.course?.name || rec.course_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center dark:text-gray-300 align-top pt-4">
                                                                {rec.year_level}
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400 align-top pt-4">
                                                                {rec.gwa || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono text-green-600 dark:text-green-400 font-bold align-top pt-4">
                                                                {rec.grant_amount 
                                                                    ? `₱${Number(rec.grant_amount).toLocaleString()}` 
                                                                    : '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow className="dark:border-gray-700 hover:bg-transparent">
                                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground dark:text-gray-500">
                                                            No academic history found.
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