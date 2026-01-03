import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from "@/components/ui/button";
import { Loader2, FileText, BarChart as BarIcon, PieChart as PieIcon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from 'axios';
import { route } from 'ziggy-js';
import { toast } from "sonner";
import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

// Colors for the Pie Chart
const SEX_COLORS = ['#0088FE', '#FF8042']; // Blue for Male, Orange for Female

export function EstatReportGenerator() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Data transformed for charts
    const [regionData, setRegionData] = useState<any[]>([]);
    const [sexData, setSexData] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        axios.get(route('superadmin.estatskolar.statisticsData'))
            .then(res => {
                setStats(res.data);
                
                // Transform 'by_region' object into an array for the Bar Chart
                const regionChartData = Object.entries(res.data.by_region || {}).map(([name, count]) => ({
                    name,
                    count: count as number
                })).sort((a, b) => b.count - a.count); // Sort descending
                setRegionData(regionChartData);
                
                // Transform 'by_sex' object into an array for the Pie Chart
                const sexChartData = Object.entries(res.data.by_sex || {}).map(([name, value]) => ({
                    name: name === 'F' ? 'Female' : (name === 'M' ? 'Male' : 'Other'),
                    value: value as number
                }));
                setSexData(sexChartData);
            })
            .catch(() => toast.error("Failed to load statistics."))
            .finally(() => setLoading(false));
    }, []);

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        axios.post(route('superadmin.estatskolar.statisticsPdf'), {}, {
            responseType: 'blob',
            headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content },
        })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Estatskolar-Statistics-Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch(() => toast.error("Failed to generate PDF report."))
        .finally(() => setIsGenerating(false));
    };

    return (
        <Card>
            <CardHeader>
                <OfficialHeader title="E-STAT Reports" />
                <CardDescription>Statistical overview of the E-STAT Skolar data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Bar Chart for Scholars by Region */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <BarIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                                    Scholars by Region
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={regionData} layout="vertical" margin={{ left: 25 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" width={80} interval={0} fontSize={12} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Pie Chart for Scholars by Sex */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <PieIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                                    Scholars by Sex
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sexData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            fill="#8884d8"
                                            labelLine={false}
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        >
                                            {sexData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SEX_COLORS[index % SEX_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleGeneratePdf} disabled={isGenerating || loading}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        Generate PDF Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}