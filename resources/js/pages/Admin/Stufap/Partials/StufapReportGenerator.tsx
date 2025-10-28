import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export function StufapReportGenerator() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null); // This ref is now used

    useEffect(() => {
        axios.get(route('superadmin.stufap.statisticsData'))
            .then(response => {
                setStats(response.data);
            })
            .catch(() => {
                toast.error("Failed to load StuFAPs statistics.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // --- 1. ADD THIS HELPER FUNCTION ---
    // This function tells html-to-image to skip external font files,
    // which fixes the CORS security error.
    const filterFonts = (node: HTMLElement): boolean => {
        if (node.tagName === 'LINK') {
            // We cast to HTMLLinkElement to fix the TypeScript error
            const linkNode = node as HTMLLinkElement;
            if (
                linkNode.hasAttribute('href') &&
                (linkNode.href.includes('fonts.googleapis') || linkNode.href.includes('fonts.bunny'))
            ) {
                return false; // Skip this node
            }
        }
        return true; // Keep all other nodes
    };
    // --- END OF FUNCTION ---

   const handleGeneratePdf = async () => {
        if (!chartRef.current) {
            toast.error("Chart element is not ready. Please wait.");
            return;
        }
        setIsGenerating(true);
        try {
            // --- 2. ADD THE 'filter' OPTION HERE ---
            const chartImage = await toPng(chartRef.current, { 
                backgroundColor: '#ffffff',
                filter: filterFonts, // Apply the filter
            });

            const response = await axios.post(route('superadmin.stufap.statisticsPdf'), { chartImage }, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'StuFAPs-Statistics-Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded!");
        } catch (error) {
            console.error(error); // Log the full error
            toast.error("Failed to generate PDF. See console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <OfficialHeader title="StuFAPs Statistics & Reports" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="animate-spin mr-2" /> Loading statistics...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <CardTitle className="text-lg font-medium">Regional Distribution</CardTitle>
                                <CardDescription>Number of scholars per region.</CardDescription>
                                
                                {/* --- 3. ADD THE 'ref' ATTRIBUTE HERE --- */}
                                <div ref={chartRef} className="mt-4 p-4 bg-white dark:bg-gray-950 border rounded-lg h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.scholarsPerRegion}>
                                            <XAxis dataKey="region" stroke="#888888" fontSize={12} />
                                            <YAxis stroke="#888888" fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="total" fill="#3b82f6" name="Total Scholars" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>
                        Create a downloadable document of the statistics above.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGeneratePdf} disabled={isGenerating || loading}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Generate PDF'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}