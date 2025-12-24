import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';
import { route } from 'ziggy-js';

// --- FilePond Imports ---
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import 'filepond-plugin-image-crop/dist/filepond-plugin-image-crop.css';

// Register the plugins
registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginImageCrop);

// --- Icon Components ---
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

const LoaderCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
    });

    // Fix: Destructure useTheme as array
    const [theme, toggleTheme] = useTheme();

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground transition-colors duration-300 relative px-4 py-8">
            <Head title="Register" />

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

            {/* Centered Login Card */}
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
                        <h2 className="text-xl font-semibold tracking-tight">Create an account</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* FilePond Avatar Upload */}
                        <div className="grid gap-2 items-center justify-center">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-center">Profile Picture (Optional)</label>
                            <div className="w-32 h-32 mx-auto">
                                <FilePond
                                    files={data.avatar ? [data.avatar] : []}
                                    onupdatefiles={(fileItems) => {
                                        setData('avatar', fileItems.length > 0 ? (fileItems[0].file as File) : null);
                                    }}
                                    name="avatar"
                                    labelIdle='<div class="flex flex-col items-center justify-center h-full text-muted-foreground text-[10px]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg><span class="mt-1">Upload</span></div>'
                                    acceptedFileTypes={['image/png', 'image/jpeg']}
                                    stylePanelLayout="compact circle"
                                    imagePreviewHeight={128}
                                    imageCropAspectRatio="1:1"
                                    className="filepond-avatar"
                                />
                            </div>
                            {errors.avatar && <p className="text-sm font-medium text-destructive text-center">{errors.avatar}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                autoFocus
                                required
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Juan Dela Cruz"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="scholar@example.com"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password_confirmation">Confirm Password</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.password_confirmation && <p className="text-sm font-medium text-destructive">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full gap-2"
                        >
                            {processing && <LoaderCircle className="animate-spin" />}
                            Create account
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <a href={route('login')} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                            Log in
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}