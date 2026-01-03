import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, User, Mail, Phone, MapPin, 
    Calendar, School, FileText
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    auth: any;
    scholar: any;
    enrollment: any;     
    academicRecords: any[]; 
}

const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('validated') || s.includes('passed') || s.includes('paid')) return 'text-green-600 bg-green-50 border-green-200';
    if (s.includes('failed') || s.includes('incomplete')) return 'text-red-600 bg-red-50 border-red-200';
    if (s.includes('probation')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
};

const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

const renderAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const parts = [
        address.specific_address,
        address.town_city || address.city?.name,
        address.province || address.province?.name
    ].filter(part => part && typeof part === 'string' && part.trim() !== '');
    return parts.length > 0 ? parts.join(', ') : 'N/A';
};

export default function ScholarHistory({ auth, scholar, enrollment, academicRecords = [] }: Props) {
    const safeRoute = (name: string, params?: any) => {
        try { return route(name, params); } catch (e) { return '#'; }
    };

    const currentStatus = enrollment?.status || 'Unknown';
    const fullName = scholar ? `${scholar.family_name}, ${scholar.given_name} ${scholar.extension_name || ''}` : 'Loading...';
    const addressString = renderAddress(scholar?.address);

    // Calculate Total Grant Amount
    const totalGrants = academicRecords.reduce((sum, record) => {
        const amt = record.grant_amount || record.billing_record?.amount || 0;
        return sum + Number(amt);
    }, 0);

    return (
        <AuthenticatedLayout user={auth?.user} page_title="Scholar Profile">
            <Head title={`Scholar - ${scholar?.family_name}`} />

            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                
                {/* 1. NAVIGATION */}
                <div className="flex items-center justify-between">
                    <Link href={safeRoute('admin.msrs.index')}>
                        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Masterlist
                        </Button>
                    </Link>
                </div>

                {/* 2. PROFILE */}
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                            <User className="h-10 w-10" />
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold">{fullName}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                                            {enrollment?.award_number || 'No Award No.'}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(currentStatus)}`}>
                                            {currentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pt-4 border-t border-border">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email</p>
                                    <p className="font-medium">{scholar?.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Contact</p>
                                    <p className="font-medium">{scholar?.contact_number || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Address</p>
                                    <p className="font-medium truncate" title={addressString}>{addressString}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HISTORY TABLE */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            Academic History & Financials
                        </h3>
                    </div>

                    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left caption-bottom">
                                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 w-[20%]">Academic Year / Term</th>
                                        <th className="px-6 py-4 w-[25%]">Institution</th>
                                        <th className="px-6 py-4 w-[25%]">Course Details</th>
                                        <th className="px-6 py-4 w-[10%] text-right">Financials</th>
                                        <th className="px-6 py-4 w-[10%] text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {academicRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                                                    <p>No academic records found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        academicRecords.map((record: any, idx: number) => {
                                            const amount = record.grant_amount || record.billing_record?.amount || 0;
                                            return (
                                                <tr key={record.id || idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">
                                                                {record.academic_year?.name || 'Unknown AY'}
                                                            </span>
                                                            <span className="text-muted-foreground text-xs">
                                                                {record.semester?.name || '1st Semester'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex items-start gap-2">
                                                            <School className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                            <span className="text-foreground line-clamp-2" title={record.hei?.hei_name}>
                                                                {record.hei?.hei_name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">
                                                                {record.course?.name || record.course?.course_name || 'N/A'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Year Level {record.year_level || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 align-top text-right text-foreground font-mono font-medium">
                                                        {formatCurrency(Number(amount))}
                                                    </td>
                                                    <td className="px-6 py-4 align-top text-center">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getStatusColor(record.validation_status)}`}>
                                                            {record.validation_status || 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                                {/* FOOTER: TOTAL */}
                                {academicRecords.length > 0 && (
                                    <tfoot className="bg-muted/50 border-t border-border">
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-right font-bold text-foreground">
                                                TOTAL GRANTS RECEIVED:
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-foreground font-mono text-lg">
                                                {formatCurrency(totalGrants)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}