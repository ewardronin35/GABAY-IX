import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Verified() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Start the countdown timer when the component mounts
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown > 0 ? prevCountdown - 1 : 0);
        }, 1000);

        // When the countdown reaches 0, redirect to the login page
        if (countdown === 0) {
            clearInterval(timer);
            router.get('/login');
        }

        // Clean up the timer when the component unmounts
        return () => clearInterval(timer);
    }, [countdown]);

    return (
        <>
            <Head title="Email Verified" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
                <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold leading-6 text-slate-900 dark:text-slate-100">
                        Email Verified Successfully!
                    </h3>
                    <p className="text-base text-slate-600 dark:text-slate-400">
                        Your account is now active. You will be redirected to the login page in {countdown} seconds.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:scale-105"
                    >
                        Log In Now
                    </Link>
                </div>
            </div>
        </>
    );
}