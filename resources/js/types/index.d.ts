import { type PageProps as InertiaPageProps } from '@inertiajs/core';
import { type AxiosInstance } from 'axios';
import { type route as routeFn } from 'ziggy-js';
import { type LucideIcon } from 'lucide-react';
import { Echo } from 'laravel-echo';

// --- GLOBAL ---

declare global {
    interface Window {
        Echo: Echo;
        Pusher: any;
    }
}

export type AcademicYear = {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Semester = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};
export type Program = {
    id: number;
    program_name: string;
};
export type BillingRecord = {
    id: number;
    academic_record_id: number;
    status: string | null;
    remarks: string | null;
    validated_by_user_id: number | null;
    date_fund_request: string | null;
    date_sub_aro: string | null;
    date_nta: string | null;
    date_disbursed_hei: string | null;
    date_disbursed_grantee: string | null;
    billing_amount: string | null; // Will be a string, needs parseFloat
    created_at: string;
    updated_at: string;
    
    // --- NEW: Add the loaded relationship ---
    validatedBy?: User | null; 
};

// This is the correct shape for Laravel's simple/cursor pagination links
export interface PageLink {
    url: string | null;
    label: string;
    active: boolean;
}

// This is the correct shape for the main Paginator object
export interface Paginator<T> {
    data: T[];
    links: PageLink[]; // Use the PageLink[] array
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
        links: PageLink[];
    };
    // These are from simplePaginator/cursorPaginator
    first_page_url: string | null;
    last_page_url: string | null;
    next_page_url: string | null;
    prev_page_url: string | null;
}

// Renamed to avoid confusion, this is what Inertia receives
export type PaginatedResponse<T> = Paginator<T>;


// --- APP TYPES ---

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
    user: User;
    created_at: string;
}

export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    permissions: Permission[];
    is_disabled: boolean;
};

export type Role = {
    id: number;
    name: string;
    guard_name: string;
};

export type Permission = {
    id: number;
    name: string;
    guard_name: string;
};

export type HEI = {
    id: number;
    hei_name: string;
    hei_code: string | null;
    type_of_heis: string | null;
    province_id: number | null;
    city_id: number | null;
    district_id: number | null;
uii: string | null;
    hei_type: string | null;
    city_municipality: string | null;
    // --- ADD/UPDATE RELATIONS ---
    province: Province | null;
    district: District | null;
    // --- Relationships ---
    scholar_count?: number; // From 'withCount'
    enrollments?: ScholarEnrollment[];
};

export type Course = {
    id: number;
    classification_id: number | null;
    course_name: string;
    abbreviation: string | null;
};

export type Major = {
    id: number;
    major_name: string;
};

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
    
    // --- Relationships ---
    address: Address | null;
    enrollments: ScholarEnrollment[];
};
// In resources/js/types/index.d.ts

export type AcademicRecord = {
    id: number;
    scholar_enrollment_id: number;
    
    // Fields
    seq: string | null;
    app_no: string | null;
    year_level: number | null;
    batch_no: string | null;
    payment_status: string | null; // Validation Status
    disbursement_date: string | null; // Grantee Disb Date
    grant_amount: string | null;
    endorsed_by: string | null;

    // Relations (Strict naming matching Laravel JSON)
    enrollment?: ScholarEnrollment;
    hei: HEI | null;
    course: Course | null;
    major: Major | null;
    academic_year: AcademicYear | null;
    semester: Semester | null;
    billing_record: BillingRecord | null; // Snake case usually coming from Laravel
};

export type Address = {
    id: number;
    scholar_id: number;
    // --- ADD THESE NEW FIELDS ---
    specific_address: string | null;
    barangay: string | null;
    city_municipality: string | null;
    province: string | null;
    district: string | null;
    zip_code: string | null;
};

export type ScholarEnrollment = {
    id: number;
    scholar_id: number;
    program_id: number;
    hei_id: number | null;
    award_number: string | null;
    application_number: string | null; // NEW
    status: string;
    academic_year_applied: string | null;

    // --- Relationships (loaded by your controller) ---
   scholar: Scholar;
    hei: HEI;
    program: Program | null; // Add this
    academic_records: AcademicRecord[]; // Use snake_case
};