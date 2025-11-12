// resources/js/pages/Admin/Tdp/Partials/TdpReportGenerator.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, MapPinned, GraduationCap } from "lucide-react";
import type { TdpPageProps } from "../Index"; // Import the main page props

// --- ▼▼▼ FIX: Update props to receive 'statistics' ▼▼▼ ---
type ReportGeneratorProps = {
    statistics: TdpPageProps["statistics"];
};

export function TdpReportGenerator({ statistics }: ReportGeneratorProps) {
    
    // --- ▼▼▼ FIX: Stats are now passed directly from the controller ▼▼▼ ---
    const { 
        totalScholars, 
        uniqueHeis, 
        uniqueProvinces, 
        uniqueCourses 
    } = statistics;
    // --- ▲▲▲ END OF FIX ▲▲▲ ---

    return (
        <Card>
            <CardHeader>
                <CardTitle>TDP Statistics</CardTitle>
                <CardDescription>
                    Overview of the entire TDP dataset.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <StatCard
                        title="Total Scholars"
                        value={totalScholars.toLocaleString()}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard
                        title="Total HEIs"
                        value={uniqueHeis.toLocaleString()}
                        icon={<School className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard
                        title="Provinces"
                        value={uniqueProvinces.toLocaleString()}
                        icon={<MapPinned className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard
                        title="Courses"
                        value={uniqueCourses.toLocaleString()}
                        icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// Helper component for stat cards
function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}