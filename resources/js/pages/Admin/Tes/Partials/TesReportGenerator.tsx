import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { route } from 'ziggy-js';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';

// Pre-defined colors for the pie chart for a consistent look
const PIE_CHART_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

export function TesReportGenerator() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Create refs to capture each chart element as an image
    const provinceChartRef = useRef<HTMLDivElement>(null);
    const sexChartRef = useRef<HTMLDivElement>(null);

    // Fetch the statistical data from the backend when the component mounts
    useEffect(() => {
        axios.get(route('superadmin.tes.statisticsData'))
            .then(response => {
                setStats(response.data);
            })
            .catch(error => {
                console.error("Failed to load statistics:", error);
                toast.error("Failed to load TES statistics. Please check the console.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // --- PDF CORS FIX ---
    // This function tells html-to-image to skip external font files
    const filterFonts = (node: HTMLElement): boolean => {
        if (node.tagName === 'LINK') {
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
    // --- END OF FIX ---

    // Function to handle PDF generation
    const handleGeneratePdf = async () => {
        if (!provinceChartRef.current || !sexChartRef.current) {
            toast.error("Charts are not ready to be captured.");
            return;
        }
        setIsGeneratingPdf(true);

        try {
            // Apply the font filter fix
            const options = {
                cacheBust: true, 
                backgroundColor: '#ffffff',
                filter: filterFonts
            };
            
            const [regionChartImage, sexChartImage] = await Promise.all([
                toPng(provinceChartRef.current, options),
                toPng(sexChartRef.current, options)
            ]);

            // Send the images to the backend to be embedded in the PDF
            const response = await axios.post(route('superadmin.tes.statisticsPdf'), {
                regionChartImage,
                sexChartImage,
            }, {
                responseType: 'blob', // We expect a file in response
            });

            // Create a temporary URL and trigger the browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TES-Statistics-Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded successfully!");

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF report.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    // Placeholder for Excel generation
  

    return (
        // --- 🎯 THIS IS THE LAYOUT FIX ---
        // We wrap everything in a div and make the OfficialHeader
        // a sibling to the Card, just like in your TesDatabaseGrid.tsx
        <div className="space-y-6">
            <OfficialHeader title="TES Statistics & Reports" />

            <Card>
                {/* We add padding-top to the first CardContent */}
                <CardContent className="pt-6"> 
                    {loading ? (
                        <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin mr-2"/> Loading statistics...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Chart 1: Scholars by Province */}
                            <div className="space-y-2">
                                <CardTitle className="text-lg font-medium">Scholars by Province</CardTitle>
                                <div ref={provinceChartRef} className="p-4 bg-white dark:bg-gray-950 border rounded-lg">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={stats?.scholarsPerRegion} layout="vertical" margin={{ left: 100 }}>
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="province" width={150} tick={{ fontSize: 12 }} interval={0} />
                                            <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                                            <Bar dataKey="total" fill="#3b82f6" name="Total Scholars" barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            {/* Chart 2: Distribution by Sex */}
                            <div className="space-y-2">
                                <CardTitle className="text-lg font-medium">Distribution by Sex</CardTitle>
                                <div ref={sexChartRef} className="p-4 bg-white dark:bg-gray-950 border rounded-lg">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie data={stats?.scholarsBySex} dataKey="total" nameKey="sex" cx="50%" cy="50%" outerRadius={120} label>
                                                {stats?.scholarsBySex.map((_entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Data Table 3: Scholars by Year Level */}
                            <div className="space-y-2 lg:col-span-2">
                                <CardTitle className="text-lg font-medium">Scholars by Year Level</CardTitle>
                                <div className="border rounded-lg overflow-hidden">
                                   <table className="w-full text-sm">
                                      <thead className="bg-gray-100 dark:bg-gray-800">
                                          <tr>
                                              <th className="px-4 py-2 text-left font-semibold">Year Level</th>
                                              <th className="px-4 py-2 text-left font-semibold">Total Scholars</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {stats?.scholarsByYearLevel.map((item: any) => (
                                              <tr key={item.year_level} className="border-t dark:border-gray-700">
                                                  <td className="px-4 py-2 font-medium">{item.year_level}</td>
                                                  <td className="px-4 py-2">{item.total.toLocaleString()}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                   </table>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>

                {/* This is the section for your buttons, at the bottom of the same card */}
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>
                        Create a downloadable document of the statistics above.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        
                        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                            {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                            {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}