import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, School, MapPinned, GraduationCap, FileDown, X, Loader2, PieChart as PieIcon, BarChart3, TrendingUp, BarChart4 } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LabelList
} from "recharts";
import type { TdpPageProps } from "../Index";

type ReportGeneratorProps = {
    statistics: TdpPageProps["statistics"];
    filters?: TdpPageProps["filters"]; 
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: { id: number; hei_name: string }[];
    courses: { id: number; course_name: string }[];
    graphs?: {
        sexDistribution: { name: string; value: number }[];
        yearLevelDistribution: { name: string; value: number }[];
        statusDistribution: { name: string; value: number }[];
        topHeis: { name: string; value: number }[];
    };
};

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

export function TdpReportGenerator({ 
    statistics, 
    filters = {}, 
    academicYears = [], 
    semesters = [], 
    batches = [], 
    heiList = [], 
    courses = [],
    graphs 
}: ReportGeneratorProps) {
    
    const { totalScholars, uniqueHeis, uniqueProvinces, uniqueCourses } = statistics;
    const [isExporting, setIsExporting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDark = () => document.documentElement.classList.contains('dark');
        setIsDarkMode(checkDark());
        const observer = new MutationObserver(() => setIsDarkMode(checkDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const chartTheme = useMemo(() => ({
        text: isDarkMode ? "#9ca3af" : "#6b7280", 
        grid: isDarkMode ? "#374151" : "#e5e7eb", 
        tooltipBg: isDarkMode ? "#1f2937" : "#ffffff",
        tooltipBorder: isDarkMode ? "#374151" : "#e2e8f0",
        tooltipText: isDarkMode ? "#f3f4f6" : "#1f2937",
    }), [isDarkMode]);

    const hasData = (data: any) => (Array.isArray(data) ? data : Object.values(data || {})).length > 0;
    const getChartData = (data: any) => Array.isArray(data) ? data : Object.values(data || {});

    const handleFilterChange = (key: string, value: string) => {
        router.get(route('superadmin.tdp.index'), { ...filters, [key]: value, tab: 'reports' }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        router.get(route('superadmin.tdp.index'), { tab: 'reports' }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        const routeName = type === 'pdf' ? 'superadmin.tdp.export-pdf' : 'superadmin.tdp.export-excel';
        // @ts-ignore
        window.location.href = route(routeName, filters);
        setTimeout(() => setIsExporting(false), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* --- FILTER BAR --- */}
            <Card className="border-l-4 border-l-blue-600 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Executive Analytics Dashboard
                            </CardTitle>
                            <CardDescription>Real-time data visualization and export center.</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting} size="sm" className="dark:border-gray-600">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4 text-green-600" />} Excel
                            </Button>
                            <Button variant="default" onClick={() => handleExport('pdf')} disabled={isExporting} size="sm">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4" />} PDF Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SimpleSelect placeholder="Academic Year" value={filters?.academic_year} options={academicYears.map(ay => ({ value: ay, label: ay }))} onChange={(val) => handleFilterChange('academic_year', val)} />
                        <SimpleSelect placeholder="Semester" value={filters?.semester} options={semesters.map(s => ({ value: String(s.id), label: s.name }))} onChange={(val) => handleFilterChange('semester', val)} />
                        <SimpleSelect placeholder="Batch" value={filters?.batch_no} options={batches.map(b => ({ value: String(b), label: `Batch ${b}` }))} onChange={(val) => handleFilterChange('batch_no', val)} />
                        <SimpleSelect placeholder="School (HEI)" value={filters?.hei_id} options={heiList.map(h => ({ value: String(h.id), label: h.hei_name }))} onChange={(val) => handleFilterChange('hei_id', val)} />
                        <SimpleSelect placeholder="Course" value={filters?.course_id} options={courses.map(c => ({ value: String(c.id), label: c.course_name }))} onChange={(val) => handleFilterChange('course_id', val)} />
                        <Button variant="ghost" onClick={clearFilters} className="w-full border border-dashed text-muted-foreground hover:text-red-600">
                            <X className="mr-2 h-4 w-4" /> Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- KPIS --- */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatCard title="Total Scholars" value={totalScholars.toLocaleString()} icon={<Users className="h-5 w-5 text-blue-600" />} color="border-l-blue-500" />
                <StatCard title="Active Schools" value={uniqueHeis.toLocaleString()} icon={<School className="h-5 w-5 text-orange-600" />} color="border-l-orange-500" />
                <StatCard title="Provinces" value={uniqueProvinces.toLocaleString()} icon={<MapPinned className="h-5 w-5 text-green-600" />} color="border-l-green-500" />
                <StatCard title="Courses" value={uniqueCourses.toLocaleString()} icon={<GraduationCap className="h-5 w-5 text-purple-600" />} color="border-l-purple-500" />
            </div>

            {/* --- CHARTS --- */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                
                {/* 1. Gender Distribution */}
                <ChartContainer title="Gender Demographics" icon={<PieIcon className="h-4 w-4" />}>
                    {hasData(graphs?.sexDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={getChartData(graphs?.sexDistribution)}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke={isDarkMode ? "#1f2937" : "#fff"}
                                    isAnimationActive={false}
                                >
                                    {getChartData(graphs?.sexDistribution).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-xl dark:fill-gray-100">
                                    {totalScholars}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<PieIcon />} message="No gender data" />}
                </ChartContainer>

                {/* 2. Payment Status */}
                <ChartContainer title="Payment Status Overview" icon={<TrendingUp className="h-4 w-4" />}>
                    {hasData(graphs?.statusDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={getChartData(graphs?.statusDistribution)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
                                <XAxis type="number" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: chartTheme.text}} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} cursor={{fill: isDarkMode ? '#374151' : '#f3f4f6', opacity: 0.4}} />
                                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={24} name="Scholars" isAnimationActive={false}>
                                     <LabelList dataKey="value" position="right" fill={chartTheme.text} fontSize={11} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<BarChart3 />} message="No status data" />}
                </ChartContainer>

                {/* 3. Year Level Distribution (NEW) */}
                <ChartContainer title="Year Level Distribution" icon={<BarChart4 className="h-4 w-4" />}>
                    {hasData(graphs?.yearLevelDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={getChartData(graphs?.yearLevelDistribution)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} cursor={{fill: isDarkMode ? '#374151' : '#f3f4f6', opacity: 0.4}} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} name="Scholars" isAnimationActive={false}>
                                    <LabelList dataKey="value" position="top" fill={chartTheme.text} fontSize={11} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<BarChart4 />} message="No year level data" />}
                </ChartContainer>

                {/* 4. Top Schools */}
                <ChartContainer title="Top 5 Schools" icon={<School className="h-4 w-4" />}>
                    {hasData(graphs?.topHeis) ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={getChartData(graphs?.topHeis)} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: chartTheme.text}} interval={0} angle={-15} textAnchor="end" height={60} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} cursor={{fill: isDarkMode ? '#374151' : '#f3f4f6', opacity: 0.4}} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} name="Scholars" isAnimationActive={false}>
                                    {getChartData(graphs?.topHeis).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<School />} message="No school data" />}
                </ChartContainer>
            </div>
        </div>
    );
}

// Helper Components
function ChartContainer({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">{children}</div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder, color: theme.tooltipText }}>
                <p className="font-bold mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></span>
                    <span>{payload[0].name}:</span>
                    <span className="font-mono font-bold">{payload[0].value.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50/50 dark:bg-gray-900/50 rounded-md border border-dashed border-slate-200 dark:border-gray-700 m-4">
            <div className="opacity-20 [&>svg]:h-10 [&>svg]:w-10">{icon}</div>
            <span className="text-xs mt-2 font-medium">{message}</span>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <Card className={`border-l-4 ${color} shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold dark:text-gray-100">{value}</div>
            </CardContent>
        </Card>
    );
}

function SimpleSelect({ value, onChange, options, placeholder }: { value?: string, onChange: (val: string) => void, options: { value: string, label: string }[], placeholder: string }) {
    return (
        <div className="relative">
            <select aria-label={placeholder} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100" value={value || ""} onChange={(e) => onChange(e.target.value)}>
                <option value="" className="dark:bg-gray-950">{placeholder}</option>
                {options.map((opt) => <option key={opt.value} value={opt.value} className="dark:bg-gray-950">{opt.label}</option>)}
            </select>
        </div>
    );
}