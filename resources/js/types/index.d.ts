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
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
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
export type PaginatedResponse<T> = Paginator<T>;
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
export type Scholar = {
    id: number;
    lrn: string | null;
    seq: number | null;
    family_name: string;
    given_name: string;
    middle_name: string | null;
    extension_name: string | null;
    sex: 'M' | 'F' | null;
    contact_no: string | null;
    email_address: string | null;
    date_of_birth: string | null; // Dates come as strings
    
    // --- Relationships ---
    // These are loaded by your controller query
    address?: Address;
    education?: Education;
};
export type AcademicRecord = {
    id: number;
    scholar_enrollment_id: number;
    hei_id: number | null;
    course_id: number | null;
    academic_year: string;
    semester: string;
    year_level: string | null;
    grant_amount: string | null;
    payment_status: string | null;
    app_no: string | null;
    batch_no: string | null;
    gwa: string | null;
    disbursement_date: string | null;
};

export type Address = {
    id: number;
    scholar_id: number;
    brgy_street: string | null;
    town_city: string | null;
    province: string | null;
    zip_code: string | null;
    congressional_district: string | null;
    region: string | null;
};

export type Education = {
    id: number;
    scholar_id: number;
    hei_id: number | null;
    course_id: number | null;
    
    // --- Relationships ---
    hei?: HEI; // Assuming you have an HEI type
    course?: Course; // Assuming you have a Course type
};
export type ScholarEnrollment = {
    id: number;
    scholar_id: number;
    program_id: number;
    hei_id: number | null;
    award_number: string | null;
    status: string;
    academic_year_applied: string | null;

    // --- Relationships (loaded by your controller) ---
    scholar: Scholar;
    hei: HEI;
    academicRecords: AcademicRecord[];
};
export type HEI = {
    id: number;
    hei_name: string;
    // ... add other HEI fields if needed
};

export type Course = {
    id: number;
    course_name: string;
    // ... add other Course fields if needed
};