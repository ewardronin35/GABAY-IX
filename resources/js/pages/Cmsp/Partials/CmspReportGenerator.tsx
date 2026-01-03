import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
    TrendingUp, Users, School, GraduationCap, 
    FileSpreadsheet, FileText 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function CmspReportGenerator({ stats }: any) {
    // --- 1. DATA MAPPING ---
    const total = stats?.total || 0;
    const amount = stats?.amount || 0;
    
    // Financial Data Mapping (Matches Controller: 'year' -> 'name', 'total' -> 'amount')
    const finData = stats?.financials?.map((i:any) => ({ 
        name: i.year || 'Unknown', 
        amount: Number(i.total) || 0 
    })) || [];

    const genderData = stats?.by_gender?.map((i:any) => ({ name: i.sex || 'Unknown', value: i.count })) || [];
    const heiTypeData = stats?.by_hei_type?.map((i:any) => ({ name: i.hei_type || 'Uncategorized', value: i.count })) || [];
    const topHeis = stats?.top_heis?.map((i:any) => ({ name: i.hei_name, value: i.count })) || [];

    // Analytics Logic
    const topSchool = topHeis.length > 0 ? topHeis[0].name : 'N/A';
    const dominantGender = genderData.sort((a:any,b:any) => b.value - a.value)[0]?.name || 'N/A';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- HEADER & ACTIONS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-amber-600" />
                        Analytics & Reports
                    </h2>
                    <p className="text-sm text-muted-foreground">Real-time statistics for CHED Merit Scholarship Program</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 text-green-700 border-green-200 hover:bg-green-50 dark:border-green-900 dark:text-green-400"
                        onClick={() => window.open(route('admin.cmsp.export-statistics-excel'), '_blank')}
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Export Excel
                    </Button>
                    <Button 
                        variant="outline" 
                        className="gap-2 text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                        onClick={() => window.open(route('admin.cmsp.export-statistics-pdf'), '_blank')}
                    >
                        <FileText className="h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* 1. ANALYTICS SUMMARY BANNER */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">Total Scholars</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{total.toLocaleString()}</span>
                                <span className="text-sm text-zinc-500">students</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Mostly <span className="font-semibold text-amber-700">{dominantGender}</span>.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">Total Disbursement</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">₱{Number(amount).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Across <span className="font-semibold">{finData.length}</span> academic years.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">Top Institution</p>
                            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-1 truncate" title={topSchool}>
                                {topSchool}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. CHARTS ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Gender Distribution */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" /> Scholar Gender
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={genderData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {genderData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* HEI Type Distribution */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <School className="h-4 w-4 text-muted-foreground" /> HEI Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={heiTypeData} 
                                    cx="50%" cy="50%" 
                                    outerRadius={80} 
                                    dataKey="value" 
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {heiTypeData.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ✅ FIXED: Funding Trend Chart */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" /> Funding Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] relative">
                        {finData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={finData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tick={{fill: '#6b7280'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        formatter={(val:number) => [`₱${val.toLocaleString()}`, 'Amount']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorAmt)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No financial data available yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 3. CHARTS ROW 2 - WIDE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top 5 Schools */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" /> Top 5 Institutions by Scholar Count
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topHeis} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={180} 
                                    fontSize={11} 
                                    tickLine={false} 
                                    tick={{fill: '#374151'}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '8px', border: 'none'}}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#4f46e5" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={24} 
                                    label={{ position: 'right', fill: '#6b7280', fontSize: 11 }} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}