import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type User, PageProps } from '@/types'; 
import { type ReactNode, useEffect } from 'react'; 
import { usePage, router } from '@inertiajs/react'; // Import router
import { toast, Toaster } from 'sonner'; 

// Import Echo and Pusher
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Echo
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    // Make sure to set VITE_PUSHER_APP_KEY and VITE_PUSHER_APP_CLUSTER in your .env file
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true
    });
}


interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: User; // This is the 'user' prop passed in
    header?: ReactNode;
    page_title: string;
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    
    // Get 'flash' and 'auth' from usePage
    const { flash, auth } = usePage<PageProps>().props;
    // Get the full user object, which includes roles
    const user = auth.user; 

    // --- Existing Flash Message Hook (Unchanged) ---
    useEffect(() => {
        if (flash?.success) {
            toast.success('Success', { description: flash.success });
        }
        if (flash?.error) {
            toast.error('Error', { description: flash.error });
        }
    }, [flash]); 

    // --- NEW Real-time Event Listener Hook ---
    useEffect(() => {
        // Check if user and user.roles exist
        if (user && window.Echo && user.roles) {
            
            // 1. Listen on the user's personal channel (e.g., "User.1")
            window.Echo.private(`User.${user.id}`)
                .listen('.financial-request.updated', (event: any) => {
                    console.log('My request was updated:', event);
                    
                    toast.info('Request Updated', { 
                        description: 'One of your financial requests was updated.' 
                    });
                    
                    // Use router.get() to refresh data (fixes TypeScript error)
                    router.get(window.location.href, {}, {
                        preserveScroll: true, 
                        preserveState: true 
                    });
                });

            // 2. Listen on channels for each role the user has
            user.roles.forEach((role: string) => {
                window.Echo.private(`Role.${role}`)
                    .listen('.financial-request.updated', (event: any) => {
                        console.log(`New item in ${role} queue:`, event);
                        
                        toast.warning(`New Item in Queue`, {
                            description: `A new request has entered the ${role} queue!`
                        });
                        
                        // Use router.get() to refresh data
                        router.get(window.location.href, {}, {
                            preserveScroll: true, 
                            preserveState: true 
                        });
                    });
            });

            // Clean up listeners when the component unmounts
            return () => {
                window.Echo.private(`User.${user.id}`).stopListening('.financial-request.updated');
                if(user.roles) {
                    user.roles.forEach((role: string) => {
                        window.Echo.private(`Role.${role}`).stopListening('.financial-request.updated');
                    });
                }
            };
        }
    }, [user]); // Re-run if the user object changes

    return (
        // Pass all props EXCEPT children to the template
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster 
                richColors 
                position="top-right" 
                style={{ zIndex: 9999 }}
            />
        </AppLayoutTemplate>
    );
}