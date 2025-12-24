import { AppContent } from '@/components/app-content';
import  AppSidebar  from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

export default function AppSidebarLayout({ 
    children, 
    breadcrumbs = [] // <--- Accept the prop here with a default empty array
}: { 
    children: ReactNode; 
    breadcrumbs?: BreadcrumbItem[]; 
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Pass the breadcrumbs to the header */}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <AppContent>{children}</AppContent>
            </SidebarInset>
        </SidebarProvider>
    );
}