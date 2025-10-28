// resources/js/components/InputError.tsx
import React from 'react';

export default function InputError({ message, className = '' }: { message?: string, className?: string }) {
    return message ? <p className={`text-sm text-red-600 dark:text-red-400 ${className}`}>{message}</p> : null;
}