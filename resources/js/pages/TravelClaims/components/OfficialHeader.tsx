// resources/js/Pages/Admin/Stufaps/Partials/OfficialHeader.tsx
import React from 'react';

const CHED_LOGO_URL = '/images/ched-logo.png';
const BP_LOGO_URL = '/images/bagong-pilipinas-logo.png';

export function OfficialHeader() {
    return (
        <header className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-t-lg shadow-sm flex flex-col md:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 gap-4">
            {/* Logo 1 */}
            <img src={CHED_LOGO_URL} alt="CHED Logo" className="h-16 sm:h-20 w-auto" />
            
            {/* Text Content */}
            <div className="text-center text-gray-900 dark:text-gray-100 space-y-1">
                <p className="font-fira-sans text-xs sm:text-sm text-gray-700 dark:text-gray-300 uppercase">Republic of the Philippines</p>
                <p className="font-fira-sans text-xs sm:text-sm text-gray-700 dark:text-gray-300 uppercase">Office of the President</p>
                <p className="font-georgia text-lg sm:text-xl font-bold tracking-wider text-indigo-900 dark:text-indigo-400">COMMISSION ON HIGHER EDUCATION</p>
                <p className="text-xs sm:text-sm font-semibold">Regional Office IX, Zamboanga City</p>
            </div>

            {/* Logo 2 */}
            <img src={BP_LOGO_URL} alt="Bagong Pilipinas Logo" className="h-16 sm:h-20 w-auto" />
        </header>
    );
}