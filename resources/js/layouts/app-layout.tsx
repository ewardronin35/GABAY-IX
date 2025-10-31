import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type User, PageProps } from '@/types'; 
import { type ReactNode, useEffect } from 'react'; 
import { usePage } from '@inertiajs/react'; 
import { toast, Toaster } from 'sonner'; 

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: User; 
    header?: ReactNode;
    page_title: string;
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    
    const { flash } = usePage<PageProps>().props;

    // This hook will now log to the console
    useEffect(() => {
        // ✨ 1. ADD THIS CONSOLE LOG
        // This will show us what Inertia receives on *every page load*.
        console.log("Flash message from Inertia:", flash);

        if (flash?.success) {
            // ✨ 2. ADD THIS CONSOLE LOG
            // This will prove the 'if' statement is running.
            console.log("SUCCESS TOAST CALLED:", flash.success); 
            toast.success('Success', { description: flash.success });
        }
        if (flash?.error) {
            // ✨ 3. ADD THIS CONSOLE LOG
            console.log("ERROR TOAST CALLED:", flash.error); 
            toast.error('Error', { description: flash.error });
        }
    }, [flash]); 

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster 
                richColors 
                position="top-right" 
                // We keep the z-index just in case
                style={{ zIndex: 99999 }} 
            />
        </AppLayoutTemplate>
    );
};