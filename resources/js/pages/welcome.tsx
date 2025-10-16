import { motion, useScroll, useSpring, AnimatePresence, useTransform, Variants } from 'framer-motion';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

// --- Icon Components ---
const Icon = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${className}`}>
        {children}
    </svg>
);
const UserPlusIcon = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="23" y1="8" x2="23" y2="14" /><line x1="20" y1="11" x2="26" y2="11" /></Icon>;
const DocumentTextIcon = () => <Icon><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></Icon>;
const CheckCircleIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SunIcon = () => <Icon className="w-5 h-5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></Icon>;
const MoonIcon = () => <Icon className="w-5 h-5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>;
const ChatBubbleOvalLeftEllipsisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.15 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <Icon><polyline points="9 18 15 12 9 6" /></Icon>;
const ChevronLeftIcon = () => <Icon><polyline points="15 18 9 12 15 6" /></Icon>;
const NewspaperIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4M4 22a2 2 0 0 0 2-2v-9c0-1.1-.9-2-2-2H4v11zM18 22V8c0-1.1-.9-2-2-2h-3v14h5z" /><line x1="12" y1="6" x2="12" y2="22" /></Icon>;
const SearchIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
const InfoIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>;
const ClipboardListIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="16" y2="16" /></Icon>;
const UsersIcon = ({ className = '' }: { className?: string }) => <Icon className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;


// --- Theme Management ---
const useTheme = () => {
    const [theme, setTheme] = useState('light');
    useLayoutEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);
    return [theme, setTheme] as const;

};

const ThemeSwitcher = ({ theme, setTheme }: { theme: string, setTheme: React.Dispatch<React.SetStateAction<string>> }) => (
    <div className="relative flex w-20 items-center rounded-full bg-slate-200 p-1 dark:bg-slate-700">
        {/* We have removed the single motion.div from here */}

        <button
            onClick={() => setTheme('light')}
            className={`relative z-10 flex w-1/2 items-center justify-center rounded-full p-1.5 transition-colors ${
                theme === 'light' ? 'text-cyan-500' : 'text-slate-400'
            }`}
        >
            {/* If the theme is light, render the background here */}
            {theme === 'light' && (
                <motion.div
                    layoutId="switcher-bg" // This is the magic key!
                    className="absolute inset-0 h-full w-full rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
            )}
            <div className="relative z-10"> {/* Ensure icon is above the motion.div */}
                <SunIcon />
            </div>
        </button>

        <button
            onClick={() => setTheme('dark')}
            className={`relative z-10 flex w-1/2 items-center justify-center rounded-full p-1.5 transition-colors ${
                theme === 'dark' ? 'text-cyan-400' : 'text-slate-400'
            }`}
        >
            {/* If the theme is dark, render the background here */}
            {theme === 'dark' && (
                <motion.div
                    layoutId="switcher-bg" // It has the same magic key!
                    className="absolute inset-0 h-full w-full rounded-full bg-slate-800"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
            )}
            <div className="relative z-10"> {/* Ensure icon is above the motion.div */}
                <MoonIcon />
            </div>
        </button>
    </div>
);
  const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let particles: Particle[] = [];
        let frameId: number | null = null;

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;

            constructor() {
                if (!canvas) { // Safety check for constructor
                    this.x = 0; this.y = 0; this.size = 0; this.speedX = 0; this.speedY = 0;
                    return;
                }
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }
            update() {
                if (!canvas) return; // Safety check for update method
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX;
                this.y += this.speedY;
            }
            draw(context: CanvasRenderingContext2D) {
                // This version correctly handles light and dark mode colors
                context.fillStyle = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 100, 100, 0.6)';
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fill();
            }
        }

        const init = () => {
            if (!canvas) return; // Safety check
            particles = [];
            let num = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < num; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            if (!ctx || !canvas) return; // Safety check
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dist = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                    if (dist < (canvas.width / 7) * (canvas.height / 7)) {
                        let opacity = 1 - (dist / 15000);
                        // This version correctly handles light and dark mode colors
                        let color = document.documentElement.classList.contains('dark') ? `rgba(255, 255, 255, ${opacity})` : `rgba(100, 100, 100, ${opacity})`;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 0.5;
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
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                init();
                if (!frameId) {
                    animate();
                }
            }, 100);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        const observer = new MutationObserver(() => init());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            observer.disconnect();
            clearTimeout(resizeTimer);
        }
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
};

// --- Application Tracker Component ---
const TrackApplication = () => {
    const [trackingId, setTrackingId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusData, setStatusData] = useState<ApplicationData | null>(null);
    const [error, setError] = useState('');

    interface ApplicationStep {
        name: string;
        completed: boolean;
        date: string | null;
    }

interface ApplicationData {
    name: string;
    status: 'Approved' | 'In Process' | 'Requires Action'; // More specific status
    statusMessage: string;
    steps: { name: string; completed: boolean; date: string | null; }[];
}

    interface DummyDataType {
        [key: string]: ApplicationData;
    }

    const dummyData: DummyDataType = {
        '2025-00123': { name: 'Juan Dela Cruz', status: 'Approved', statusMessage: 'Congratulations! Your scholarship grant is approved. Please await further instructions via email.', steps: [ { name: 'Application Submitted', completed: true, date: '2025-08-15' }, { name: 'Initial Screening', completed: true, date: '2025-08-20' }, { name: 'Validation', completed: true, date: '2025-09-01' }, { name: 'Approved for Grant', completed: true, date: '2025-09-10' } ] },
        '2025-00456': { name: 'Maria Clara', status: 'In Process', statusMessage: 'Your application is currently undergoing final validation. Please check back for updates.', steps: [ { name: 'Application Submitted', completed: true, date: '2025-08-18' }, { name: 'Initial Screening', completed: true, date: '2025-08-22' }, { name: 'Validation', completed: false, date: null }, { name: 'Approved for Grant', completed: false, date: null } ] },
        '2025-00789': { name: 'Crisostomo Ibarra', status: 'Requires Action', statusMessage: 'Missing required document: Form 138. Please upload on your dashboard.', steps: [ { name: 'Application Submitted', completed: true, date: '2025-08-19' }, { name: 'Initial Screening', completed: false, date: null }, { name: 'Validation', completed: false, date: null }, { name: 'Approved for Grant', completed: false, date: null } ] }
    };

    const handleTrack = () => {
        if (!trackingId) { setError('Please enter a tracking ID.'); return; }
        setIsLoading(true); setStatusData(null); setError('');
        setTimeout(() => {
            const data = dummyData[trackingId.trim()];
            if (data) { setStatusData(data); } else { setError('No application found. Please check the ID and try again.'); }
            setIsLoading(false);
        }, 1500);
    };
    
    const getStatusColor = (status: 'Approved' | 'In Process' | 'Requires Action'): string => ({ 'Approved': 'text-green-500 bg-green-500/10', 'In Process': 'text-blue-500 bg-blue-500/10', 'Requires Action': 'text-yellow-500 bg-yellow-500/10' }[status] || 'text-slate-500 bg-slate-500/10');

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900 dark:text-white sm:text-4xl">Track Your Application</h2>
            <p className="mt-4 max-w-2xl mx-auto text-center text-slate-600 dark:text-slate-400">Enter your application tracking ID to see your current status in real-time.</p>
            <div className="mt-10 max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g., 2025-00123" className="w-full flex-grow rounded-lg p-3 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 transition"/>
                <button onClick={handleTrack} disabled={isLoading} className="flex-shrink-0 flex justify-center items-center gap-2 rounded-lg bg-cyan-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-cyan-500 hover:shadow-cyan-500/30 hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">
                    {isLoading ? (<div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>) : (<SearchIcon />)}<span>{isLoading ? 'Searching...' : 'Track'}</span>
                </button>
            </div>
            <AnimatePresence>
                {(statusData || error) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8 p-6 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {statusData && (
                        <div>
                            <div className="text-center border-b dark:border-slate-700 pb-4 mb-4">
                                <p className="text-slate-600 dark:text-slate-400">Status for <span className="font-bold text-slate-800 dark:text-white">{statusData.name}</span></p>
                                <p className={`mt-1 text-lg font-bold px-3 py-1 rounded-full inline-block ${getStatusColor(statusData.status)}`}>{statusData.status}</p>
                                {statusData.statusMessage && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{statusData.statusMessage}</p>}
                            </div>
                            <ul className="space-y-4">
                                {statusData.steps.map((step, i) => (
                                    <li key={i} className="flex items-start">
                                        <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${step.completed ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                            {step.completed ? <CheckCircleIcon className="w-4 h-4" /> : <div className="h-2 w-2 rounded-full bg-current"></div>}
                                        </div>
                                        <div className="ml-4">
                                            <p className={`font-semibold ${step.completed ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{step.name}</p>
                                            {step.date && <p className="text-sm text-slate-500 dark:text-slate-400">{step.date}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
type MessageType = { s: 'user' | 'ai'; t: string; };
// --- Gemini AI Chatbot Component ---
const AIChatbot = () => {
    
    const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState<MessageType[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Effect to handle the initial greeting message from the bot
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsLoading(true);
            const getInitialMessage = async () => {
                const systemPrompt = `You are "Gabby", a friendly AI assistant for the FORTIS Scholarship Portal. Your goal is to provide concise, accurate answers. You are introducing yourself for the first time. Keep it short and welcoming.`;
                const userMessage = "Hello! Introduce yourself.";
                try {
                    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                    const payload = { contents: [{ parts: [{ text: userMessage }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
                    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                            const initialMessage: MessageType = { s: 'ai', t: text }; // <-- Define the object first
                                setMessages([initialMessage]); // <-- Then use it here
                    } else {
                        throw new Error("No content from API.");
                    }
                } catch (err) {
                    // Fallback message in case of API error on initial load
                    const fallbackMessage: MessageType = { s: 'ai', t: "Hello! I'm Gabby, your AI assistant. How can I help you today?" };
setMessages([fallbackMessage]);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            getInitialMessage();
        }
    }, [isOpen]);

    const handleSendMessage = async (userMessage: string) => {
        if (!userMessage.trim() || isLoading) return;

    const newUserMessage: MessageType = { s: 'user', t: userMessage };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages); // Update UI immediately with the user's message
        setIsLoading(true);

        const systemPrompt = `You are "Gabby", a friendly AI assistant for the FORTIS Scholarship Portal. Your goal is to provide concise, accurate answers. Knowledge base:\n- About: The FORTIS system is CHED - Region IX's official platform to streamline scholarship applications in the Zamboanga Peninsula.\n- Application: 1. Create Account. 2. Complete form & upload documents. 3. Track status on your dashboard.\n- Eligibility: Advise users to go to the main page to find the 'Track Your Application' section.\n- Developer: The lead developer is Eduard Roland P. Donor. Keep answers friendly and brief.`;
        
        // Convert the message history to the format required by the API.
        const apiHistory = updatedMessages.map(msg => ({
            role: msg.s === 'user' ? 'user' : 'model',
            parts: [{ text: msg.t }]
        }));

        // The API requires conversations to start with a 'user' message.
        // If our state starts with the AI's greeting, remove it from the API payload.
        if (apiHistory.length > 0 && apiHistory[0].role === 'model') {
            apiHistory.shift();
        }

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = { contents: apiHistory, systemInstruction: { parts: [{ text: systemPrompt }] } };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setMessages(prev => [...prev, { s: 'ai', t: text }]);
            } else {
                throw new Error("No content from API.");
            }
        } catch (err) {
            setMessages(prev => [...prev, { s: 'ai', t: "Sorry, I'm having trouble connecting. Please try again." }]);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const predefinedQuestions = ["What is this system about?", "How to apply?", "How to check my status?", "Who is the developer?"];
    
    return (
        <>
            <div className="fixed bottom-5 right-5 z-[999]">
                <button onClick={() => setIsOpen(!isOpen)} className="bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 transition-all duration-300 hover:scale-110">
                    <AnimatePresence mode="wait">
                        <motion.div key={isOpen ? 'x' : 'chat'} initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                            {isOpen ? <XIcon /> : <ChatBubbleOvalLeftEllipsisIcon />}
                        </motion.div>
                    </AnimatePresence>
                </button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.3 }} className="fixed bottom-24 right-5 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 z-[998]">
                        <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Chat with Gabby</h3>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="flex flex-col gap-4">
                                {messages.map((m, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.s === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl ${m.s === 'user' ? 'bg-cyan-600 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: m.t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}/>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 rounded-bl-lg">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap gap-2">
                                {predefinedQuestions.map(q => (
                                    <button key={q} onClick={() => handleSendMessage(q)} className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-600 transition disabled:opacity-50" disabled={isLoading}>{q}</button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


// --- Main Page Component ---
export default function Welcome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const [theme, setTheme] = useTheme();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
const smoothScrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); };

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96], staggerChildren: 0.2 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] } },
};

    const testimonials = [
        { quote: "FORTIS didn't just fund my education; it invested in my future. I'm forever grateful.", author: "Maria S., BS Information Technology", avatar: "https://i.pravatar.cc/150?img=1" },
        { quote: "The application was so simple and the team was incredibly supportive throughout the process.", author: "John D., BS Engineering", avatar: "https://i.pravatar.cc/150?img=3" },
        { quote: "Being part of this community of scholars has opened so many doors for me. Thank you!", author: "Aisha K., BS Nursing", avatar: "https://i.pravatar.cc/150?img=5" },
        { quote: "A life-changing opportunity that made my college dreams a reality.", author: "Leo G., BS Agriculture", avatar: "https://i.pravatar.cc/150?img=7" },
    ];
    
    const announcements = [
        { date: '2025-09-15', title: 'Application Period for A.Y. 2026-2027 Now Open!', content: 'We are officially accepting applications for the upcoming academic year. The deadline for submissions is January 31, 2026.'},
        { date: '2025-09-10', title: 'System Maintenance Scheduled', content: 'The FORTIS portal will be temporarily unavailable on September 20, 2025, from 1:00 AM to 3:00 AM for system upgrades.'},
        { date: '2025-09-01', title: 'Congratulations to our New Scholars!', content: 'A warm welcome to the new batch of CHED-R9 scholars! Please check your dashboards for the orientation schedule.'},
    ];

    const nextTestimonial = () => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    const prevTestimonial = () => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

    return (
<div className="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 antialiased font-sans transition-colors duration-300">            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-cyan-500 origin-left z-[60]" style={{ scaleX }} />
            
            <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <a href="#" onClick={() => smoothScrollTo('hero-section')} className="flex items-center gap-2 cursor-pointer"><img src="/images/Logo.png" alt="FORTIS Logo" className="h-8 w-8" /><span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">FORTIS</span></a>
<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
    {/* I've updated each <a> tag to be a flex container with an icon */}
    <a onClick={() => smoothScrollTo('about-section')} className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition">
        <InfoIcon className="w-4 h-4" /> About
    </a>
    <a onClick={() => smoothScrollTo('how-it-works')} className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition">
        <ClipboardListIcon className="w-4 h-4" /> Process
    </a>
    <a onClick={() => smoothScrollTo('track-section')} className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition">
        <SearchIcon className="w-4 h-4" /> Track
    </a>
    <a onClick={() => smoothScrollTo('announcements-section')} className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition">
        <NewspaperIcon className="w-4 h-4" /> Updates
    </a>
    <a onClick={() => smoothScrollTo('testimonials-section')} className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition">
        <UsersIcon className="w-4 h-4" /> Stories
    </a>
</nav>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        <a href="/login" className="rounded-lg px-4 py-2 font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800">Log in</a>
                        <a href="/register" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-cyan-500 hover:shadow-lg hover:-translate-y-0.5">Register</a>
                    </div>
                    <div className="md:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-700 dark:text-slate-300">{isMenuOpen ? <XIcon/> : <MenuIcon/>}</button></div>
                </div>
                <AnimatePresence>{isMenuOpen && (<motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="md:hidden bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
                    <nav className="flex flex-col items-center gap-6 py-6 text-slate-700 dark:text-slate-200">
                        <a onClick={() => smoothScrollTo('about-section')}>About</a>
                        <a onClick={() => smoothScrollTo('how-it-works')}>Process</a>
                        <a onClick={() => smoothScrollTo('track-section')}>Track</a>
                        <a onClick={() => smoothScrollTo('announcements-section')}>Updates</a>
                        <a onClick={() => smoothScrollTo('testimonials-section')}>Stories</a>
                        <div className='flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 w-full justify-center'><a href="/login" className="rounded-lg px-4 py-2 font-medium">Log in</a><a href="/register" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white">Register</a></div><ThemeSwitcher theme={theme} setTheme={setTheme} />
                    </nav></motion.div>)}</AnimatePresence>
            </header>

            <main>
                <section id="hero-section" className="relative isolate flex min-h-screen items-center justify-center overflow-hidden">
                    <ParticleBackground />
                    <motion.img src="/images/Logo.png" alt="Logo Background" className="absolute inset-0 w-full h-full object-contain opacity-[0.20] dark:opacity-[0.10] blur-[2px]" initial={{ scale: 1.1, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1.5, ease: "circOut" }}/>
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-950 -z-5"></div>
                    <div className="relative text-center p-6 z-10 flex flex-col items-center">
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="mb-4 text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">CHED Region IX Scholarship Portal</motion.div>
                        <motion.h1 variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="text-5xl font-extrabold tracking-tight md:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">FORTIS Scholarship</motion.h1>
                        <motion.p variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300">Your guide and assistance to building a brighter future. Apply for scholarships in the Zamboanga Peninsula.</motion.p>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <a href="/register" className="group rounded-lg bg-cyan-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-cyan-500 hover:shadow-cyan-500/30 hover:scale-105">Apply Now <span className="inline-block transition-transform group-hover:translate-x-1">→</span></a>
                            <a onClick={() => smoothScrollTo('about-section')} className="cursor-pointer rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm px-8 py-3.5 font-semibold text-slate-800 dark:text-white shadow-lg transition hover:scale-105 hover:bg-white dark:hover:bg-white/20">Learn More</a>
                        </motion.div>
                    </div>
                </section>
                
                <motion.section id="about-section" className="py-24 sm:py-32" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <div className="container mx-auto px-6">
                        <div className="text-center"><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Empowering Dreams Through Education</h2><p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">The <strong>FORTIS</strong> system is a landmark initiative by CHED - Region IX to bridge the gap between deserving students and transformative educational opportunities.</p></div>
                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            <motion.div variants={itemVariants}><div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400">1,500+</div><p className="mt-2 text-slate-500 dark:text-slate-400">Active Scholars</p></motion.div>
                            <motion.div variants={itemVariants}><div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400">50+</div><p className="mt-2 text-slate-500 dark:text-slate-400">Partner Institutions</p></motion.div>
                            <motion.div variants={itemVariants}><div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400">₱200M+</div><p className="mt-2 text-slate-500 dark:text-slate-400">Disbursed Annually</p></motion.div>
                        </div>
                    </div>
                </motion.section>

                <motion.section id="how-it-works" className="py-24 sm:py-32 bg-slate-100 dark:bg-slate-900" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20"><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">A Simplified Application Journey</h2><p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">We've streamlined our process into three clear steps to make your application as smooth as possible.</p></div>
                        <div className="relative">
                            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                                <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                    <div className="relative mb-6 flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-lg border-4 border-slate-100 dark:border-slate-900"><UserPlusIcon /><div className="absolute -top-3 -right-3 flex items-center justify-center h-8 w-8 rounded-full bg-cyan-600 text-white font-bold text-sm">1</div></div>
                                    <h3 className="text-xl font-semibold mb-2">Create Account</h3><p>Sign up and build your personal scholarship profile in minutes.</p>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                    <div className="relative mb-6 flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-lg border-4 border-slate-100 dark:border-slate-900"><DocumentTextIcon /><div className="absolute -top-3 -right-3 flex items-center justify-center h-8 w-8 rounded-full bg-cyan-600 text-white font-bold text-sm">2</div></div>
                                    <h3 className="text-xl font-semibold mb-2">Submit Documents</h3><p>Complete the application form and upload all required documents securely.</p>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                    <div className="relative mb-6 flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-lg border-4 border-slate-100 dark:border-slate-900"><CheckCircleIcon /><div className="absolute -top-3 -right-3 flex items-center justify-center h-8 w-8 rounded-full bg-cyan-600 text-white font-bold text-sm">3</div></div>
                                    <h3 className="text-xl font-semibold mb-2">Get Verified</h3><p>Track your application status and receive notifications on your dashboard.</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.section>

<section id="track-section" className="py-24 sm:py-32">
    <div className="container mx-auto px-6"><TrackApplication /></div>
</section>

                <motion.section id="announcements-section" className="py-24 sm:py-32 bg-slate-100 dark:bg-slate-900" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16"><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Latest Updates & Announcements</h2><p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Stay informed with the latest news, deadlines, and events from CHED Region IX.</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {announcements.map((item, index) => (
                                <motion.div variants={itemVariants} key={index} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-4 mb-4"><NewspaperIcon className="text-cyan-500 w-8 h-8 flex-shrink-0" /><p className="text-sm text-slate-500 dark:text-slate-400">{item.date}</p></div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">{item.content}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
                
                <motion.section id="testimonials-section" className="py-24 sm:py-32" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16"><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Stories from Our Scholars</h2><p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Hear from students whose lives have been changed through the FORTIS program.</p></div>
                        <div className="relative max-w-4xl mx-auto">
                            <div className="overflow-hidden relative h-80">
                                <AnimatePresence initial={false}>
                                    <motion.div key={currentTestimonial} initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-lg italic text-center text-slate-700 dark:text-slate-300">"{testimonials[currentTestimonial].quote}"</p>
                                        <div className="flex items-center mt-6">
                                            <img className="h-14 w-14 rounded-full" src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].author}/>
                                            <div className="ml-4 text-left"><div className="font-semibold text-slate-900 dark:text-white">{testimonials[currentTestimonial].author}</div><div className="text-slate-500 dark:text-slate-400 text-sm">FORTIS Scholar</div></div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <button onClick={prevTestimonial} aria-label="Previous testimonial" className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-md hover:scale-110 transition"><ChevronLeftIcon/></button>
                            <button onClick={nextTestimonial} aria-label="Next testimonial" className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-md hover:scale-110 transition"><ChevronRightIcon/></button>
                        </div>
                    </div>
                </motion.section>

                <motion.section id="contact" className="py-24 px-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <div className="container mx-auto text-center"><motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight sm:text-5xl">Ready to Start Your Journey?</motion.h2><motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-cyan-100">Don't miss the opportunity to secure your future. Create an account and apply today.</motion.p><motion.div variants={itemVariants} className="mt-10"><a href="/register" className="rounded-lg bg-white px-8 py-3.5 font-semibold text-cyan-700 shadow-2xl transition-transform hover:scale-105 hover:bg-slate-50">Create My Account</a></motion.div></div>
                </motion.section>
            </main>

            <footer className="bg-slate-950 text-slate-400 py-16 px-6">
                <div className="container mx-auto text-center">
                    <img src="/images/Logo.png" alt="FORTIS Logo" className="h-10 w-10 mx-auto mb-4" />
                    <p className="font-semibold text-white">Commission on Higher Education - Region IX</p>
                    <p className="text-sm mt-2">&copy; {new Date().getFullYear()} FORTIS Scholarship Management System. All rights reserved.</p>
                </div>
            </footer>
            
            <AIChatbot />
        </div>
    );
}


