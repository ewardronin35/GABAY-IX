import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Users, CheckCircle, PieChart } from "lucide-react";
import { useState, useEffect } from "react";
import axios from 'axios';
import { route } from 'ziggy-js';
import { toast } from "sonner";

export function TdpReportGenerator() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        axios.get(route('superadmin.tdp.statisticsData'))
            .then(res => setStats(res.data))
            .catch(() => toast.error("Failed to load statistics."))
            .finally(() => setLoading(false));
    }, []);

   const handleGeneratePdf = () => {
    setIsGenerating(true);
    axios.post(
        route('superadmin.tdp.statisticsPdf'), 
        {}, 
        { 
            responseType: 'blob',
            // ▼▼▼ ADD THIS HEADERS OBJECT ▼▼▼
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
            },
        }
    )
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tdp-statistics-report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    })
    .catch(() => toast.error("Failed to generate PDF report."))
    .finally(() => setIsGenerating(false));
};

    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin mr-2" /> Loading Statistics...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <OfficialHeader title="TDP Statistics & Reports" />
                <CardDescription>An overview of the Tulong Dunong Program data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Scholars</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats?.total_scholars || 0}</div></CardContent>
                    </Card>
                    {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
                        <Card key={status}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{status}</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">{count as number}</div></CardContent>
                        </Card>
                    ))}
                </div>

                {stats?.by_hei && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top HEIs by Scholar Count</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(stats.by_hei).map(([hei, count]) => (
                                    <li key={hei} className="flex justify-between">
                                        <span>{hei}</span>
                                        <span className="font-semibold">{count as number}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                        Generate PDF Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}