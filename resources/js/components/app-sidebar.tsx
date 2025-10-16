import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { route } from 'ziggy-js';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/components/ui/sidebar';
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
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;


    // Define the navigation items with correct routes and permissions
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'), // <-- Correct
            icon: LayoutGrid,
            isActive: route().current('dashboard'),
        },
        {
            title: 'Budget Track',
            href: '#', // Placeholder
            icon: Landmark,
        },
{ // 👇 2. Add the new link object here
    title: 'Travel Claims',
    href: route('superadmin.travel-claims.create'),
    icon: ClipboardList,
    permission: 'create travel claims',
    isActive: route().current('superadmin.travel-claims.*'),
  },
        {
    title: 'StuFAPs Database',
    href: route('superadmin.stufaps.index'),
    icon: Database,
    permission: 'manage stufaps database',
    isActive: route().current('superadmin.stufaps.index'),
},
        // --- Scholarship Navigation ---
        {
            title: 'Scholarship',
            icon: GraduationCap,
            href: '#', // Added required href property
            isActive: route().current('scholarships.*') || route().current('scholars.*') || route().current('applicants.*'),
            children: [
                {
                    title: 'Manage Scholarships',
                    href: '#', // Placeholder
                    icon: List, // Use a simple icon for sub-items
                    permission: 'view scholarships',
                    isActive: route().current('scholarships.*'),
                },
                {
                    title: 'Add Scholarship',
                    href: '#', // Placeholder
                    icon: PlusCircle,
                    permission: 'create scholarships',
                    isActive: route().current('scholarships.create'),
                },
                {
                    title: 'View Applicants',
                    href: route('superadmin.applications.index'), // ✨ UPDATE THIS
                    icon: FileText,
                    permission: 'view applicants',
                    isActive: route().current('superadmin.applications.index'),
                },
                {
                    title: 'Manage Scholars',
                    href: '#', // Placeholder
                    icon: UserCheck,
                    permission: 'manage scholars',
                    isActive: route().current('scholars.*'),
                },
            ],
        },
        {
            title: 'Accounting',
            href: '#', // Placeholder
            icon: PhilippinePeso,
            permission: 'manage disbursements',
        },
        {
            title: 'Reports',
            href: '#', // Placeholder
            icon: BarChart,
            permission: 'view reports', // Example permission
        },
        // --- Admin Navigation ---
        {
            title: 'Users',
            icon: Users,
            href: '#', // Added required href property
            // The parent is active if any child route is active
            isActive: route().current('superadmin.users.*') || route().current('superadmin.roles.*') || route().current('superadmin.maintenance.*'),
            permission: 'manage users', // A general permission for the whole section
            children: [
                {
                    title: 'Manage Users',
                    href: route('superadmin.users.index'),
                    icon: List, // Using a consistent icon for sub-items
                    permission: 'manage users',
                    isActive: route().current('superadmin.users.*'),
                },
                {
                    title: 'Roles & Permissions',
                    href: route('superadmin.roles.index'), // ✨ UPDATE THIS
                    icon: ShieldCheck,
                    permission: 'manage roles',
                    isActive: route().current('superadmin.roles.*'),
                },
                {
                    title: 'System Maintenance',
                    href: route('superadmin.maintenance.index'),
                    icon: ServerCog,
                    permission: 'manage maintenance',
                    isActive: route().current('superadmin.maintenance.*'), // ✨ UPDATE THIS
                },
            ],
        },
    ];
    const filteredNavItems = mainNavItems.filter(item => {
    const user = auth.user;

    // ✨ Rule 1: Super Admin sees everything
    if (user?.role === 'Super Admin') {
        return true; // This line shows everything to the Super Admin
    }

    // Rule 2: Check for role requirement
    if (item.role && item.role !== user?.role) {
        return false;
    }
    });
    // Filter the items based on the logged-in user's permissions
    const isSuperAdmin = auth.user?.role === 'Super Admin';

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
                {/* This component will now receive the 'active' prop for each item */}
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className='mt-auto' />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}