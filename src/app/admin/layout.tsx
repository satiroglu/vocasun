'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Get page title based on path
    const getPageTitle = () => {
        if (pathname === '/admin') return 'Genel Bakış';
        if (pathname.includes('/users')) return 'Kullanıcılar';
        if (pathname.includes('/words')) return 'Kelimeler';
        return 'Admin Paneli';
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-gray-800">
                    {children}
                </main>
            </div>
        </div>
    );
}
