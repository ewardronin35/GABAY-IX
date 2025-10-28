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
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import {
    BookOpen,
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
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    // ...
];

// ✨ --- 1. COMMON NAVIGATION ---
// Items that EVERY logged-in user can see.
const commonNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
        isActive: route().current('dashboard'),
    },
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
                title: 'TES',
                href: route('superadmin.tes.index'),
                isActive: route().current('superadmin.tes.index'),
            },
            {
                title: 'TDP',
                href: route('superadmin.tdp.index'),
                isActive: route().current('superadmin.tdp.index'),
            },
            {
                title: 'Estatskolar',
                href: route('superadmin.estatskolar.index'),
                isActive: route().current('superadmin.estatskolar.index'),
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
        title: 'Budget Track',
        href: '#', // Placeholder
        icon: Landmark,
    },
    {
        title: 'Accounting',
        href: '#', // Placeholder
        icon: PhilippinePeso,
    },
    {
        title: 'Reports',
        href: '#', // Placeholder
        icon: BarChart,
    },
];

// --- APP SIDEBAR COMPONENT ---
export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // ✨ --- 3. BUILD THE FINAL NAV LIST ---
    // Start with the items everyone can see
    let finalNavItems: NavItem[] = [...commonNavItems];

    // Add items based on the user's role
    switch (user?.role) {
        case 'Super Admin':
            // Super Admin sees ALL lists combined
            finalNavItems = [
                ...finalNavItems,
                ...superAdminNavItems,
                ...accountantNavItems,
                ...scholarNavItems,
            ];
            break;

        case 'Scholar':
            // Scholar sees common items + their own
            finalNavItems = [...finalNavItems, ...scholarNavItems];
            break;

        case 'Accountant': // Example of another role
            // Accountant sees common items + their own
            finalNavItems = [...finalNavItems, ...accountantNavItems];
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