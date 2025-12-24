import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';
import { route } from 'ziggy-js';

// --- Icon Components for Theme Toggle ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [theme, toggleTheme] = useTheme();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground transition-colors duration-300 relative px-4">
            <Head title="Forgot Password" />

            {/* Theme Toggle Button (Absolute Top Right) */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-2.5 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Toggle theme"
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={theme}
                        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </motion.div>
                </AnimatePresence>
            </button>

            {/* Centered Card */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[480px]"
            >
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-8">
                    
                    {/* Header: Logo Left - Text Center - Logo Right */}
                    <div className="mb-8 flex items-center justify-between gap-2">
                        {/* Left: Bagong Pilipinas */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="flex h-16 w-16 shrink-0 items-center justify-center"
                        >
                            <img 
                                src="/images/bagong-pilipinas-logo.png" 
                                alt="Bagong Pilipinas" 
                                className="h-full w-full object-contain drop-shadow-sm"
                            />
                        </motion.div>

                        {/* Center: Title Text */}
                        <div className="flex-1 text-center px-1">
                            <h1 className="text-2xl font-bold tracking-tight leading-none text-foreground">
                                BRIDGE System
                            </h1>
                            <p className="mt-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-tight">
                                Budget, Resources, & Integrated Data for Grants in Education
                            </p>
                        </div>

                        {/* Right: CHED Logo */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="flex h-16 w-16 shrink-0 items-center justify-center"
                        >
                            <img 
                                src="/chedlogo.png" 
                                alt="CHED Logo" 
                                className="h-full w-full object-contain drop-shadow-sm"
                            />
                        </motion.div>
                    </div>

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-semibold tracking-tight">Reset Password</h2>
                        <p className="mt-2 text-sm text-muted-foreground text-pretty">
                            Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="name@company.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                            />
                            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
                        </div>

                        <button
                            disabled={processing}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
                        >
                            Email Password Reset Link
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <a href={route('login')} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                            Log in
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}