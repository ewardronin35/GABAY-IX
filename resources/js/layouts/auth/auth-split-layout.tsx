import { motion } from 'framer-motion';
import React, { useRef, useEffect } from 'react';

// --- Icon Components for Theme Toggle ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    // THE FIX: Added the second "24" to the viewBox attribute
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

// --- Particle Type Definition ---
interface Particle {
    x: number; y: number; size: number; speedX: number; speedY: number;
    update: () => void;
    draw: (context: CanvasRenderingContext2D) => void;
}

// --- Particle Background Component (Bulletproof Version) ---
const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let particles: Particle[] = [];
        let frameId: number | null = null;

        class ParticleImpl implements Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;

            constructor() {
                if (!canvas) { // Safety check
                    this.x = 0; this.y = 0; this.size = 0; this.speedX = 0; this.speedY = 0; return;
                }
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }
            update() {
                if (!canvas) return; // Safety check
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
            if (!canvas || canvas.width === 0) return; // Safety check
            particles = [];
            let num = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < num; i++) {
                particles.push(new ParticleImpl());
            }
        };

        const connect = () => {
            if (!ctx || !canvas) return; // Safety check
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                    if (distance < (canvas.width/7) * (canvas.height/7)) {
                        opacityValue = 1 - (distance/20000);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
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
            if (!ctx || !canvas) return; // Safety check
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
                if (!canvas) return; // Safety check
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
            if(frameId) cancelAnimationFrame(frameId);
            clearTimeout(resizeTimer);
        }
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// --- Main Auth Split Layout Prop Types ---
interface AuthSplitLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    logoSrc: string;
    theme: string;
    toggleTheme: () => void;
}

// --- Main Auth Split Layout Component ---
export default function AuthSplitLayout({ children, title, description, logoSrc, theme, toggleTheme }: AuthSplitLayoutProps) {
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