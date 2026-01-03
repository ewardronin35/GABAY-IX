import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { FileSpreadsheet, FileText, TrendingUp, DollarSign, GraduationCap, MapPin, Users, Lightbulb } from 'lucide-react';
import { route } from 'ziggy-js';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const GENDER_COLORS = ['#3B82F6', '#EC4899', '#9CA3AF']; // Blue for Male, Pink for Female

export function CoschoReportGenerator({ stats }: any) {
    // Data Transformations
    const heiData = stats?.by_hei?.map((i:any) => ({ name: i.hei_name, value: i.enrollments_count })) || [];
    const finData = stats?.financials?.map((i:any) => ({ name: i.year, amount: Number(i.total) })) || [];
    const sexData = stats?.by_sex?.map((i:any) => ({ name: i.sex === 'M' ? 'Male' : (i.sex === 'F' ? 'Female' : 'Unknown'), value: i.count })) || [];
    const provinceData = stats?.by_province?.map((i:any) => ({ name: i.province, value: i.count })) || [];

    const generateInsights = () => {
        if (!stats.total) return ["No data available."];
        const insights = [];
        insights.push(`Total allocation disbursed so far is **₱${Number(stats.amount).toLocaleString()}**.`);
        
        if (heiData.length > 0) {
            insights.push(`The top participating HEI is **${heiData[0].name}** with ${heiData[0].value} scholars.`);
        }
        
        if (finData.length > 0) {
            const lastYear = finData[finData.length - 1];
            insights.push(`In **${lastYear.name}**, a total of ₱${lastYear.amount.toLocaleString()} was released.`);
        }

        if (sexData.length > 0) {
            const male = sexData.find((d:any) => d.name === 'Male')?.value || 0;
            const female = sexData.find((d:any) => d.name === 'Female')?.value || 0;
            const dominant = male > female ? 'Male' : 'Female';
            insights.push(`The program is predominantly **${dominant}**.`);
        }

        return insights;
    };

    return (
        <div className="space-y-6">
            {/* 1. Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex gap-2 text-blue-900 dark:text-blue-100">
                    <TrendingUp className="text-blue-600"/> Analytics Dashboard
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(route('admin.coscho.statistics.excel'))}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600"/> Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(route('admin.coscho.statistics.pdf'))}>
                        <FileText className="h-4 w-4 mr-2 text-red-600"/> Export PDF
                    </Button>
                </div>
            </div>

            {/* 2. Automated Insights (Moved to Top) */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" /> AI-Driven Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-900 dark:text-amber-400">
                        {generateInsights().map((text, i) => (
                            <li key={i} className="flex gap-2 items-start">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span dangerouslySetInnerHTML={{ __html: text }} />
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* 3. KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Scholars</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-700 dark:text-blue-400"/>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Active Scholars</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-400"/>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.active.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-300">Total Grants Released</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-700 dark:text-amber-400"/>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-900 dark:text-amber-100">₱ {Number(stats.amount).toLocaleString()}</div></CardContent>
                </Card>
            </div>

            {/* 4. Charts Row 1: Financials & Gender */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2 shadow-sm border dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4"/> Financial Disbursement History</CardTitle>
                        <CardDescription>Total grants released per Academic Year</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    fontSize={12} 
                                    tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} 
                                />
                                <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                                <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4"/> Gender Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={sexData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {sexData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 5. Charts Row 2: Top HEIs & Provinces */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-sm border dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Top HEIs by Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={heiData} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={180} style={{ fontSize: '10px' }} tick={{fill: '#6b7280'}} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4"/> Top Provinces</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={provinceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}