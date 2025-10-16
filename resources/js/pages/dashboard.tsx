import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types'; // Add SharedData type
import { Head, usePage} from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement, // <-- Import for Doughnut chart
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2'; // <-- Import Doughnut
import { Users, GraduationCap, DollarSign, ClipboardList } from 'lucide-react'; // <-- Icons for stats

// --- Best Practice: Register Chart.js components once, right after imports ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    


    const summaryStats = [
        {
            title: 'Total Scholars',
            value: '1,250',
            icon: <GraduationCap className='h-6 w-6 text-muted-foreground' />,
            change: '+15.2% from last month',
        },
        {
            title: 'Total Applicants',
            value: '8,420',
            icon: <Users className='h-6 w-6 text-muted-foreground' />,
            change: '+21.0% from last month',
        },
        {
            title: 'Funds Disbursed',
            value: '$2,350,900',
            icon: <DollarSign className='h-6 w-6 text-muted-foreground' />,
            change: '+8.5% from last month',
        },
        {
            title: 'Active Programs',
            value: '28',
            icon: <ClipboardList className='h-6 w-6 text-muted-foreground' />,
            change: '+2 new this month',
        },
    ];

    // --- Data for Bar Chart ---
    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Scholarship Distribution 2024',
            },
        },
    };

    const barData = {
        labels: ['Merit-based', 'Need-based', 'Athletic', 'Research', 'International'],
        datasets: [
            {
                label: 'Number of Students',
                data: [650, 450, 300, 250, 150],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Available Slots',
                data: [800, 500, 400, 300, 200],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    // --- Data for Doughnut Chart ---
    const doughnutData = {
        labels: ['Approved', 'Pending Review', 'Shortlisted', 'Rejected'],
        datasets: [
            {
                label: '# of Applicants',
                data: [1250, 4500, 2100, 570],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // --- Return the final JSX structure ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Dashboard' />

            <div className='flex-1 space-y-4 p-8 pt-6'>
                {/* --- Summary Cards Section --- */}
                
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {summaryStats.map((stat, index) => (
                        <div key={index} className='rounded-xl border bg-card text-card-foreground shadow'>
                            <div className='p-6'>
                                <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <h3 className='text-sm font-medium tracking-tight'>{stat.title}</h3>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className='text-2xl font-bold'>{stat.value}</div>
                                    <p className='text-xs text-muted-foreground'>{stat.change}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Charts Section --- */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='rounded-xl border p-4 shadow-sm'>
                        <Bar options={barOptions} data={barData} />
                    </div>
                    <div className='rounded-xl border p-4 shadow-sm'>
                        <h3 className='text-center text-lg font-semibold'>Applicant Status</h3>
                        <Doughnut data={doughnutData} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

