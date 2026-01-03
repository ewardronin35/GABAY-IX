import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid, Line 
} from 'recharts';
import { 
    Users, Banknote, TrendingUp, Download, MapPin, 
    School, ArrowUpRight, FileText, Filter 
} from 'lucide-react';
import { route } from "ziggy-js";

interface Props {
    stats: {
        total_scholars: number;
        active_scholars: number;
        total_disbursed: number;
        scholars_by_hei: { name: string; value: number }[];
        scholars_by_status: { name: string; value: number }[];
        financial_trend: { year: string; total: number }[];
        gender_distribution: { name: string; value: number }[];
        scholars_by_province: { name: string; value: number }[];
    };
    academicYears?: any[]; // Passed for filtering
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const GENDER_COLORS = ['#3b82f6', '#ec4899', '#94a3b8']; 

export function MsrsReportGenerator({ stats, academicYears = [] }: Props) {
    const [trendFilter, setTrendFilter] = useState('all');

    // --- 1. DATA PROCESSING & PREDICTION ---
    const { predictionData, growthRate, nextYearProjection } = useMemo(() => {
        const history = stats.financial_trend || [];
        if (history.length < 2) return { predictionData: history, growthRate: 0, nextYearProjection: 0 };

        let totalGrowth = 0;
        let validPoints = 0;

        for (let i = 1; i < history.length; i++) {
            const prev = Number(history[i-1].total);
            const curr = Number(history[i].total);
            if (prev > 0) {
                totalGrowth += (curr - prev) / prev;
                validPoints++;
            }
        }
        
        const avgGrowthRate = validPoints > 0 ? totalGrowth / validPoints : 0;
        const lastYear = history[history.length - 1];
        const nextTotal = Number(lastYear.total) * (1 + avgGrowthRate);
        
        const lastYearLabel = lastYear.year.split('-')[0];
        const nextYearStart = parseInt(lastYearLabel) + 1;
        const nextYearLabel = `${nextYearStart}-${nextYearStart + 1} (Est)`;

        return {
            predictionData: [
                ...history,
                { year: nextYearLabel, total: nextTotal, isPrediction: true }
            ],
            growthRate: (avgGrowthRate * 100).toFixed(1),
            nextYearProjection: nextTotal
        };
    }, [stats.financial_trend]);

    // Filter Logic
    const filteredFinancials = useMemo(() => {
        if (trendFilter === 'all') return predictionData;
        return predictionData.filter(d => d.year === trendFilter || d.isPrediction);
    }, [trendFilter, predictionData]);

    // --- 2. AUTOMATED INTERPRETATION ---
    const topHei = stats.scholars_by_hei[0] || { name: 'None', value: 0 };
    const topProvince = stats.scholars_by_province[0] || { name: 'None', value: 0 };
    const femalePct = useMemo(() => {
        const f = stats.gender_distribution.find(g => g.name === 'F')?.value || 0;
        const total = stats.gender_distribution.reduce((acc, curr) => acc + curr.value, 0);
        return total > 0 ? ((f / total) * 100).toFixed(0) : 0;
    }, [stats.gender_distribution]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', notation: 'compact' }).format(val);

    // ✅ EXPORT HANDLER
    const handleExport = (type: 'pdf' | 'excel') => {
        // Points to the specialized statistics routes
        const routeName = type === 'pdf' 
            ? 'admin.msrs.export-statistics-pdf' 
            : 'admin.msrs.export-statistics-excel';
        
        window.location.href = route(routeName);
    };

    return (
        <div className="space-y-6 p-1 animate-in fade-in duration-500">
            
            {/* HEADER ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Executive Analytics Dashboard
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Generated on {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={trendFilter} onValueChange={setTrendFilter}>
                        <SelectTrigger className="w-[160px] h-9">
                            <Filter className="w-3 h-3 mr-2" />
                            <SelectValue placeholder="Filter Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Academic Years</SelectItem>
                            {stats.financial_trend.map((f:any) => (
                                <SelectItem key={f.year} value={f.year}>{f.year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* ✅ EXPORT BUTTONS */}
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('excel')}>
                        <Download className="h-4 w-4 text-green-600" /> Excel Report
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('pdf')}>
                        <FileText className="h-4 w-4 text-red-600" /> PDF Report
                    </Button>
                </div>
            </div>

            {/* 1. DATA INTERPRETATION CARDS */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <FileText className="h-4 w-4" /> Financial Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            Budget requirements are projected to grow by <span className="font-bold text-primary">{growthRate}%</span> next year. 
                            The estimated allocation needed is <span className="font-bold">{formatCurrency(nextYearProjection)}</span>.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <MapPin className="h-4 w-4" /> Geographic Focus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            <span className="font-bold">{topProvince.name}</span> has the highest concentration of scholars 
                            ({topProvince.value}), indicating a strong demand for medical education support in this area.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Users className="h-4 w-4" /> Demographic Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            Females represent <span className="font-bold">{femalePct}%</span> of the scholar population. 
                            The top institution, <span className="font-bold truncate max-w-[150px] inline-block align-bottom">{topHei.name}</span>, 
                            educates {(Number(topHei.value) / stats.total_scholars * 100).toFixed(0)}% of total enrollees.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* 2. CHARTS ROW 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* FINANCIAL TREND */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Financial Trend & Forecast</CardTitle>
                        <CardDescription>
                            Historical disbursement vs. projected requirement (Dotted Line).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredFinancials} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis 
                                        tickFormatter={(value) => `₱${value / 1000000}M`} 
                                        fontSize={12} tickLine={false} axisLine={false} 
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)}
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#3b82f6" 
                                        fillOpacity={1} 
                                        fill="url(#colorTotal)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* HEI DISTRIBUTION */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Institutional Distribution</CardTitle>
                        <CardDescription>Top 8 HEIs by active scholar count.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={stats.scholars_by_hei} margin={{ left: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={140} 
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. CHARTS ROW 2 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* GENDER */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gender Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.gender_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.gender_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* PROVINCES */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Provincial Distribution</CardTitle>
                        <CardDescription>Scholar count by home province.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.scholars_by_province}>
                                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                    />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={50}>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}