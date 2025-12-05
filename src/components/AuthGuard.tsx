// src/components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Yükleme bitti, kullanıcı yok ve login sayfasında değilsek yönlendir
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        // İsteğe bağlı: Global bir loading komponenti veya null dönebilirsiniz
        // Navbar layout.tsx içinde olduğu için buradaki loading sadece içerik kısmını etkiler.
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting...
    }

    return <>{children}</>;
}