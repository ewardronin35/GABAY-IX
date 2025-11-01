
    import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart, // ✨ 1. Import PieChart components
    Pie,
    Cell,
    Legend
} from 'recharts';
import { BadgeHelp, ListChecks, DollarSign } from "lucide-react"; // ✨ 2. Import DollarSign
import { route } from "ziggy-js";

// Define the props we get from the controller
interface DashboardPageProps extends PageProps {
    approvedCount: number;
    pendingCount: number;
    totalAmountApproved: number; // ✨ 3. Add new prop
    submissionsChartData: { date: string; Submissions: number }[];
    typeChartData: { request_type: string; count: number }[]; // ✨ 4. Add new prop
}

// ✨ 5. Define colors for the pie chart
const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard({ 
    auth, 
    approvedCount, 
    pendingCount, 
    totalAmountApproved,
    submissionsChartData,
    typeChartData 
}: DashboardPageProps) {
    return (
        <AppLayout user={auth.user!} page_title="Budget Dashboard">
            <Head title="Budget Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
                    
                    {/* Stat Card 1: Pending */}
                    <Link href={route('budget.queue')}>
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                                <BadgeHelp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingCount}</div>
                                <p className="text-xs text-muted-foreground">Click to view queue</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Stat Card 2: Approved */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Approved by You</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvedCount}</div>
                            <p className="text-xs text-muted-foreground">All-time processed requests</p>
                        </CardContent>
                    </Card>

                    {/* ✨ 6. NEW Stat Card 3: Total Amount */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount Approved</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalAmountApproved)}
                            </div>
                            <p className="text-xs text-muted-foreground">All-time total amount</p>
                        </CardContent>
                    </Card>

                    {/* ✨ 7. UPDATED Chart Card (now spans 2 columns) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Submissions (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={submissionsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="Submissions" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    {/* ✨ 8. NEW Pie Chart Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Request Types</CardTitle>
                            <CardDescription>Breakdown of all pending items.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeChartData}
                                        dataKey="count"
                                        nameKey="request_type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label={(entry) => `${entry.request_type} (${entry.count})`}
                                    >
                                        {typeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}