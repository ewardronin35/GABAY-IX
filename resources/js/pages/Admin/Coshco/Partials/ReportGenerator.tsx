import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { route } from 'ziggy-js';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
interface ReportGeneratorProps {
    scholars: any[]; // You can replace 'any' with a more specific Scholar type if you have one
}
export const ReportGenerator = ({ scholars }: ReportGeneratorProps) => {    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null); // Ref to capture the chart element

    // Fetch statistical data on component mount
    useEffect(() => {
        axios.get(route('superadmin.reports.statisticsData'))
            .then(response => {
                setStats(response.data);
                setLoading(false);
            })
            .catch(error => {
                toast.error("Failed to load statistics.");
                setLoading(false);
            });
    }, []);

    const handleGeneratePdf = async () => {
        if (!chartRef.current) {
            toast.error("Chart is not ready.");
            return;
        }
        setGenerating(true);

        try {
            // 1. Capture the chart as a Base64 PNG image
            const chartImage = await toPng(chartRef.current, { cacheBust: true });

            // 2. Send the image to the backend to generate the PDF
            const response = await axios.post(route('superadmin.reports.statisticsPdf'), {
                chartImage: chartImage // The Base64 string
            }, {
                responseType: 'blob', // Important: expect a file back
            });

            // 3. Trigger the browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Scholarship-Statistics-Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded successfully!");

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF report.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <p>Loading statistics...</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Regional Distribution of Scholars</CardTitle>
                    <CardDescription>
                        A visual breakdown of scholars across different regions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* This div is what we will capture as an image */}
                    <div ref={chartRef} className="p-4 bg-white dark:bg-gray-900">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={stats?.scholarsPerRegion}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="region" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Generate PDF Report</CardTitle>
                    <CardDescription>
                        Download the statistics and chart above as a formatted PDF document.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGeneratePdf} disabled={generating}>
                        {generating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {generating ? 'Generating...' : 'Generate and Download PDF'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}