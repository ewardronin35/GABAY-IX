import { useState } from "react";
import AuthenticatedLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    FileUp, Database, School, List, FileText, Download, BarChart3, 
    ArrowRight 
} from "lucide-react";
import { MsrsDatabaseGrid } from "./Partials/MsrsDatabaseGrid";
import { MsrsHeiGrid } from "./Partials/MsrsHeiGrid";
import { MsrsMasterlistGrid } from "./Partials/MsrsMasterlistGrid"; 
import { MsrsImport } from "./Partials/MsrsImport"; 
import { MsrsReportGenerator } from "./Partials/MsrsReportGenerator"; 

export default function MsrsIndex({ 
    auth, 
    enrollments, 
    paginatedHeis,
    filters,
    academicYears,
    semesters,
    heiList,
    courses,
    regions,
    provinces,
    cities,
    districts,
    stats
}: any) {
    
    // --- STATE ---
    // Default to 'per-hei' as requested (removed overview)
    const [activeTab, setActiveTab] = useState("per-hei");

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', notation: 'compact' }).format(val);

    return (
        <AuthenticatedLayout user={auth.user} page_title="MSRS Dashboard">
            <Head title="MSRS - Medical Scholarship" />

            <div className="flex flex-col space-y-6 p-4 md:p-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">MSRS Program</h2>
                        <p className="text-muted-foreground">
                            Medical Scholarship and Return Service - Region IX
                        </p>
                    </div>
                    
                </div>

                {/* --- KPI CARDS (ALWAYS VISIBLE) --- */}
             
                {/* --- TABS --- */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="inline-flex h-10 items-center justify-start w-auto rounded-md bg-muted p-1 text-muted-foreground">
                            <TabsTrigger value="per-hei" className="gap-2 px-4"><School className="h-4 w-4" /> Per HEI</TabsTrigger>
                            <TabsTrigger value="database" className="gap-2 px-4"><Database className="h-4 w-4" /> Database</TabsTrigger>
                            <TabsTrigger value="masterlist" className="gap-2 px-4"><List className="h-4 w-4" /> Masterlist</TabsTrigger>
                            <TabsTrigger value="import" className="gap-2 px-4"><FileUp className="h-4 w-4" /> Import</TabsTrigger>
                            <TabsTrigger value="reports" className="gap-2 px-4"><BarChart3 className="h-4 w-4" /> Reports</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* 1. PER HEI TAB (Default) */}
                    <TabsContent value="per-hei" className="space-y-4">
                        <MsrsHeiGrid paginatedHeis={paginatedHeis} filters={filters} />
                    </TabsContent>

                    {/* 2. DATABASE TAB */}
                    <TabsContent value="database" className="space-y-4">
                        <MsrsDatabaseGrid 
                            enrollments={enrollments}
                            filters={filters}
                            academicYears={academicYears}
                            semesters={semesters}
                            heiList={heiList}
                        />
                    </TabsContent>

                    {/* 3. MASTERLIST TAB */}
                    <TabsContent value="masterlist" className="space-y-4">
                        <MsrsMasterlistGrid 
                            enrollments={enrollments}
                            filters={filters}
                            academicYears={academicYears}
                            semesters={semesters}
                            heiList={heiList}
                            courses={courses}
                            regions={regions}
                            provinces={provinces}
                            cities={cities}
                            districts={districts}
                        />
                    </TabsContent>

                   <TabsContent value="import" className="space-y-4">
                     {/* ✅ JUST RENDER THE COMPONENT */}
                     <MsrsImport />
                 </TabsContent>
                    {/* 5. REPORTS TAB */}
                    <TabsContent value="reports" className="space-y-4">
                        <MsrsReportGenerator stats={stats} academicYears={academicYears} />
                    </TabsContent>

                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}

// Icons
function UsersIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function CheckCircleIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function BanknoteIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;
}