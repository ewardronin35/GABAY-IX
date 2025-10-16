import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Copy } from 'lucide-react';

export default function MaintenanceIndex({
    auth,
    isDown,
    maintenance_secret,
}: PageProps<{ isDown: boolean; maintenance_secret?: string }>) {

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Bypass URL copied to clipboard!');
    };
    
    // Construct the bypass URL from the current page's origin and the secret
    const bypassUrl = maintenance_secret ? `${window.location.origin}/${maintenance_secret}` : '';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    System Maintenance
                </h2>
            }
        >
            <Head title="System Maintenance" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-medium">Maintenance Mode Control</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Enable maintenance mode to make the site temporarily unavailable to the public.
                        </p>

                        <div className="mt-6 flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${isDown ? 'bg-red-500' : 'bg-green-500'}`} />
                            <p>
                                Current Status:
                                <span className={`font-bold ${isDown ? 'text-red-500' : 'text-green-500'}`}>
                                    {isDown ? ' OFFLINE (Maintenance Mode is ON)' : ' LIVE'}
                                </span>
                            </p>
                        </div>

                        <div className="mt-6">
                            {isDown ? (
                                <Link as="button" method="post" href={route('admin.maintenance.up')} className="w-full"
                                      onClick={() => !confirm('Are you sure you want to bring the site back online?') && event.preventDefault()} >
                                    <Button variant="default" className="w-full">Disable Maintenance Mode</Button>
                                </Link>
                            ) : (
                                <Link as="button" method="post" href={route('admin.maintenance.down')} className="w-full"
                                      onClick={() => !confirm('Are you sure you want to take the site offline?') && event.preventDefault()} >
                                     <Button variant="destructive" className="w-full">Enable Maintenance Mode</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {maintenance_secret && (
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Maintenance Mode Activated!</AlertTitle>
                            <AlertDescription className="mt-2">
                                The site is now offline. To bypass the maintenance screen, use this secret URL.
                                <div className="mt-4 p-3 bg-gray-900 rounded-md flex items-center justify-between font-mono text-sm">
                                    <span className="text-yellow-400 break-all">{bypassUrl}</span>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(bypassUrl)} className="flex-shrink-0">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}