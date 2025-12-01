'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Menu, X, LogOut,
    LayoutDashboard, BookOpen, Users, ArrowLeft, Shield
} from 'lucide-react';
import Logo from '@/components/Logo';

export function AdminNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Sayfa değiştiğinde menüleri kapat
    useEffect(() => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [pathname]);

    // Dışarı tıklandığında user menüyü kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu-container')) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const navLinks = [
        { name: 'Genel Bakış', href: '/admin', icon: LayoutDashboard },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
        { name: 'Kelimeler', href: '/admin/words', icon: BookOpen },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
                <div className="flex justify-between items-center h-full">

                    {/* --- SOL: LOGO --- */}
                    <div className="z-50 shrink-0 flex items-center gap-3">
                        <Logo
                            href="/admin"
                            className="!text-xl sm:!text-2xl"
                            iconSize={28}
                        />
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            ADMIN
                        </span>
                    </div>

                    {/* --- ORTA: DESKTOP MENÜ --- */}
                    <div className="hidden md:flex items-center justify-center gap-1 flex-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap border
                      ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                                        }`}
                                >
                                    <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* --- SAĞ: PROFİL / ÇIKIŞ (Desktop) --- */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 relative user-menu-container">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-3 hover:opacity-80 transition-all group p-1.5 pr-4 rounded-xl border ${isUserMenuOpen ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`}
                            >
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-indigo-300 transition-colors">
                                    <Shield size={18} className="text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="text-left hidden lg:block leading-tight">
                                    <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Yönetici</div>
                                </div>
                            </button>

                            {/* Dropdown Menü */}
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                    <div className="p-2 space-y-1">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        >
                                            <ArrowLeft size={18} />
                                            Siteye Dön
                                        </Link>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- MOBİL MENÜ BUTONU --- */}
                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MOBİL MENÜ --- */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="fixed top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 md:hidden animate-in slide-in-from-top-5 fade-in duration-200">
                        <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all
                                  ${isActive
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`
                                        }
                                    >
                                        <link.icon size={20} />
                                        {link.name}
                                    </Link>
                                )
                            })}

                            <div className="h-px bg-slate-100 my-2"></div>

                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                            >
                                <ArrowLeft size={20} />
                                Siteye Dön
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition"
                            >
                                <LogOut size={20} /> Çıkış Yap
                            </button>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
