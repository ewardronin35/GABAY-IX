import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { route } from 'ziggy-js';
import { 
    Plane, Users, Wallet, FileText, AlertCircle, 
    CheckCircle2, Clock, Activity, TrendingUp, Wifi, 
    Server, AlertTriangle, UserPlus, FileCheck, MoreHorizontal, ArrowRight, Coins
} from 'lucide-react';
import { 
    BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';

// --- UTILITY COMPONENTS ---
const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, style, ...props }) => (
    <div className={className} style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', ...style } as React.CSSProperties} {...props}>
        {children}
    </div>
);

// --- TYPES ---
interface DashboardProps {
    auth: any;
    role: string;
    myTravels?: any[];
    stats?: { label: string; value: string | number; icon: string; trend?: string; color?: string }[];
    charts?: any[];
    activeUsers?: any[];
    trafficData?: any[]; 
    budgetData?: any[];  
}

// --- ICON MAPPER ---
const iconMap: any = {
    'plane': Plane,
    'users': Users,
    'wallet': Wallet,
    'file': FileText,
    'alert': AlertCircle,
    'check-circle': CheckCircle2,
    'clock': Clock,
    'activity': Activity,
    'wifi': Wifi,
    'coins': Coins,
};

// --- MOCK DATA (Fallbacks) ---
const mockTrafficData = [
    { name: 'Mon', visits: 400, requests: 240, errors: 12 },
    { name: 'Tue', visits: 300, requests: 139, errors: 5 },
    { name: 'Wed', visits: 500, requests: 980, errors: 23 },
    { name: 'Thu', visits: 278, requests: 390, errors: 8 },
    { name: 'Fri', visits: 189, requests: 480, errors: 2 },
    { name: 'Sat', visits: 239, requests: 380, errors: 1 },
    { name: 'Sun', visits: 349, requests: 430, errors: 4 },
];

const mockBudgetData = [
    { name: 'Utilized', value: 65, fill: '#ef4444' }, 
    { name: 'Remaining', value: 25, fill: '#22c55e' }, 
    { name: 'Pending', value: 10, fill: '#f59e0b' },   
];

const mockPendingApprovals = [
    { id: 101, name: 'Juan Dela Cruz', type: 'Travel Order', amount: '₱5,200', date: '2023-10-24' },
    { id: 102, name: 'Maria Clara', type: 'Liquidation', amount: '₱1,500', date: '2023-10-23' },
    { id: 103, name: 'Jose Rizal', type: 'Travel Order', amount: '₱12,000', date: '2023-10-22' },
];

const mockApplications = [
    { name: 'Jan', applicants: 65 },
    { name: 'Feb', applicants: 59 },
    { name: 'Mar', applicants: 80 },
    { name: 'Apr', applicants: 81 },
    { name: 'May', applicants: 56 },
    { name: 'Jun', applicants: 55 },
    { name: 'Jul', applicants: 40 },
];

export default function Dashboard({ 
    auth, 
    role, 
    myTravels = [], 
    stats = [], 
    charts = [], 
    activeUsers = [],
    trafficData = mockTrafficData,
    budgetData = mockBudgetData 
}: DashboardProps) {
    const user = auth.user;
    
    // Role Logic
    const isSuperAdmin = role === 'Super Admin';
    const isRD = role === 'Regional Director' || role === 'RD' || role === 'Chief Education Program Specialist';
    const isScholarship = role.includes('Scholarship') || role === 'UniFastRC';

    // Fallback Display Users
    const displayUsers = activeUsers && activeUsers.length > 0 ? activeUsers : [
        { id: 1, name: 'Jane Doe', email: 'jane@ched.gov.ph', last_seen: 'Online now' },
        { id: 2, name: 'John Smith', email: 'john@ched.gov.ph', last_seen: '2m ago' },
        { id: 3, name: 'Maria Clara', email: 'maria@ched.gov.ph', last_seen: '5m ago' },
    ];

    return (
        <AuthenticatedLayout user={user} page_title="Dashboard">
            <Head title="Dashboard" />

            <div className="p-4 sm:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
                
                {/* 1. WELCOME HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            Good Morning, {user.name.split(' ')[0]} <span className="text-2xl animate-pulse">👋</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Here is your daily overview & system report.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="text-right hidden sm:block">
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Current Role</p>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{role}</p>
                        </div>
                        <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
                        <div className="text-sm font-medium text-zinc-500 bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                           <Clock className="w-4 h-4" />
                           {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* 2. QUICK ACTIONS (Universal) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <Link href={route('travel-orders.create')} className="contents">
                        <Card className="hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                                    <Plane className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                                </div>
                                <span className="text-xs font-semibold">New Travel Order</span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="#" className="contents">
                        <Card className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                                    <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                                </div>
                                <span className="text-xs font-semibold">File Liquidation</span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="#" className="contents">
                         <Card className="hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                                    <Activity className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                                </div>
                                <span className="text-xs font-semibold">Track Status</span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="#" className="contents">
                        <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                    <UserPlus className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                                </div>
                                <span className="text-xs font-semibold">Profile Settings</span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* 3. MAIN STATS GRID */}
                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => {
                            const Icon = iconMap[stat.icon] || Activity;
                            return (
                                <Card key={index} className="shadow-sm border-l-4" style={{ borderLeftColor: stat.color || '#6366f1' }}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        {stat.trend && (
                                            <p className="text-xs text-emerald-600 flex items-center mt-1">
                                                <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* --- ROLE SPECIFIC CONTENT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* A. SUPER ADMIN SECTION */}
                    {isSuperAdmin && (
                        <>
                            {/* System Traffic */}
                            <Card className="lg:col-span-2 shadow-md">
                                <CardHeader>
                                    <CardTitle>System Traffic & Load</CardTitle>
                                    <CardDescription>Request volume vs server errors</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trafficData}>
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorVisits)" />
                                            <Area type="monotone" dataKey="errors" stroke="#ef4444" fillOpacity={0.1} fill="#ef4444" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Server Health & Active Users */}
                            <div className="space-y-4 lg:col-span-1">
                                {/* Server Health */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Server className="w-4 h-4 text-indigo-500" /> Server Health
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>CPU Usage</span>
                                                <span className="font-bold text-emerald-600">12%</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[12%]"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Memory (RAM)</span>
                                                <span className="font-bold text-amber-600">64%</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 w-[64%]"></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-time Active Users (REPLACES Logs for Super Admin) */}
                                <Card className="flex-1 shadow-md">
                                    <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Users
                                            </CardTitle>
                                            <Badge variant="outline" className="text-[10px] font-normal">
                                                {activeUsers ? activeUsers.length : 0} Online
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-[220px] px-4">
                                            <div className="space-y-3 py-3">
                                                {activeUsers && activeUsers.length > 0 ? (
                                                    activeUsers.map((u: any) => (
                                                        <div key={u.id} className="flex items-center gap-3 group">
                                                            <div className="relative">
                                                                <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
                                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${u.name}&background=random`} />
                                                                    <AvatarFallback className="text-[10px]">{u.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 transition-colors">
                                                                    {u.name}
                                                                </p>
                                                                <p className="text-[10px] text-zinc-500 truncate">{u.email}</p>
                                                            </div>
                                                            <div className="text-[10px] text-zinc-400 whitespace-nowrap">
                                                                {u.last_seen}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-8">
                                                        <Users className="w-6 h-6 mb-1 opacity-20" />
                                                        <p className="text-xs">No users active.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                    <CardFooter className="py-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                                        <Link href={route('superadmin.users.index')} className="w-full text-center text-[10px] font-medium text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wide">
                                            Manage All Users
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </>
                    )}

                    {/* B. REGIONAL DIRECTOR SECTION */}
                    {isRD && (
                        <>
                             {/* Budget & Utilization */}
                             <Card className="lg:col-span-1 shadow-md">
                                <CardHeader>
                                    <CardTitle>Budget Overview</CardTitle>
                                    <CardDescription>SAA Fund Status</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[250px] relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={budgetData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {budgetData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                                        <span className="text-2xl font-bold">65%</span>
                                        <p className="text-xs text-muted-foreground">Used</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-3 text-xs text-center text-muted-foreground">
                                    Total Allocation: ₱ 2,500,000.00
                                </CardFooter>
                            </Card>

                            {/* Pending Approvals List */}
                            <Card className="lg:col-span-1 shadow-md border-l-4 border-l-amber-500">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" /> Pending Approvals
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">3 New</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[280px] px-6">
                                        <div className="space-y-4 py-2">
                                            {mockPendingApprovals.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                                                            <FileText className="w-4 h-4 text-zinc-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">{item.type} • {item.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-indigo-600">{item.amount}</span>
                                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 hover:bg-emerald-100">Approve</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="p-2 border-t">
                                    <button className="w-full text-xs text-center py-1 text-zinc-500 hover:text-indigo-600">View All Pending</button>
                                </CardFooter>
                            </Card>

                             {/* Approval Trends */}
                             <Card className="lg:col-span-1 shadow-md">
                                <CardHeader>
                                    <CardTitle>Approval Velocity</CardTitle>
                                    <CardDescription>Weekly processing rate</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trafficData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="visits" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="requests" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* C. SCHOLARSHIP SECTION */}
                    {isScholarship && (
                        <>
                            {/* Application Trends */}
                            <Card className="lg:col-span-2 shadow-md">
                                <CardHeader>
                                    <CardTitle>Application Volume</CardTitle>
                                    <CardDescription>New scholarship applications per month</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockApplications}>
                                            <defs>
                                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="applicants" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApps)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Program Distribution */}
                            {charts && charts.length > 0 && (
                                <Card className="lg:col-span-1 shadow-md">
                                    <CardHeader>
                                        <CardTitle>By Program</CardTitle>
                                        <CardDescription>Grantee Distribution</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10}} />
                                                <Tooltip />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {charts.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill || '#4f46e5'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                             {/* Recent Applicants */}
                             <Card className="lg:col-span-3 shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">Recent Applicants</CardTitle>
                                    <Link href="#" className="text-xs text-indigo-600 hover:underline">View Database</Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=Student+${i}&background=random`} />
                                                    <AvatarFallback>S{i}</AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-semibold truncate">Student Applicant {i}</p>
                                                    <p className="text-xs text-muted-foreground truncate">BS Info Tech • TES</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* D. MY TRAVEL REQUESTS (Universal) */}
                    <Card className="lg:col-span-3 shadow-md border-t-4 border-t-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Plane className="h-5 w-5 text-indigo-500" /> My Travel History
                                </CardTitle>
                                <CardDescription>Track the status of your submitted travel orders</CardDescription>
                            </div>
                            <Link href={route('travel-orders.index')} className="text-sm font-medium text-indigo-600 hover:underline flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                                View Full History <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                             <div className="border-t border-zinc-100 dark:border-zinc-800">
                                <ScrollArea className="h-[250px] px-6">
                                    <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {myTravels && myTravels.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                                                <Plane className="w-12 h-12 mb-2 opacity-10 text-indigo-500" />
                                                <p className="text-sm font-medium">No recent travel requests.</p>
                                                <Link href={route('travel-orders.create')} className="mt-2 text-xs text-indigo-500 hover:underline">
                                                    Create your first request
                                                </Link>
                                            </div>
                                        ) : (
                                            myTravels.map((req: any) => (
                                                <div key={req.id} className="flex items-center justify-between py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors px-2 -mx-2 rounded-md">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${
                                                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                                                            req.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                        }`}>
                                                            {req.status === 'Approved' ? <CheckCircle2 className="w-5 h-5" /> : 
                                                             req.status === 'Rejected' ? <AlertCircle className="w-5 h-5" /> : 
                                                             <Clock className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{req.destination}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <span className="font-mono bg-zinc-100 px-1 rounded text-zinc-500">{req.ref_no}</span>
                                                                <span>•</span>
                                                                <span>{req.date}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-xs font-medium text-zinc-500">Purpose</p>
                                                            <p className="text-xs text-zinc-800 dark:text-zinc-300 max-w-[150px] truncate">{req.purpose || 'Official Business'}</p>
                                                        </div>
                                                        <MoreHorizontal className="w-4 h-4 text-zinc-400 cursor-pointer" />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Users Widget (Hidden for Super Admin as they have the full list) */}
                    {!isSuperAdmin && activeUsers && activeUsers.length > 0 && (
                         <Card className="lg:col-span-3 shadow-none border-dashed bg-transparent">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Wifi className="w-3 h-3" /> Team Online
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {displayUsers.slice(0, 8).map((u) => (
                                        <Avatar key={u.id} className="inline-block h-8 w-8 ring-2 ring-white dark:ring-zinc-950">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${u.name}`} />
                                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {displayUsers.length > 8 && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-950 bg-zinc-100 text-xs font-medium text-zinc-500">
                                            +{displayUsers.length - 8}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}