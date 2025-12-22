import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { route } from 'ziggy-js';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type PageProps } from '@/types';
type NavItem = {
    title: string;
    href?: string;
    icon?: any;
    isActive?: boolean;
    children?: NavItem[];
};
import { Link, usePage } from '@inertiajs/react';

import {
    BookOpen,
    HandCoinsIcon,
    Folder,
    LayoutGrid,
    Files,
    Users,
    GraduationCap,
    FileText,
    PhilippinePeso,
    UserCheck,
    BarChart,
    Landmark,
    Plane,
    List,
    ShieldCheck,
    PlusCircle,
    ServerCog,
    Database,
    HandCoins,
    FileCheck,    ClipboardList,
    ListChecks, 
    Eye,
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    
];



// ✨ --- 2. ROLE-SPECIFIC NAVIGATION ---
const unifastRcNavItems: NavItem[] = [
  
    {
        title: 'UniFast Database',
        icon: Database,
        href: '#',
        children: [
            {
                title: 'TES',
                href: route('superadmin.tes.index'),
                isActive: route().current('superadmin.tes.index'),
            },
            {
                title: 'TDP',
                href: route('superadmin.tdp.index'),
                isActive: route().current('superadmin.tdp.index'),
            },
        ],
    },
];
// Items for 'Super Admin' (routes often prefixed with 'superadmin.')
const superAdminNavItems: NavItem[] = [
  
    {
        title: 'Scholarship Database',
        icon: Database,
        href: '#',
        children: [
            {
                title: 'COSCHO',
                href: route('superadmin.coshco.index'),
                isActive: route().current('superadmin.coshco.index'),
            },
            {
                title: 'STUFAP',
                href: route('superadmin.stufaps.index'),
                isActive: route().current('superadmin.stufaps.index'),
            },
              {
                title: 'MSRS',
                href: route('superadmin.stufaps.index'),
                isActive: route().current('superadmin.stufaps.index'),
            },
            
            {
                title: 'CSMP',
                href: route('superadmin.stufaps.index'),
                isActive: route().current('superadmin.stufaps.index'),
            },
            {
                title: 'Estatskolar',
                href: route('superadmin.estatskolar.index'),
                isActive: route().current('superadmin.estatskolar.index'),
            },
        ],
    },
    {
        title: 'UniFast Database',
        icon: Database,
        href: '#',
        children: [
           {
                title: 'TES',
                href: route('superadmin.tes.index'),
                isActive: route().current('superadmin.tes.index'),
            },
            {
                title: 'TDP',
                href: route('superadmin.tdp.index'),
                isActive: route().current('superadmin.tdp.index'),
            },
        ],

    },
    
    {
        title: 'Scholarship',
        icon: GraduationCap,
        href: '#',
        isActive:
            route().current('scholarships.*') ||
            route().current('scholars.*') ||
            route().current('applicants.*'),
        children: [
            {
                title: 'Manage Scholarships',
                href: route('superadmin.applications.index'),
                icon: List,
                isActive: route().current('scholarships.*'),
            },
            {
                title: 'Add Scholarship',
                href: '#', // Placeholder
                icon: PlusCircle,
                isActive: route().current('scholarships.create'),
            },
            {
                title: 'View Applicants',
                href: route('superadmin.applications.index'),
                icon: FileText,
                isActive: route().current('superadmin.applications.index'),
            },
            {
                title: 'Manage Scholars',
                href: '#', // Placeholder
                icon: UserCheck,
                isActive: route().current('scholars.*'),
            },
        ],
    },
    
    {
        title: 'Users',
        icon: Users,
        href: '#',
        isActive:
            route().current('superadmin.users.*') ||
            route().current('superadmin.roles.*') ||
            route().current('superadmin.maintenance.*'),
        children: [
            {
                title: 'Manage Users',
                href: route('superadmin.users.index'),
                icon: List,
                isActive: route().current('superadmin.users.*'),
            },
            {
                title: 'Roles & Permissions',
                href: route('superadmin.roles.index'),
                icon: ShieldCheck,
                isActive: route().current('superadmin.roles.*'),
            },
            {
                title: 'System Maintenance',
                href: route('superadmin.maintenance.index'),
                icon: ServerCog,
                isActive: route().current('superadmin.maintenance.*'),
            },
        ],
    },
];

// Items for 'Scholar' (routes often prefixed with 'scholar.')
const scholarNavItems: NavItem[] = [
    // ⬇️ **ADD THIS NEW ITEM**
    {
        title: 'Apply for Scholarship',
        href: route('scholar.csmp.create'), // Points to the 'create' method
        icon: PlusCircle,
        isActive: route().current('scholar.csmp.create'),
    },
    {
        title: 'My Submissions',
        href: route('scholar.csmp.my-applications'), // This one is correct
        icon: FileText, //
        isActive: route().current('scholar.csmp.my-applications'), //
    },
];

// Items for 'Accountant' (or other finance roles)
const accountantNavItems: NavItem[] = [
    {
        title: 'My Queue',
        href: route('accounting.all-requests', { status: 'pending_accounting' }),
        icon: Landmark,
    },
    {
        title: 'Requests & Reports',
        href: route('accounting.all-requests'),
        icon: PhilippinePeso,
    },
    // The "Reports" link is removed because it is now a tab
    // inside the "Requests & Reports" page.
];
const chiefNavItems: NavItem[] = [
    {
        title: 'Financial Tracker',
        href: route('management.financial.all-requests'),
        icon: Eye,
        isActive: route().current('management.financial.*'),
    },
  {
        title: 'Travel Approvals',
        // ✨ POINTS TO NEW APPROVALS ROUTE
        href: route('travel-orders.approvals'), 
        icon: FileCheck,
        isActive: route().current('travel-orders.approvals'),
    },
];



const rdNavItems: NavItem[] = [
    {
        title: 'Financial Tracker',
        href: route('management.financial.all-requests'),
        icon: Eye,
        isActive: route().current('management.financial.*'),
    },
   {
        title: 'Travel Approvals',
        // ✨ POINTS TO NEW APPROVALS ROUTE
        href: route('travel-orders.approvals'), 
        icon: FileCheck,
        isActive: route().current('travel-orders.approvals'),
    },
];
const budgetNavItems: NavItem[] = [
    {
        title: 'Budget Dashboard',
        href: route('budget.dashboard'),
        icon: Landmark,
        isActive: route().current('budget.dashboard'),
    },
  
    
    {
        title: 'Travel Approvals',
        // ✨ POINTS TO NEW APPROVALS ROUTE
        href: route('travel-orders.approvals'), 
        icon: FileCheck,
        isActive: route().current('travel-orders.approvals'),
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'My Queue',
        href: route('cashier.all-requests', { status: 'pending_cashier' }),
        icon: Landmark,
    },
    {
        title: 'Requests & Reports',
        href: route('cashier.all-requests'),
        icon: PhilippinePeso,
    },
    // The "Reports" link is removed because it is now a tab
    // inside the "Requests & Reports" page.
];

    export default function AppSidebar() { // Changed from export function AppSidebar()
    // const user = auth.user; // We can use auth.user directly
    const { auth, ziggy } = usePage<PageProps>().props;
    
    const commonNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
            isActive: route().current('dashboard'),
        },
        {
    title: 'Financial Track',
    icon: HandCoins,
    href: route('financial.index'), // Points directly to the page now
    isActive: route().current('financial.index'), // Highlights when on this page
    },
        {
        title: 'Travel Management',
        icon: Plane,
        href: '#', 
        // Keep the parent menu open if any of the child routes are active
        isActive: route().current('travel-orders.*') || route().current('travel-claims.*'),
        children: [
            {
                title: 'My Requests', // The Dashboard/List View
                href: route('travel-orders.index'),
                isActive: route().current('travel-orders.index'),
            },
            {
                title: 'Create Request', // The 3-Step Wizard
                href: route('travel-orders.create'),
                isActive: route().current('travel-orders.create'),
            },
            {
                title: 'Create Travel Reimbursements', // Reimbursements
                href: route('travel-claims.create'), 
                isActive: route().current('travel-claims.*'),
            },
                ],
        },
    
    
    ];
    // --- FIX: Correctly get roles and determine primary role ---
    // Ensure roles is treated as an array, even if undefined/null initially
    const rawRoles = auth.user?.roles as unknown;
    const userRoles: string[] = Array.isArray(rawRoles)
        ? (rawRoles as any[]).map((r) => (typeof r === 'string' ? r : r?.name ?? ''))
        : [];

    // Use the first role for the switch logic, handle cases where roles might be empty
    const primaryRole = userRoles.length > 0 ? userRoles[0] : null; 

   

    let finalNavItems: NavItem[] = [...commonNavItems]; // Start with common items

    // Add items based on the user's role
    switch (primaryRole) { // Use the derived primaryRole
        case 'Super Admin':
            // Example: Super Admin sees common + their own + UniFast items
            finalNavItems = [
                ...finalNavItems,
                ...superAdminNavItems,
             
                
                
            ];
            break;
        case 'Chief Education Program Specialist':
            // Chief sees common items + their own
            finalNavItems = [...finalNavItems, ...chiefNavItems];
            break;
        case 'RD':
            // RD sees common items + their own
            finalNavItems = [...finalNavItems, ...rdNavItems];
            break;

        case 'UniFast RC':
            console.log("Matched Role: UniFast RC"); // Debug
            // finalNavItems = [...finalNavItems, ...unifastRcNavItems];
            break;

        case 'Scholar':
            // Scholar sees common items + their own
            finalNavItems = [...finalNavItems, ...scholarNavItems];
            break;

        case 'Accounting': 

            finalNavItems = [...finalNavItems, ...accountantNavItems];
            break;

        case 'Budget': 
            finalNavItems = [...finalNavItems, ...budgetNavItems];
            break;
        case 'Cashier': 
            finalNavItems = [...finalNavItems, ...cashierNavItems];
            break;
            
        
        
        
    }

    return (
        <Sidebar collapsible='icon' variant='inset'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg' asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* This component just renders the final, combined list */}
                <NavMain items={finalNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className='mt-auto' />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}