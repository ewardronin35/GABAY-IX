import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(): [Theme, () => void] {
    // Initialize state from localStorage or system preference
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = window.localStorage.getItem('theme') as Theme;
            if (storedTheme) {
                return storedTheme;
            }
            // Check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light'; // Default for server-side rendering
    });

    // Effect to apply the theme class to the <html> element
    useEffect(() => {
        const root = window.document.documentElement;
        
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);

        // Save the theme to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Toggle function
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return [theme, toggleTheme];
}