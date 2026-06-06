'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Stale time: 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache time: 10 minutes
                gcTime: 10 * 60 * 1000,
                // Retry failed requests 3 times
                retry: 3,
                // Refetch on window focus (useful for live matches)
                refetchOnWindowFocus: true,
                // Refetch on reconnect
                refetchOnReconnect: true,
            },
            mutations: {
                // Retry mutations once
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Only show devtools in development */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
