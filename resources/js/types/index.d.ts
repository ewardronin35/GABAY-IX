import { type PageProps as InertiaPageProps } from '@inertiajs/core';
import { type AxiosInstance } from 'axios';
import { type route as routeFn } from 'ziggy-js';
import { type LucideIcon } from 'lucide-react';
import { Echo } from 'laravel-echo'; // ✨ ADD: Import Echo type

// ✨ ADD: A proper generic PageProps type
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    [key: string]: unknown;
};

// ✨ ADD: Tell TypeScript about the global window.Echo object
declare global {
    interface Window {
        Echo: Echo;
        Pusher: any;
    }
}

export interface Auth {
    user: User | null; // User can be null if not logged in
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}


export interface NavGroup {
    title: string;
    items: NavItem[];
}
export type Permission = string;
export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>; // ✅ FIX: Added '?' to make href optional
    isActive?: boolean;
    permission?: Permission; // <-- 1. ADDED THIS LINE
    prefetch?: boolean;
    role?: string[]; // e.g., 'admin', 'user', etc.
    children?: NavItem[];
    icon?: LucideIcon; // ✅ ADD THIS LINE
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    email_verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    permissions: string[]; // This is now the one and only definition
    [key: string]: unknown;
}