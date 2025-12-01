'use client';

import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Get page title based on path
    const getPageTitle = () => {
        if (pathname === '/admin') return 'Genel Bakış';
        if (pathname.includes('/users')) return 'Kullanıcılar';
        if (pathname.includes('/words')) return 'Kelimeler';
        return 'Admin Paneli';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <AdminNavbar />
            <main className="pt-20 pb-12 px-4 sm:px-6">
                {children}
            </main>
        </div>
    );
}
