import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme'; // <-- 1. Import the new hook
// Import FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import 'filepond-plugin-image-crop/dist/filepond-plugin-image-crop.css';
// Register the plugins
registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginImageCrop);
// --- Icon Components for Theme Toggle ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
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
  <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

// --- Particle Background Component ---
const ParticleBackground = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let particles: Particle[] = [];
        let frameId: number | null = null;

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;

            constructor() {
                if (!canvas) {
                    this.x = 0; this.y = 0; this.size = 0; this.speedX = 0; this.speedY = 0;
                    return;
                }
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }
            update() {
                if (!canvas) return;
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX;
                this.y += this.speedY;
            }
            draw(context: CanvasRenderingContext2D) {
                context.fillStyle = 'rgba(255, 255, 255, 0.8)';
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fill();
            }
        }

        const init = () => {
            if (!canvas) return;
            particles = [];
            let num = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < num; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            if (!ctx || !canvas) return;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dist = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                    if (dist < (canvas.width / 7) * (canvas.height / 7)) {
                        let opacity = 1 - (dist / 20000);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });
            connect();
            frameId = requestAnimationFrame(animate);
        };

        let resizeTimer: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!canvas) return;
                const container = canvas.parentElement;
                if(!container) return;
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                init();
                if (!frameId) {
                    animate();
                }
            }, 100);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            clearTimeout(resizeTimer);
        }
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};


// --- Main Auth Split Layout Component (Copied from Login) ---
const AuthSplitLayout = ({ children, title, description, logoSrc, theme, toggleTheme }: {
    children: React.ReactNode;
    title: string;
    description: string;
    logoSrc: string;
    theme: string;
    toggleTheme: () => void;
}) => {
    return (
        <div className={theme}>
            <div className="relative grid min-h-screen w-full lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
                <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-900" />
                    <ParticleBackground />
                    <motion.div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} >
                        <img src={logoSrc} alt="Background Logo" className="w-2/3 h-auto opacity-60" />
                    </motion.div>
                    <motion.a href="/" className="relative z-20 flex items-center text-lg font-medium gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} >
                        <img src={logoSrc} alt="G.A.B.AY. IX Logo" className="h-10 w-10"/>
                        <span className="drop-shadow-md">FORTIS</span>
                    </motion.a>
                    <motion.div className="relative z-20 mt-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} >
                        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg">
                            <blockquote className="space-y-2">
                                <p className="text-xl"> &ldquo;This portal has been a gateway to my dreams. The process was seamless, and the support was incredible.&rdquo; </p>
                                <footer className="text-base text-slate-300">- A Proud Scholar</footer>
                            </blockquote>
                        </div>
                    </motion.div>
                </div>
                <div className="flex items-center justify-center p-8 relative">
                    <button onClick={toggleTheme} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]" >
                        <a href="/" className="relative z-20 flex items-center justify-center gap-3 lg:hidden">
                            <img src={logoSrc} alt="G.A.B.AY. IX Logo" className="h-12 w-12"/>
                        </a>
                        <div className="flex flex-col text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                        </div>
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// --- Icon Components ---
const LoaderCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// --- Main Register Component ---
export default function Register() {
   const [theme, toggleTheme] = useTheme();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        avatar: null as File | null, 
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(e.target.name as any, e.target.value);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <AuthSplitLayout
            title="Create an account"
            description="Enter your details below to create your account"
            logoSrc="/images/Logo.png"
            theme={theme}
            toggleTheme={toggleTheme}
        >
            <Head title="Register" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-4">
                    <div className="grid gap-2 items-center justify-center">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Profile Picture (Optional)</label>
<FilePond
    files={data.avatar ? [data.avatar] : []}
    onupdatefiles={(fileItems) => {
        setData('avatar', fileItems.length > 0 ? (fileItems[0].file as File) : null);
    }}
    name="avatar"
    // This new labelIdle includes an SVG icon for a better look
    labelIdle='<div class="flex flex-col items-center justify-center h-full text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg><span class="filepond--label-action mt-2 text-sm">Upload Picture</span></div>'
    acceptedFileTypes={['image/png', 'image/jpeg']}
    stylePanelLayout="compact circle"
    imagePreviewHeight={160}
    imageCropAspectRatio="1:1" // <-- This forces a square crop
    className="w-40 h-40 mx-auto"
/>
    {errors.avatar && <p className="text-xs text-red-500 dark:text-red-400 text-center -mt-2">{errors.avatar}</p>}
</div>
                    {/* Name Input */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            autoFocus
                            required
                            onChange={handleInputChange}
                            placeholder="Juan Dela Cruz"
                            className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                        />
                         {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Email address</label>
                         <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            required
                            onChange={handleInputChange}
                            placeholder="scholar@example.com"
                            className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                        />
                         {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email}</p>}
                    </div>
                    {/* Password Input */}
                    <div className="grid gap-2">
                         <label htmlFor="password"  className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Password</label>
                         <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            required
                            onChange={handleInputChange}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                        />
                         {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password}</p>}
                    </div>
                    {/* Confirm Password Input */}
                     <div className="grid gap-2">
                         <label htmlFor="password_confirmation"  className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Confirm Password</label>
                         <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            required
                            onChange={handleInputChange}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                        />
                         {errors.password_confirmation && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password_confirmation}</p>}
                    </div>

                    <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing}>
                        {processing && <LoaderCircle />}
                        Create account
                    </button>
                </div>
                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Log in
                    </a>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
