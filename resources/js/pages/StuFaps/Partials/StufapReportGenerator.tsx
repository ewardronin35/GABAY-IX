import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, Users, PieChart as PieIcon, BarChart3, Lightbulb } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { route } from 'ziggy-js';

export function StuFapsReportGenerator({ stats }: any) {
    // --- SAFE GUARDS ---
    const totalScholars = stats?.total || 0;
    const totalAmount = stats?.amount || 0;
    
    // Transform Data for Charts
    const sexData = stats?.by_sex?.map((item: any) => ({ name: item.sex || 'Unknown', value: item.count })) || [];
    const codeData = stats?.by_code?.map((item: any) => ({ name: item.scholarship_type, value: item.count })) || [];
    const financialData = stats?.financials_by_year?.map((item: any) => ({ 
        name: item.year, 
        amount: Number(item.total) 
    })) || [];

    // Colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // --- DATA INTERPRETER LOGIC ---
    const generateInsights = () => {
        // ✅ FIX: Return an array containing the string, not just the string itself
        if (!totalScholars) return ["No data available for analysis."];

        const insights = [];
        
        // Sex Dominance
        const male = sexData.find((d: any) => d.name === 'M')?.value || 0;
        const female = sexData.find((d: any) => d.name === 'F')?.value || 0;
        
        if (totalScholars > 0) {
            const domSex = female > male ? 'Female' : 'Male';
            const sexPct = Math.round((Math.max(male, female) / totalScholars) * 100);
            insights.push(`The scholarship program is predominantly **${domSex}** (${sexPct}%).`);
        }

        // Top Scholarship Code
        if (codeData.length > 0) {
            const topCode = codeData.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current);
            insights.push(`The most common scholarship type is **${topCode.name}**, accounting for ${topCode.value} scholars.`);
        }

        // Financial Trend
        if (financialData.length > 1) {
            const last = financialData[financialData.length - 1];
            const prev = financialData[financialData.length - 2];
            const trend = last.amount > prev.amount ? 'increased' : 'decreased';
            insights.push(`Grant disbursements have **${trend}** in the latest academic year (${last.name}).`);
        }

        return insights;
    };

    return (
        <div className="space-y-6">
            {/* 1. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-medium">Total Scholars</div>
                            <div className="text-2xl font-bold">{totalScholars.toLocaleString()}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm md:col-span-2">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400"/>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-medium">Total Grant Disbursement</div>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-500">
                                ₱{Number(totalAmount).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
               <Card className="bg-white dark:bg-zinc-950 border-none shadow-sm p-4 flex flex-col justify-center gap-2">
                    <Button 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700 w-full" 
                        onClick={() => window.open(route('admin.stufaps.export.statistics.excel'), '_blank')}
                    >
                        <FileText className="mr-2 h-4 w-4"/> Excel Report
                    </Button>
                    <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 w-full" 
                        onClick={() => window.open(route('admin.stufaps.export.statistics.pdf'), '_blank')}
                    >
                        <Download className="mr-2 h-4 w-4"/> PDF Report
                    </Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Charts Section */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-muted-foreground"/> 
                            Financial Disbursement by Academic Year
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(value) => `₱${value/1000}k`} />
                                    <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#0054A6" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Demographics Pie */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-muted-foreground"/> 
                            Scholarship Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={codeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {codeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {codeData.slice(0, 4).map((entry: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-muted-foreground">{entry.name}</span>
                                    </div>
                                    <span className="font-bold">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. Data Interpreter (AI-like Summary) */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
                        <Lightbulb className="h-5 w-5" />
                        Data Analytics Interpreter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-400 list-disc list-inside">
                        {/* ✅ .map() will now work because generateInsights always returns an array */}
                        {generateInsights().map((insight, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: insight }} />
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}