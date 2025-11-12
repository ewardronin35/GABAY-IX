import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import clsx from 'clsx';
import { Link } from '@inertiajs/react';

// Define the shape of a single pagination link from Laravel
interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}

// The component receives an array of these links
export function PaginationLinks({ links }: { links: PageLink[] }) {
    // Don't render pagination if there's only one page
    if (links.length <= 3) return null;

    // This function was causing the bug. We can remove it or fix it.
    // For now, let's remove the call to it.
    const handlePrefetch = (url: string | null) => {
        if (!url) return;
        // router.get(url, {}, { preserveScroll: true }); // This was the bug
        
        // A real prefetch would use this, but it's not essential:
        // router.prefetch(url); 
    };

    return (
        <nav className="flex items-center justify-end gap-2 mt-4">
            {links.map((link, index) => (
                <Button
                    key={index}
                    // This onClick is correct and preserves your scroll
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                    
                    // ✨ FIX: Removed the onMouseEnter handler that caused the bug
                    // onMouseEnter={() => handlePrefetch(link.url)} 
                    
                    disabled={!link.url}
                    size="sm"
                    variant={link.active ? 'default' : 'outline'}
                    className={clsx({ 'opacity-50 cursor-not-allowed': !link.url })}
                >
                    {/* Use dangerouslySetInnerHTML because Laravel sends HTML entities for arrows */}
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </nav>
    );
}