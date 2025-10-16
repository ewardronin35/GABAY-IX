import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type User } from '@/types'; // ✨ ADD: Import the User type
import { type ReactNode } from 'react';
import { PropsWithChildren } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: User; // ✨ ADD: The user prop is expected by authenticated layouts
    header?: ReactNode; // ✨ ADD: The header prop you are passing
      page_title: string; // 👈 Add this line

}
export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
