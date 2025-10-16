import { useState, useEffect } from 'react';

// This function runs synchronously to get the theme on the initial render
const getInitialTheme = (): 'ht-theme-horizon' | 'ht-theme-horizon-dark' => {
    // Check if the code is running in a browser environment
    if (typeof window !== 'undefined' && document.documentElement) {
        return document.documentElement.classList.contains('dark')
            ? 'ht-theme-horizon-dark'
            : 'ht-theme-horizon';
    }
    // Default for server-side or initial hydration
    return 'ht-theme-horizon';
};

export const useHandsontableTheme = () => {
    // ✨ UPDATE: Initialize state with the correct theme from the start
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const rootElement = document.documentElement;

        const handleThemeChange = () => {
            const isDarkMode = rootElement.classList.contains('dark');
            setTheme(isDarkMode ? 'ht-theme-horizon-dark' : 'ht-theme-horizon');
        };

        // Set up the observer to watch for future changes
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(rootElement, { attributes: true, attributeFilter: ['class'] });

        // Clean up the observer
        return () => {
            observer.disconnect();
        };
    }, []); // This effect still only runs once to set up the watcher

    return theme;
};