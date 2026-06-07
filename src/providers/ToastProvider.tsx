'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    backdropFilter: 'blur(10px)',
                },
                success: {
                    iconTheme: {
                        primary: '#4ade80',
                        secondary: '#000',
                    },
                    style: {
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#f87171',
                        secondary: '#000',
                    },
                    style: {
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                    },
                },
                loading: {
                    iconTheme: {
                        primary: '#a78bfa',
                        secondary: '#000',
                    },
                },
            }}
        />
    );
}
