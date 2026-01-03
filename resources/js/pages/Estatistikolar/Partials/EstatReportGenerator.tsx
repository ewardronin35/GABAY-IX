import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileSpreadsheet, FileText, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export function EstatReportGenerator({ stats }: any) {
    const typeData = stats?.by_type?.map((i:any) => ({ name: i.scholarship_type || 'N/A', value: i.count })) || [];
    const groupData = stats?.special_groups || [];
    const finData = stats?.financials?.map((i:any) => ({ name: i.year, amount: Number(i.total) })) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex gap-2"><TrendingUp className="text-emerald-600"/> Analytics</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(route('admin.estatskolar.statistics.excel'))}>
                        <FileSpreadsheet className="h-4 w-4 mr-2"/> Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(route('admin.estatskolar.statistics.pdf'))}>
                        <FileText className="h-4 w-4 mr-2"/> Export PDF
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-emerald-50 border-emerald-100">
                    <p className="text-sm font-medium text-emerald-800">Total Scholars</p>
                    <p className="text-2xl font-bold text-emerald-900">{stats?.total}</p>
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-100">
                    <p className="text-sm font-medium text-blue-800">Active</p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.active}</p>
                </Card>
                <Card className="p-4 bg-amber-50 border-amber-100">
                    <p className="text-sm font-medium text-amber-800">Disbursed</p>
                    <p className="text-2xl font-bold text-amber-900">₱{Number(stats?.amount).toLocaleString()}</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Special Equity Groups</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer>
                            <BarChart data={groupData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-sm">Scholarship Types</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                                    {typeData.map((e:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}