import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from "@/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, School, Building2 } from 'lucide-react';
import { route } from 'ziggy-js';

// ✅ Import the new component
import { CmspScholarTabs } from './CmspScholarTabs';

export default function CmspShowHei({ auth, hei, scholars, filters }: any) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        CMSP - Institution Details
                    </h2>
                    <Link href={route('admin.cmsp.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`${hei?.hei_name || 'HEI'} - CMSP`} />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* 1. HEI INFO CARD (Parent Only) */}
                <Card className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-zinc-950 border-amber-200 dark:border-amber-900 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-amber-100">
                                <School className="h-8 w-8 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-100 font-bold">
                                    {hei?.hei_name || 'Unknown Institution'}
                                </CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                        <MapPin className="h-4 w-4" /> 
                                        {hei?.province?.name || 'Region IX'}
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                        <Building2 className="h-4 w-4" /> 
                                        {hei?.type_of_heis || 'HEI'}
                                    </div>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                        {scholars?.total || 0} Active Scholars
                                    </Badge>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* 2. SCHOLAR TABS COMPONENT (List & History) */}
                <CmspScholarTabs 
                    hei={hei} 
                    scholars={scholars} 
                    filters={filters} 
                />

            </div>
        </AuthenticatedLayout>
    );
}