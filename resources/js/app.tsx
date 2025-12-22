import './bootstrap'; 
import '../css/app.css';
import '../css/handsontable-theme.css'; 
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// ✨ 1. REMOVE this import
// import { Toaster } from "sonner"; 

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // ✨ 2. RENDER THE APP NORMALLY (no fragment or Toaster)
        root.render(
            <App {...props} />
        );
          delete el.dataset.page;
    },
  
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();