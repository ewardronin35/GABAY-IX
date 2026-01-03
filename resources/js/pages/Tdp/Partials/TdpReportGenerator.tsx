import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, School, MapPinned, GraduationCap, FileDown, X, Loader2, PieChart as PieIcon, BarChart3, TrendingUp, BarChart4, AlignLeft, Map, CreditCard, Calendar, BookOpen } from "lucide-react";import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from "recharts";
import type { TdpPageProps } from "../Index";

type LocationItem = { id: number; name: string; region_id?: number; province_id?: number };

type ReportGeneratorProps = {
    statistics: TdpPageProps["statistics"];
    filters?: TdpPageProps["filters"]; 
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: { id: number; hei_name: string }[];
    courses: { id: number; course_name: string }[];
    
    regions?: LocationItem[];
    provinces?: LocationItem[];
    districts?: LocationItem[];
    cities?: LocationItem[];

    interpretation?: string;
    graphs?: {
        sexDistribution: { name: string; value: number }[];
        yearLevelDistribution: { name: string; value: number }[];
        statusDistribution: { name: string; value: number }[];
        topHeis: { name: string; value: number }[];
        regionDistribution?: { name: string; value: number }[];
        provinceDistribution?: { name: string; value: number }[];
        courseDistribution?: { name: string; value: number }[]; // ✅ Added Type
    };
};

// Expanded Colors for more charts
const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f43f5e'];

export function TdpReportGenerator({ 
    statistics, 
    filters = {}, 
    academicYears = [], 
    semesters = [], 
    batches = [], 
    heiList = [], 
    courses = [],
    regions = [],
    provinces = [],
    districts = [],
    cities = [],
    interpretation,
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
    }), [isDarkMode]);

    const hasData = (data: any) => (Array.isArray(data) ? data : Object.values(data || {})).length > 0;
    const getChartData = (data: any) => Array.isArray(data) ? data : Object.values(data || {});

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value, tab: 'reports' };
        
        if (key === 'region_id') { newFilters.province_id = ''; newFilters.city_id = ''; newFilters.district_id = ''; }
        if (key === 'province_id') { newFilters.city_id = ''; newFilters.district_id = ''; }

        router.get(route('admin.tdp.index'), newFilters, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        router.get(route('admin.tdp.index'), { tab: 'reports' }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExporting(true);
const routeName = type === 'pdf' ? 'admin.tdp.export-statistics-pdf' : 'admin.tdp.export-statistics-excel';        // @ts-ignore
        window.location.href = route(routeName, filters);
        setTimeout(() => setIsExporting(false), 3000);
    };

    const filteredProvinces = useMemo(() => filters.region_id ? provinces.filter(p => String(p.region_id) === String(filters.region_id)) : provinces, [filters.region_id, provinces]);
    const filteredCities = useMemo(() => filters.province_id ? cities.filter(c => String(c.province_id) === String(filters.province_id)) : cities, [filters.province_id, cities]);
    const filteredDistricts = useMemo(() => filters.province_id ? districts.filter(d => String(d.province_id) === String(filters.province_id)) : districts, [filters.province_id, districts]);

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
                            <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting} size="sm">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4 text-green-600" />} Excel
                            </Button>
                            <Button variant="default" onClick={() => handleExport('pdf')} disabled={isExporting} size="sm">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4" />} PDF Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <SimpleSelect placeholder="Academic Year" value={filters?.academic_year} options={academicYears.map(ay => ({ value: ay, label: ay }))} onChange={(val) => handleFilterChange('academic_year', val)} />
                        <SimpleSelect placeholder="Semester" value={filters?.semester} options={semesters.map(s => ({ value: String(s.id), label: s.name }))} onChange={(val) => handleFilterChange('semester', val)} />
                        <SimpleSelect placeholder="Batch" value={filters?.batch_no} options={batches.map(b => ({ value: String(b), label: `Batch ${b}` }))} onChange={(val) => handleFilterChange('batch_no', val)} />
                        <SimpleSelect placeholder="School (HEI)" value={filters?.hei_id} options={heiList.map(h => ({ value: String(h.id), label: h.hei_name }))} onChange={(val) => handleFilterChange('hei_id', val)} />
                        <SimpleSelect placeholder="Course" value={filters?.course_id} options={courses.map(c => ({ value: String(c.id), label: c.course_name }))} onChange={(val) => handleFilterChange('course_id', val)} />
                        
                        <SimpleSelect placeholder="Region" value={filters?.region_id} options={regions.map(r => ({ value: String(r.id), label: r.name }))} onChange={(val) => handleFilterChange('region_id', val)} />
                        <SimpleSelect placeholder="Province" value={filters?.province_id} options={filteredProvinces.map(p => ({ value: String(p.id), label: p.name }))} onChange={(val) => handleFilterChange('province_id', val)} />
                        <SimpleSelect placeholder="City/Mun" value={filters?.city_id} options={filteredCities.map(c => ({ value: String(c.id), label: c.name }))} onChange={(val) => handleFilterChange('city_id', val)} />
                        <SimpleSelect placeholder="District" value={filters?.district_id} options={filteredDistricts.map(d => ({ value: String(d.id), label: d.name }))} onChange={(val) => handleFilterChange('district_id', val)} />
                        
                        <Button variant="ghost" onClick={clearFilters} className="border border-dashed text-muted-foreground hover:text-red-600">
                            <X className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- DATA INTERPRETATION --- */}
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <AlignLeft className="h-4 w-4" /> Data Analysis & Interpretation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                        {interpretation || "No data available for interpretation based on current filters."}
                    </p>
                </CardContent>
            </Card>

            {/* --- KPIS --- */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatCard title="Total Scholars" value={totalScholars.toLocaleString()} icon={<Users className="h-5 w-5 text-blue-600" />} color="border-l-blue-500" />
                <StatCard title="Active Schools" value={uniqueHeis.toLocaleString()} icon={<School className="h-5 w-5 text-orange-600" />} color="border-l-orange-500" />
                <StatCard title="Provinces" value={uniqueProvinces.toLocaleString()} icon={<MapPinned className="h-5 w-5 text-green-600" />} color="border-l-green-500" />
                <StatCard title="Courses" value={uniqueCourses.toLocaleString()} icon={<GraduationCap className="h-5 w-5 text-purple-600" />} color="border-l-purple-500" />
            </div>

            {/* --- CHARTS ROW 1 --- */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                
                {/* 1. Region Distribution */}
                <ChartContainer title="Scholars by Region" icon={<Map className="h-4 w-4" />}>
                    {hasData(graphs?.regionDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.regionDistribution)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
                                <XAxis type="number" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                {/* ✅ FIXED: Increased width to 120 to show full region names */}
                                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10, fill: chartTheme.text}} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<Map />} message="No region data" />}
                </ChartContainer>

                {/* 2. Top Provinces */}
                <ChartContainer title="Top 10 Provinces" icon={<MapPinned className="h-4 w-4" />}>
                    {hasData(graphs?.provinceDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.provinceDistribution)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" stroke={chartTheme.text} fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} name="Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<MapPinned />} message="No province data" />}
                </ChartContainer>
            </div>
{/* --- ROW 2: COURSES & SCHOOLS (NEW) --- */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                
                {/* 3. Top Courses (ADDED) */}
                <ChartContainer title="Top 10 Courses" icon={<BookOpen className="h-4 w-4" />}>
                    {hasData(graphs?.courseDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.courseDistribution)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
                                <XAxis type="number" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 9, fill: chartTheme.text}} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<BookOpen />} message="No course data" />}
                </ChartContainer>

                {/* 4. Top Schools */}
                <ChartContainer title="Top 5 Schools" icon={<School className="h-4 w-4" />}>
                    {hasData(graphs?.topHeis) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.topHeis)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" tick={{fontSize: 9, fill: chartTheme.text}} interval={0} angle={-30} textAnchor="end" height={80} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} name="Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<School />} message="No school data" />}
                </ChartContainer>
            </div>
            {/* --- CHARTS ROW 2 --- */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                
                {/* 3. Gender Demographics */}
                <ChartContainer title="Gender Demographics" icon={<PieIcon className="h-4 w-4" />}>
                    {hasData(graphs?.sexDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={getChartData(graphs?.sexDistribution)} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke={isDarkMode ? "#1f2937" : "#fff"}>
                                    {getChartData(graphs?.sexDistribution).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<PieIcon />} message="No gender data" />}
                </ChartContainer>

              <ChartContainer title="Year Level Distribution" icon={<Calendar className="h-4 w-4" />}>
                    {hasData(graphs?.yearLevelDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.yearLevelDistribution)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={chartTheme.text} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={60} name="Scholars" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<Calendar />} message="No year level data" />}
                </ChartContainer>
            </div>

            {/* --- CHARTS ROW 3 (NEW) --- */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                
               
                {/* 6. Payment Status Distribution */}
                <ChartContainer title="Payment Status" icon={<CreditCard className="h-4 w-4" />}>
                    {hasData(graphs?.statusDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={getChartData(graphs?.statusDistribution)} 
                                    cx="50%" cy="50%" 
                                    innerRadius={0} // Full Pie
                                    outerRadius={85} 
                                    paddingAngle={2} 
                                    dataKey="value" 
                                    stroke={isDarkMode ? "#1f2937" : "#fff"}
                                >
                                    {getChartData(graphs?.statusDistribution).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<CreditCard />} message="No status data" />}
                </ChartContainer>
            </div>
        </div>
    );
}

// ... (Helpers remain the same: ChartContainer, CustomTooltip, EmptyState, StatCard, SimpleSelect)
function ChartContainer({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">{icon} {title}</CardTitle>
            </CardHeader>
            <CardContent><div className="h-[300px] w-full">{children}</div></CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: theme.tooltipBg, borderColor: theme.tooltipBorder }}>
                <p className="font-bold mb-1 text-foreground">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></span>
                    <span className="text-muted-foreground">{payload[0].name}:</span>
                    <span className="font-mono font-bold text-foreground">{payload[0].value.toLocaleString()}</span>
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
            <CardContent><div className="text-2xl font-bold dark:text-gray-100">{value}</div></CardContent>
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