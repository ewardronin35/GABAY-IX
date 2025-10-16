import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    return (
        <div className="px-2">
            {items.map((item) =>
                item.children ? (
                    // If the item has children, render a collapsible Accordion
                    <Accordion type="single" collapsible key={item.title} className="w-full">
                        <AccordionItem value={item.title} className="border-none">
                            <AccordionTrigger
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg:last-child]:rotate-180 ${
                                    item.isActive ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-0 pt-1">
                                <SidebarMenu className="ml-7 border-l border-dashed border-sidebar-border py-2">
                                    {item.children.map((child) => (
                                        <SidebarMenuItem key={child.title} className="h-auto px-2">
                                            {/* ✨ FIX: Use the 'isActive' prop for child items */}
                                            <SidebarMenuButton
                                                asChild
                                                isActive={child.isActive}
                                                size="sm"
                                                className="w-full justify-start"
                                            >
                                                <Link href={child.href!} prefetch>
                                                    {child.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ) : (
                    // If no children, render a normal link item
                    <SidebarMenu className="px-0" key={item.title}>
                        <SidebarMenuItem>
                            {/* ✨ FIX: Use the 'isActive' prop for single items like Dashboard */}
                            <SidebarMenuButton asChild isActive={item.isActive}>
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )
            )}
        </div>
    );
}