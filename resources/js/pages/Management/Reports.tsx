import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    BarChart, Bar, PieChart, Pie, Cell, XAxis, 
    YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { buttonVariants } from "@/components/ui/button";
import { route } from "ziggy-js";
import { FileSpreadsheet, FileText } from "lucide-react";
import { pickBy } from 'lodash';

// --- TYPES & HELPERS ---
interface ReportFilters {
    start_date?: string;
    end_date?: string;
    status?: string;
    type?: string;
}

interface ChartData {
    typeChart: { request_type: string, count: number }[];
    statusChart: { status: string, count: number }[];
    amountByTypeChart: { request_type: string, total: number }[];
}

// Props this component will receive from AllRequests.tsx
interface ReportsProps {
    charts: ChartData;
    filters: ReportFilters;
}

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
}).format(amount);

// This helper builds the URL for the export buttons
const getExportUrl = (filters: ReportFilters, format: 'pdf' | 'excel') => {
    // Use pickBy to remove any null/undefined/empty filters
    const cleanFilters = pickBy(filters);
    const params = new URLSearchParams(cleanFilters as Record<string, string>);
    // Use the new routes we created
const routeName = format === 'pdf' ? 'management.financial.reports.pdf' : 'management.financial.reports.excel';
    return route(routeName) + '?' + params.toString();
};

// --- MAIN COMPONENT ---
export default function Reports({ charts, filters }: ReportsProps) {
    return (
        <div className="space-y-6">
            {/* --- EXPORT CARD --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                    <CardDescription>
                        Download the currently filtered data as a PDF or Excel file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <a
                        href={getExportUrl(filters, 'pdf')}
                        className={buttonVariants({ variant: "outline" })}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Download PDF
                    </a>
                    <a
                        href={getExportUrl(filters, 'excel')}
                        className={buttonVariants({ variant: "outline" })}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download Excel
                    </a>
                </CardContent>
            </Card>

            {/* --- CHART CARDS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Requests by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={charts.statusChart} 
                                    dataKey="count" 
                                    nameKey="status" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={100} 
                                    label={(e: any) => `${e.status.replace(/_/g, ' ')} (${e.count})`}
                                >
                                    {charts.statusChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Total Amount (PHP) by Type</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.amountByTypeChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="request_type" />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}