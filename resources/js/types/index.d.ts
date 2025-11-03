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
    flash?: {
        success?: string;
        error?: string;
    };
    ziggy: Config & { location: string; query: { tab?: string } };
    [key: string]: unknown;
};
export interface FinancialRequestLog {
    id: number;
    action: string;
    remarks: string | null;
    user: User; // The user who performed the action
    created_at: string;
}
// ✨ ADD: Tell TypeScript about the global window.Echo object
declare global {
    interface Window {
        Echo: Echo;
        Pusher: any;
    }
}export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
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
export interface Attachment {
    id: number;
    user_id: number;
    filepath: string;
    filename: string;
    disk: string;
    created_at: string;
    updated_at: string;
}
export interface FullFinancialRequest {
    id: number;
    title: string;
    request_type: string;
    amount: number;
    description: string;
    status: string;
    remarks: string | null;
    created_at: string;
    budget_approved_at: string | null;
    accounting_approved_at: string | null;
    cashier_paid_at: string | null;
    user: User; // The full user object
    attachments: Attachment[]; // An array of attachment objects
    logs?: FinancialRequestLog[]; // The audit logs
    time_in_current_status: string;
    days_in_current_status: number | null;
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