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
import { type NavItem, type SharedData, type PageProps } from '@/types';
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
    List,
    ShieldCheck,
    PlusCircle,
    ServerCog,
    Database,
    HandCoins,
    ClipboardList,
    ListChecks, 
    Eye,
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    // ...
];



// ✨ --- 2. ROLE-SPECIFIC NAVIGATION ---

// Items for 'Super Admin' (routes often prefixed with 'superadmin.')
const superAdminNavItems: NavItem[] = [
    {
        title: 'Travel Claims',
        href: route('superadmin.travel-claims.create'),
        icon: ClipboardList,
        isActive: route().current('superadmin.travel-claims.*'),
    },
    {           
                                        title: 'Validation',
                                        href: route('unifastrc.validation.index'),
                                        icon: ClipboardList,
                                                                                isActive: route().current('unifastrc.validation.index'),

                                    },
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
];

const rdNavItems: NavItem[] = [
    {
        title: 'Financial Tracker',
        href: route('management.financial.all-requests'),
        icon: Eye,
        isActive: route().current('management.financial.*'),
    },
];
const budgetNavItems: NavItem[] = [
    {
        title: 'Budget Dashboard',
        href: route('budget.dashboard'),
        icon: Landmark,
        isActive: route().current('budget.dashboard'),
    },
  
    // ✨ ADD THIS NEW LINK
    {
        title: 'All Requests',
        href: route('budget.all-requests'),
        icon: Files,
        isActive: route().current('budget.all-requests'),
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
// --- APP SIDEBAR COMPONENT ---
export default function AppSidebar() { // Changed from export function AppSidebar()
    // const user = auth.user; // We can use auth.user directly
const { auth, ziggy } = usePage<PageProps>().props;

    // ✨ 2. FIX: Move commonNavItems INSIDE the component, after usePage().
    const commonNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
            isActive: route().current('dashboard'),
        },
        {
            title: 'Financial Tracking',
            icon: HandCoins,
            href: '#', 
            isActive: route().current('financial.index'), 
            children: [
                {
                    title: 'All Requests',
                    href: route('financial.index'), 
                    // 'ziggy' is now correctly defined from the hook above
                    isActive: route().current('financial.index') && !ziggy.query.tab,
                },
                {
                    title: 'Submit Request',
                    href: route('financial.index', { tab: 'create_new' }), 
                    isActive: route().current('financial.index', { tab: 'create_new' }),
                },
            ],
        },
    ];
    // --- FIX: Correctly get roles and determine primary role ---
    // Ensure roles is treated as an array, even if undefined/null initially
    const userRoles = (auth.user?.roles as string[]) || []; 
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
                ...accountantNavItems,
                 ...scholarNavItems,
                 ...budgetNavItems,
                // ...unifastRcNavItems, 
                // ... potentially add others like accountantNavItems if needed
            ];
            break;
        case 'Chief':
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

        case 'Accounting': // Example of another role
            // Accountant sees common items + their own
            finalNavItems = [...finalNavItems, ...accountantNavItems];
            break;

        case 'Budget': 
            finalNavItems = [...finalNavItems, ...budgetNavItems];
            break;
        case 'Cashier': 
            finalNavItems = [...finalNavItems, ...cashierNavItems];
            break;
            
        
        
        // Add more roles as needed
        // default:
        // User has no special role, they just see common items
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