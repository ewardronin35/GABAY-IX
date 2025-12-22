import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme'; // <-- 1. Import the new hook

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


const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

// --- Particle Background Component ---
const ParticleBackground = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
     React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let particles: Particle[] = [];
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if(!container || !ctx) return;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            init();
        };
        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;
            constructor() { this.x = Math.random() * (canvas?.width ?? 0); this.y = Math.random() * (canvas?.height ?? 0); this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 0.4 - 0.2; this.speedY = Math.random() * 0.4 - 0.2; }
            update() { if(!canvas) return; if (this.x > canvas.width || this.x < 0) this.speedX *= -1; if (this.y > canvas.height || this.y < 0) this.speedY *= -1; this.x += this.speedX; this.y += this.speedY; }
            draw(context: CanvasRenderingContext2D) { context.fillStyle = 'rgba(255, 255, 255, 0.8)'; context.beginPath(); context.arc(this.x, this.y, this.size, 0, Math.PI * 2); context.fill(); }
        }
        const init = () => { if(!canvas) return; particles = []; let num = (canvas.height * canvas.width) / 9000; for (let i = 0; i < num; i++) { particles.push(new Particle()); } };
        const connect = (context: CanvasRenderingContext2D) => { if(!canvas) return; let opacityValue = 1; for (let a = 0; a < particles.length; a++) { for (let b = a; b < particles.length; b++) { let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2); if (distance < (canvas.width/7) * (canvas.height/7)) { opacityValue = 1 - (distance/20000); context.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`; context.lineWidth = 1; context.beginPath(); context.moveTo(particles[a].x, particles[a].y); context.lineTo(particles[b].x, particles[b].y); context.stroke(); } } } }
        let animationFrameId: number;
        const animate = () => { if(!ctx || !canvas) return; ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(ctx); }); connect(ctx); animationFrameId = requestAnimationFrame(animate); };
        resizeCanvas();
        animate();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};


// --- Main Auth Split Layout Component ---
const AuthSplitLayout = ({ children, title, description, logoSrc, toggleTheme, theme }: {
    children: React.ReactNode;
    title: string;
    description: string;
    logoSrc: string;
    toggleTheme: () => void;
    theme: string;
}) => {
    return (
        // The root div no longer needs the theme class, as it's now on the <html> tag
        <div className="relative grid min-h-screen w-full lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
            {/* Left Panel */}
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-900" />
                <ParticleBackground />
                <motion.div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}>
                    <img src={logoSrc} alt="Background Logo" className="w-2/3 h-auto opacity-60" />
                </motion.div>
                <motion.a href="/" className="relative z-20 flex items-center text-lg font-medium gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <img src={logoSrc} alt="G.A.B.AY. IX Logo" className="h-10 w-10"/>
                    <span className="drop-shadow-md">BRIDGE</span>
                </motion.a>
                <motion.div className="relative z-20 mt-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg">
                        <blockquote className="space-y-2">
                            <p className="text-xl">
                                &ldquo;This portal has been a gateway to my dreams. The process was seamless, and the support was incredible.&rdquo;
                            </p>
                            <footer className="text-base text-slate-300">- A Proud Scholar</footer>
                        </blockquote>
                    </div>
                </motion.div>
            </div>
            
            {/* Right Panel (Form Side) */}
            <div className="flex items-center justify-center p-8 relative">
                <button onClick={toggleTheme} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon />}
                </button>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
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
    );
}

// --- Icon Component ---
const LoaderCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// --- Main Login Component ---
export default function Login({ canResetPassword }: { canResetPassword?: boolean }) {
    // 2. Use the hook to manage theme globally
    const [theme, toggleTheme] = useTheme();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => { reset('password'); };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setData(name as any, type === 'checkbox' ? checked : value);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/login');
    };
    
    function route(path: string, params?: { provider: string }): string {
        // Basic implementation for social authentication routes
        if (path === 'socialite.redirect' && params?.provider) {
            return `/auth/${params.provider}/redirect`;
        }
        return path;
    }
    return (
        <AuthSplitLayout 
            title="Log in to your account" 
            description="Enter your email and password below to log in"
            logoSrc="/images/Logo.png"
            theme={theme}
            toggleTheme={toggleTheme}
        >
            <Head title="Log In" />
            <div className="w-full">
                <AnimatePresence>
                    {errors.email && (
                         <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className='p-4 mb-6 rounded-lg text-sm font-medium text-left bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30'
                        >
                           {errors.email}
                        </motion.div>
                    )}
                </AnimatePresence>
                 <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Email address</label>
                            {/* NOTE: No icon wrapper div needed anymore */}
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                required
                                autoFocus
                                autoComplete="email"
                                onChange={handleInputChange}
                                placeholder="scholar@example.com"
                                // 3. Changed padding from pl-10 to px-4
                                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                            />
                        </div>

                        <div className="grid gap-2">
                             <div className="flex items-center">
                                <label htmlFor="password"  className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                {canResetPassword && (
                                    <a href="/forgot-password" className="ml-auto text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            {/* NOTE: No icon wrapper div needed anymore */}
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                required
                                autoComplete="current-password"
                                onChange={handleInputChange}
                                placeholder="••••••••••••"
                                // 3. Changed padding from pl-10 to px-4
                                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-200 focus:ring-2 focus:border-cyan-500 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                            />
                        </div>

                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="remember" name="remember" checked={data.remember} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-cyan-600 focus:ring-cyan-500"/>
                            <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Remember me</label>
                        </div>

                        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing}>
                            {processing && <LoaderCircle />}
                            Log in
                        </button>
                        
                        <div className="relative mt-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-300 dark:border-slate-700" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950">Or continue with</span></div>
                        </div>

                       <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

    {/* Google Login Link (styled as a button) */}
    <a 
        href={route('socialite.redirect', { provider: 'google' })} 
        className="flex items-center justify-center gap-2 px-4 py-2.5 w-full border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
    >
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
        Google
    </a>
    
    {/* Facebook Login Link (styled as a button) */}
    <a 
        href={route('socialite.redirect', { provider: 'facebook' })}
        className="flex items-center justify-center gap-2 px-4 py-2.5 w-full border border-transparent rounded-lg text-white bg-[#1877F2] hover:bg-[#166eab] transition-colors duration-200"
    >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.289a1.706 1.706 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.317h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></svg>
        Facebook
    </a>
</div>
                    </div>
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{' '}
                        <a href="/register" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                            Sign up
                        </a>
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}