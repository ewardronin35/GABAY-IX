import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from "@/components/ui/button";
import { Loader2, FileText, FileSpreadsheet, Users, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react"; // ✅ REMOVED: useRef
import axios from 'axios';
import { route } from 'ziggy-js';
import { toast } from "sonner";
import { 
    ResponsiveContainer, 
    BarChart as ReBarChart, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
// ✅ REMOVED: html2canvas import

// --- Types ---
interface Hei {
    id: number;
    hei_name: string;
}

interface ReportGeneratorProps {
    allHeis: Hei[];
    allBatches: string[];
    allAcademicYears: string[]; // ✅ ADDED
}

// --- Chart Colors & Labels ---
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const RADIAN = Math.PI / 180;

// ✅ FIX: This function now hides labels for tiny pie slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Do not render label if segment is too small
    if (percent < 0.05) {
        return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// --- Main Component ---
export function TdpReportGenerator({ allHeis, allBatches, allAcademicYears }: ReportGeneratorProps) {
    // --- State ---
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // ✅ REMOVED: Chart refs
    
    // Filter State
    const [selectedHei, setSelectedHei] = useState('all');
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('all'); // ✅ ADDED
    
    // Export State
    const [reportType, setReportType] = useState('statistics');
    const [fileFormat, setFileFormat] = useState('pdf');

    // --- Data Fetching Effect ---
    useEffect(() => {
        setLoading(true);
        axios.get(route('superadmin.tdp.statisticsData'), {
            params: {
                hei_id: selectedHei === 'all' ? null : selectedHei,
                batch: selectedBatch === 'all' ? null : selectedBatch,
                academic_year: selectedAcademicYear === 'all' ? null : selectedAcademicYear, // ✅ ADDED
            }
        })
        .then(res => setStats(res.data))
        .catch(() => toast.error("Failed to load statistics."))
        .finally(() => setLoading(false));
    }, [selectedHei, selectedBatch, selectedAcademicYear]); // ✅ ADDED dependency

    // --- Chart Data Preparation ---
    const byStatusData = stats?.by_status 
        ? Object.entries(stats.by_status).map(([name, value]) => ({ name, value })) 
        : [];
    
    const byHeiData = stats?.by_hei
        ? Object.entries(stats.by_hei).map(([name, value]) => ({ name, value }))
        : [];
    
    const byProvinceData = stats?.scholarsByProvince
        ? stats.scholarsByProvince.slice(0, 10) // Get top 10
        : [];

    // --- ✅ MODIFIED Export Handler ---
    const handleGenerate = async () => {
        setIsGenerating(true);

        const params = {
            hei_id: selectedHei === 'all' ? null : selectedHei,
            batch: selectedBatch === 'all' ? null : selectedBatch,
            academic_year: selectedAcademicYear === 'all' ? null : selectedAcademicYear,
        };

        let url = '';
        let fileName = 'TDP-Report.pdf';
        let method: 'get' | 'post' = 'get';
        let payload: any = params;

        // --- Masterlist Report ---
        if (reportType === 'masterlist') {
            url = fileFormat === 'pdf' 
                ? route('superadmin.tdp.masterlistPdf') 
                : route('superadmin.tdp.masterlistExcel');
            fileName = `TDP-Masterlist.${fileFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
            method = 'get';
        
        // --- Statistics Report ---
        } else if (reportType === 'statistics') {
            if (fileFormat === 'excel') {
                toast.error("Statistical Excel report is not yet available.");
                setIsGenerating(false);
                return;
            }
            
            url = route('superadmin.tdp.statisticsPdf');
            fileName = 'TDP-Statistics-Report.pdf';
            method = 'post';
            // ✅ REMOVED all html2canvas logic. We just send the filters.
        }
        
        // --- Axios Request ---
        axios({
            method: method,
            url: url,
            params: method === 'get' ? payload : {},
            data: method === 'post' ? payload : {},
            responseType: 'blob',
        })
        .then((response) => {
            const href = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            toast.success("Report generated successfully!");
        })
        .catch((err) => {
            console.error(err);
            toast.error("Failed to generate report.");
        })
        .finally(() => setIsGenerating(false));
    };

    // --- Render ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT SIDE: CHARTS & STATS --- */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <OfficialHeader title="Live Statistics Dashboard" />
                    </CardHeader>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <CardContent className="pt-6 space-y-8">
                            {/* --- ✅ ADDED: Summary Cards --- */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Scholars</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                    <CardContent><div className="text-2xl font-bold">{stats?.total_scholars || 0}</div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Validated</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader>
                                    <CardContent><div className="text-2xl font-bold">{stats?.by_status?.VALIDATED || 0}</div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Loader2 className="h-4 w-4 text-yellow-500" /></CardHeader>
                                    <CardContent><div className="text-2xl font-bold">{stats?.by_status?.PENDING || 0}</div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Rejected/Other</CardTitle><XCircle className="h-4 w-4 text-red-500" /></CardHeader>
                                    <CardContent><div className="text-2xl font-bold">
                                        {Object.entries(stats?.by_status || {}).reduce((acc, [key, value]) => {
                                            if (key !== 'VALIDATED' && key !== 'PENDING') {
                                                return acc + (value as number);
                                            }
                                            return acc;
                                        }, 0)}
                                    </div></CardContent>
                                </Card>
                            </div>

                            {/* --- Charts Grid --- */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle>Scholars by Province (Top 10)</CardTitle></CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <ReBarChart data={byProvinceData} layout="vertical" margin={{ left: 30 }}>
                                                <XAxis type="number" />
                                                {/* ✅ FIX: Prevents label overlapping */}
                                                <YAxis type="category" dataKey="province" fontSize={10} width={100} interval="preserveStartEnd" />
                                                <Tooltip />
                                                <Bar dataKey="total" fill="#8884d8" name="Scholars" />
                                            </ReBarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Scholars by Status</CardTitle></CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RePieChart>
                                                <Pie data={byStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                                                    {byStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <div className="xl:col-span-2">
                                    <Card>
                                        <CardHeader><CardTitle>Scholars by HEI (Top 10)</CardTitle></CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={350}>
                                                <ReBarChart data={byHeiData} margin={{ top: 5, right: 5, left: 5, bottom: 120 }}>
                                                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" fontSize={10} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#00C49F" name="Scholars" />
                                                </ReBarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* --- RIGHT SIDE: REPORT BUILDER --- */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Builder</CardTitle>
                        <CardDescription>Select filters and generate your report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* --- Filters --- */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-lg">Report Filters</Label>
                            <div className="space-y-2">
                                <Label>Filter by HEI</Label>
                                <Select value={selectedHei} onValueChange={setSelectedHei}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All HEIs</SelectItem>
                                        {allHeis.map((hei) => (
                                            <SelectItem key={hei.id} value={String(hei.id)}>{hei.hei_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Filter by Batch</Label>
                                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {allBatches.map((batch) => (
                                            <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* ✅ ADDED Academic Year Filter */}
                            <div className="space-y-2">
                                <Label>Filter by Academic Year</Label>
                                <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Academic Years</SelectItem>
                                        {allAcademicYears.map((ay) => (
                                            <SelectItem key={ay} value={ay}>{ay}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* --- Export Options --- */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-lg">Export Options</Label>
                            <div className="space-y-2">
                                <Label>1. Report Type</Label>
                                <RadioGroup value={reportType} onValueChange={setReportType} defaultValue="statistics">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="statistics" id="r1" /><Label htmlFor="r1">Statistical Report</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="masterlist" id="r2" /><Label htmlFor="r2">Database Masterlist</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>2. File Format</Label>
                                <RadioGroup value={fileFormat} onValueChange={setFileFormat} defaultValue="pdf">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="pdf" id="r3" /><Label htmlFor="r3">PDF (.pdf)</Label></div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="excel" id="r4" disabled={reportType === 'statistics'} />
                                        <Label htmlFor="r4" className={reportType === 'statistics' ? 'text-muted-foreground' : ''}>Excel (.xlsx)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <Separator />

                        {/* --- Generate Button --- */}
                        <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
                            {isGenerating ? (<Loader2 className="animate-spin mr-2" />) : (fileFormat === 'pdf' ? <FileText className="w-4 h-4 mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />)}
                            {isGenerating ? 'Generating...' : `Generate ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} ${fileFormat.toUpperCase()}`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}