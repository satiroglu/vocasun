'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 dakika - veriler 1 dk boyunca "fresh" kabul edilir
                gcTime: 5 * 60 * 1000, // 5 dakika - cache'de kalma süresi (eski adı: cacheTime)
                refetchOnWindowFocus: false, // Pencereye dönünce otomatik yenileme (isteğe bağlı)
                retry: 1, // Hata durumunda tekrar deneme sayısı
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

