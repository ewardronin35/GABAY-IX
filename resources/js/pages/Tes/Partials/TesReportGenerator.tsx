import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Users, School, MapPinned, GraduationCap, FileDown, X, Loader2, 
    PieChart as PieIcon, BarChart3, FileCheck2, FileSpreadsheet,
    Lightbulb, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LabelList
} from "recharts";

// --- 1. TYPE DEFINITIONS ---
interface TesPageProps {
    statistics: {
        totalScholars: number;
        uniqueHeis: number;
        uniqueProvinces: number;
        uniqueCourses: number;
    };
    filters?: Record<string, any>;
    academicYears: string[];
    semesters: { id: number; name: string }[];
    batches: string[];
    heiList: { id: number; hei_name: string }[];
    courses: { id: number; course_name: string }[];
    regions: { id: number; name: string }[];
    provinces: { id: number; name: string; region_id: number }[];
    districts: { id: number; name: string; province_id: number }[];
    cities: { id: number; name: string; province_id: number }[];
    graphs?: {
        sexDistribution: { name: string; value: number }[];
        yearLevelDistribution: { name: string; value: number }[];
        statusDistribution: { name: string; value: number }[];
        topHeis: { name: string; value: number }[];
        regionDistribution?: { name: string; value: number }[];
        provinceDistribution?: { name: string; value: number }[];
        complianceDistribution?: { name: string; value: number }[];
    };
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const COMPLIANCE_COLORS: Record<string, string> = {
    'Validated & Uploaded': '#22c55e',       
    'Validated (Missing File)': '#eab308',   
    'Pending (Uploaded)': '#3b82f6',         
    'Incomplete': '#94a3b8',                 
};

export function TesReportGenerator({ 
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
    graphs 
}: TesPageProps) {
    
    const { totalScholars, uniqueHeis, uniqueProvinces, uniqueCourses } = statistics;
    const [isExporting, setIsExporting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showInterpretation, setShowInterpretation] = useState(true);

    // --- LOGIC: Dependent Dropdowns ---
    const filteredProvinces = useMemo(() => {
        if (!filters.region_id) return provinces;
        return provinces.filter(p => String(p.region_id) === String(filters.region_id));
    }, [filters.region_id, provinces]);

    const filteredCities = useMemo(() => {
        if (!filters.province_id) return cities;
        return cities.filter(c => String(c.province_id) === String(filters.province_id));
    }, [filters.province_id, cities]);

    useEffect(() => {
        const checkDark = () => document.documentElement.classList.contains('dark');
        setIsDarkMode(checkDark());
        const observer = new MutationObserver(() => setIsDarkMode(checkDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const chartTheme = useMemo(() => ({
        text: isDarkMode ? "#9ca3af" : "#4b5563", 
        grid: isDarkMode ? "#374151" : "#e5e7eb", 
        tooltipBg: isDarkMode ? "#1f2937" : "#ffffff",
        tooltipBorder: isDarkMode ? "#374151" : "#e2e8f0",
        tooltipText: isDarkMode ? "#f3f4f6" : "#1f2937",
    }), [isDarkMode]);

    const hasData = (data: any) => (Array.isArray(data) ? data : Object.values(data || {})).length > 0;
    const getChartData = (data: any) => Array.isArray(data) ? data : Object.values(data || {});

    // --- LOGIC: Interpretation Generator ---
    const interpretation = useMemo(() => {
        if (totalScholars === 0) return "No data available for analysis.";

        const getTop = (arr: { name: string, value: number }[] | undefined) => {
            if (!arr || arr.length === 0) return null;
            return arr.reduce((prev, current) => (prev.value > current.value) ? prev : current);
        };

        const topSex = getTop(graphs?.sexDistribution);
        const topProv = getTop(graphs?.provinceDistribution);
        const topHei = getTop(graphs?.topHeis);
        const topStatus = getTop(graphs?.statusDistribution);
        const validatedCount = graphs?.complianceDistribution?.find(i => i.name.includes('Validated'))?.value || 0;
        const validationRate = ((validatedCount / totalScholars) * 100).toFixed(1);

        let text = `Based on the current dataset of ${totalScholars.toLocaleString()} scholars: `;
        
        if (topSex) text += `The demographic is predominantly ${topSex.name} (${((topSex.value / totalScholars) * 100).toFixed(1)}%). `;
        if (topProv) text += `Geographically, ${topProv.name} has the highest concentration of beneficiaries. `;
        if (topHei) text += `The leading institution is ${topHei.name}. `;
        if (topStatus) text += `In terms of payments, the majority are currently marked as '${topStatus.name}'. `;
        
        text += `Overall validation compliance stands at approximately ${validationRate}%.`;

        return text;
    }, [statistics, graphs]);

    // --- HANDLERS ---
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (key === 'region_id') { newFilters.province_id = ''; newFilters.city_id = ''; newFilters.district_id = ''; }
        if (key === 'province_id') { newFilters.city_id = ''; newFilters.district_id = ''; }
        
        router.get(route('admin.tes.index'), { ...newFilters, tab: 'reports' }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        router.get(route('admin.tes.index'), { tab: 'reports' }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = (type: 'pdf' | 'excel-stats' | 'excel-masterlist') => {
        setIsExporting(true);
        let routeName = '';
        if (type === 'pdf') routeName = 'admin.tes.export-statistics-pdf';
        if (type === 'excel-stats') routeName = 'admin.tes.export-statistics-excel';
        if (type === 'excel-masterlist') routeName = 'admin.tes.export-excel';

        // @ts-ignore
        window.location.href = route(routeName, filters);
        setTimeout(() => setIsExporting(false), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* --- SECTION A: HEADER & FILTERS --- */}
            <Card className="border-l-4 border-l-blue-600 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                TES Analytics & Compliance
                            </CardTitle>
                            <CardDescription>Real-time data visualization, analysis, and report generation.</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <Button variant="outline" onClick={() => handleExport('excel-stats')} disabled={isExporting} size="sm" className="gap-2 border-green-200 hover:bg-green-50 text-green-700 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20">
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileSpreadsheet className="h-4 w-4" />} 
                                Stats Excel
                            </Button>
                            <Button variant="default" onClick={() => handleExport('pdf')} disabled={isExporting} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileDown className="h-4 w-4" />} 
                                Report PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <SimpleSelect placeholder="Academic Year" value={filters.academic_year} options={academicYears.map(ay => ({ value: ay, label: ay }))} onChange={(val) => handleFilterChange('academic_year', val)} />
                        <SimpleSelect placeholder="Semester" value={filters.semester} options={semesters.map(s => ({ value: String(s.id), label: s.name }))} onChange={(val) => handleFilterChange('semester', val)} />
                        <SimpleSelect placeholder="Batch" value={filters.batch_no} options={batches.map(b => ({ value: String(b), label: `Batch ${b}` }))} onChange={(val) => handleFilterChange('batch_no', val)} />
                        <SimpleSelect placeholder="School (HEI)" value={filters.hei_id} options={heiList.map(h => ({ value: String(h.id), label: h.hei_name }))} onChange={(val) => handleFilterChange('hei_id', val)} />
                        <SimpleSelect placeholder="Course" value={filters.course_id} options={courses.map(c => ({ value: String(c.id), label: c.course_name }))} onChange={(val) => handleFilterChange('course_id', val)} />
                        
                        <SimpleSelect placeholder="Region" value={filters.region_id} options={regions.map(r => ({ value: String(r.id), label: r.name }))} onChange={(val) => handleFilterChange('region_id', val)} />
                        <SimpleSelect placeholder="Province" value={filters.province_id} options={filteredProvinces.map(p => ({ value: String(p.id), label: p.name }))} onChange={(val) => handleFilterChange('province_id', val)} />
                        
                        <Button variant="ghost" onClick={clearFilters} className="w-full border border-dashed text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <X className="mr-2 h-4 w-4" /> Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- SECTION B: KEY METRICS --- */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatCard title="Total Scholars" value={totalScholars?.toLocaleString() || "0"} icon={<Users className="h-5 w-5 text-blue-600" />} color="border-l-blue-500" />
                <StatCard title="Active Schools" value={uniqueHeis?.toLocaleString() || "0"} icon={<School className="h-5 w-5 text-orange-600" />} color="border-l-orange-500" />
                <StatCard title="Provinces" value={uniqueProvinces?.toLocaleString() || "0"} icon={<MapPinned className="h-5 w-5 text-green-600" />} color="border-l-green-500" />
                <StatCard title="Courses" value={uniqueCourses?.toLocaleString() || "0"} icon={<GraduationCap className="h-5 w-5 text-purple-600" />} color="border-l-purple-500" />
            </div>

            {/* --- SECTION C: DATA INTERPRETATION --- */}
            {totalScholars > 0 && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setShowInterpretation(!showInterpretation)}>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Executive Data Analysis</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {showInterpretation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                    {showInterpretation && (
                        <p className="mt-2 text-sm text-blue-800 dark:text-blue-200 leading-relaxed animate-in fade-in slide-in-from-top-2">
                            {interpretation}
                        </p>
                    )}
                </div>
            )}

            {/* --- SECTION D: CHARTS GRID --- */}
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Compliance & Demographics
            </h3>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                
                {/* 1. COMPLIANCE CHART */}
                <ChartContainer title="Validation Status" icon={<FileCheck2 className="h-4 w-4" />}>
                     {hasData(graphs?.complianceDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getChartData(graphs?.complianceDistribution)}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {getChartData(graphs?.complianceDistribution).map((entry: any, index: number) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COMPLIANCE_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '11px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<FileCheck2 />} message="No compliance data" />}
                </ChartContainer>

                {/* 2. PROVINCE DISTRIBUTION */}
                <ChartContainer title="Top Provinces" icon={<MapPinned className="h-4 w-4" />}>
                    {hasData(graphs?.provinceDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.provinceDistribution)} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 10, fill: chartTheme.text}} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} name="Scholars">
                                    <LabelList dataKey="value" position="right" fill={chartTheme.text} fontSize={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<MapPinned />} message="No province data" />}
                </ChartContainer>

                {/* 3. PAYMENT STATUS (New) */}
                <ChartContainer title="Payment Status" icon={<FileSpreadsheet className="h-4 w-4" />}>
                    {hasData(graphs?.statusDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.statusDistribution)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: chartTheme.text}} interval={0} height={30} />
                                <YAxis stroke={chartTheme.text} fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30}>
                                    <LabelList dataKey="value" position="top" fill={chartTheme.text} fontSize={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<FileSpreadsheet />} message="No status data" />}
                </ChartContainer>

                {/* 4. GENDER */}
                <ChartContainer title="Gender Demographics" icon={<Users className="h-4 w-4" />}>
                    {hasData(graphs?.sexDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={getChartData(graphs?.sexDistribution)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {getChartData(graphs?.sexDistribution).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<Users />} message="No gender data" />}
                </ChartContainer>

                {/* 5. YEAR LEVEL (New) */}
                <ChartContainer title="Year Level Dist." icon={<GraduationCap className="h-4 w-4" />}>
                    {hasData(graphs?.yearLevelDistribution) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.yearLevelDistribution)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: chartTheme.text}} />
                                <YAxis stroke={chartTheme.text} fontSize={10} hide />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={25}>
                                    <LabelList dataKey="value" position="top" fill={chartTheme.text} fontSize={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<GraduationCap />} message="No year level data" />}
                </ChartContainer>

                {/* 6. TOP SCHOOLS */}
                <ChartContainer title="Top 5 Schools" icon={<School className="h-4 w-4" />}>
                    {hasData(graphs?.topHeis) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(graphs?.topHeis)} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 9, fill: chartTheme.text}} interval={0} />
                                <Tooltip content={<CustomTooltip theme={chartTheme} />} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} name="Scholars">
                                    <LabelList dataKey="value" position="right" fill={chartTheme.text} fontSize={10} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon={<School />} message="No school data" />}
                </ChartContainer>

            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---
function ChartContainer({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2 pt-4 px-4 border-b dark:border-gray-700">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
                <div className="h-[220px] w-full">{children}</div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded shadow-lg border text-xs bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 z-50">
                <p className="font-bold mb-1 opacity-70">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="block w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></span>
                    <span className="capitalize">{payload[0].name}:</span>
                    <span className="font-mono font-bold">{payload[0].value.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50/50 dark:bg-gray-900/50 rounded-md m-2">
            <div className="opacity-20 [&>svg]:h-8 [&>svg]:w-8 mb-2">{icon}</div>
            <span className="text-xs font-medium">{message}</span>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <Card className={`border-l-4 ${color} shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">{title}</CardTitle>
                <div className="group-hover:scale-110 transition-transform duration-300">{icon}</div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold dark:text-gray-100">{value}</div>
            </CardContent>
        </Card>
    );
}

function SimpleSelect({ value, onChange, options, placeholder }: { value?: string, onChange: (val: string) => void, options: { value: string, label: string }[], placeholder: string }) {
    return (
        <div className="relative">
            <select 
                aria-label={placeholder} 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100 truncate" 
                value={value || ""} 
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" className="dark:bg-gray-950 text-gray-500">{placeholder}</option>
                {options.map((opt) => <option key={opt.value} value={opt.value} className="dark:bg-gray-950 text-black dark:text-white">{opt.label}</option>)}
            </select>
        </div>
    );
}