'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Sun, Menu, X, LogOut,
    LayoutDashboard, BookOpen, Trophy, Settings, HelpCircle, User
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import Logo from '@/components/Logo';

export default function Navbar() {
    const { user, loading } = useUser(); // Optimize edilmiş auth hook
    const { data: profile } = useProfile(user?.id); // Optimize edilmiş profil hook (cache'li)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Sayfa değiştiğinde mobil menüyü kapat
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const getDisplayName = () => {
        if (!profile) return 'Yükleniyor...';
        if (profile.display_name_preference === 'fullname' && profile.first_name) {
            return `${profile.first_name} ${profile.last_name || ''}`;
        }
        return profile.username || profile.first_name || user?.email?.split('@')[0] || 'Öğrenci';
    };

    const navLinks = [
        { name: 'Panel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Öğren', href: '/learn', icon: BookOpen },
        { name: 'Liderlik', href: '/leaderboard', icon: Trophy },
        { name: 'Nasıl?', href: '/info', icon: HelpCircle },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    // Auth sayfalarında ve Learn sayfasında navbar gösterme
    const hiddenPages = ['/login', '/register', '/forgot-password', '/update-password', '/learn'];
    if (hiddenPages.includes(pathname)) return null;

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300 h-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full">
                <div className="flex justify-between items-center h-full">

                    {/* --- SOL: LOGO --- */}
                    <div className="z-50 shrink-0">
                        <Logo
                            href={user ? "/dashboard" : "/"}
                            className="!text-xl sm:!text-2xl"
                            iconSize={28}
                        />
                    </div>

                    {/* --- ORTA: DESKTOP MENÜ --- */}
                    {user && (
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
                    )}

                    {/* --- SAĞ: PROFİL / GİRİŞ (Desktop) --- */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        {loading ? (
                            // Loading State
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="flex items-center gap-3 bg-slate-50/80 p-1.5 pr-4 rounded-xl border border-slate-100/50 animate-pulse">
                                    <div className="w-9 h-9 bg-slate-200 rounded-xl"></div>
                                    <div className="hidden lg:block space-y-1">
                                        <div className="w-20 h-3 bg-slate-200 rounded"></div>
                                        <div className="w-12 h-2 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <Link
                                    href={profile?.username ? `/profile/${profile.username}` : '/dashboard'}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group p-1.5 pr-4 rounded-xl"
                                >
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:border-indigo-300 transition-colors overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={getDisplayName()} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={18} className="text-indigo-600" />
                                        )}
                                    </div>

                                    <div className="text-left hidden lg:block leading-tight">
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{getDisplayName()}</div>
                                        <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                            {profile ? `Seviye ${profile.level}` : '...'}
                                        </div>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors group"
                                    title="Çıkış Yap"
                                >
                                    <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 transition">
                                    Giriş Yap
                                </Link>
                                <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-slate-900/20 active:scale-95">
                                    Ücretsiz Başla
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* --- MOBİL MENÜ BUTONU (Hamburger / X) --- */}
                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                            aria-label="Menüyü Aç/Kapat"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MOBİL DROPDOWN MENÜ --- */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    {/* Menü İçeriği */}
                    <div className="fixed top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 md:hidden animate-in slide-in-from-top-5 fade-in duration-200">
                        <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col gap-3 mt-2 animate-pulse">
                                    <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
                                    <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
                                </div>
                            ) : user ? (
                                <>
                                    <Link
                                        href={profile?.username ? `/profile/${profile.username}` : '/dashboard'}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 hover:bg-slate-100 transition-colors active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm text-indigo-600 flex items-center justify-center overflow-hidden border border-slate-100">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt={getDisplayName()} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{getDisplayName()}</div>
                                            <div className="text-xs font-medium text-slate-500">{profile ? `Seviye ${profile.level}` : '...'}</div>
                                        </div>
                                    </Link>

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

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut size={20} /> Çıkış Yap
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 mt-2">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3.5 rounded-xl font-bold text-slate-700 border border-slate-200 hover:bg-slate-50">
                                        Giriş Yap
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg active:scale-95">
                                        Hemen Başla
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}