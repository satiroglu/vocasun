'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Sun, Menu, X, LogOut,
    LayoutDashboard, BookOpen, Trophy, Settings, HelpCircle, User, Sparkles
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import Logo from '@/components/Logo';

export default function Navbar() {
    const { user, loading } = useUser(); // user artık profil bilgilerini de içeriyor (ExtendedUser)
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

    const getDisplayName = () => {
        if (!user) return 'Yükleniyor...';
        if (user.display_name_preference === 'fullname' && user.first_name) {
            return `${user.first_name} ${user.last_name || ''}`;
        }
        return user.username || user.first_name || user.email?.split('@')[0] || 'Öğrenci';
    };

    // Ana Navigasyon Linkleri (Desktop'ta bar üzerinde görünenler)
    const mainNavLinks = [
        { name: 'Panel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Öğren', href: '/learn', icon: BookOpen },
        { name: 'Kelimelerim', href: '/history', icon: BookOpen }, // History -> Kelimelerim olarak güncellendi
        { name: 'Liderlik', href: '/leaderboard', icon: Trophy },
        // { name: 'Cümle Kur', href: '#', icon: Sparkles, badge: 'YAKINDA', disabled: true }, // daha sonra aktifleştirilecek
    ];

    // Kullanıcı Menüsü Linkleri (Desktop'ta dropdown içinde, Mobil'de listede)
    const userMenuLinks = [
        { name: 'Profil', href: user?.username ? `/profile/${user.username}` : '/dashboard', icon: User },
        // { name: 'Nasıl?', href: '/info', icon: HelpCircle }, // Gizlendi
        { name: 'Yardım', href: '/help', icon: HelpCircle },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    // Auth sayfalarında, Learn sayfasında ve Admin sayfalarında navbar gösterme
    const hiddenPages = ['/login', '/register', '/forgot-password', '/update-password', '/learn', '/welcome'];
    if (hiddenPages.includes(pathname) || pathname.startsWith('/admin')) return null;

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

                    {/* --- ORTA: DESKTOP MENÜ (Sadece Ana Linkler) --- */}
                    {user && (
                        <div className="hidden md:flex items-center justify-center gap-1 flex-1">
                            {mainNavLinks.map((link) => {
                                const isActive = pathname === link.href;
                                // @ts-ignore
                                const isDisabled = link.disabled;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => isDisabled && e.preventDefault()}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap border group
                      ${isActive
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                : isDisabled
                                                    ? 'text-slate-400 cursor-not-allowed border-transparent opacity-80'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                                            }`}
                                    >
                                        <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        {link.name}
                                        {/* @ts-ignore */}
                                        {link.badge && (
                                            // @ts-ignore
                                            <span className={`absolute -top-2 -right-2 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm border border-white ${isDisabled ? 'bg-slate-500' : 'bg-indigo-600'}`}>
                                                {/* @ts-ignore */}
                                                {link.badge}
                                            </span>
                                        )}
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
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 relative user-menu-container">
                                {/* Kullanıcı Dropdown Tetikleyici */}
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center gap-3 hover:opacity-80 transition-all group p-1.5 pr-4 rounded-xl border ${isUserMenuOpen ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:border-indigo-300 transition-colors overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={getDisplayName()} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={18} className="text-indigo-600" />
                                        )}
                                    </div>

                                    <div className="text-left hidden lg:block leading-tight">
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{getDisplayName()}</div>
                                        <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                            {user ? `Seviye ${user.level}` : '...'}
                                        </div>
                                    </div>
                                </button>

                                {/* Dropdown Menü */}
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                        <div className="p-2 space-y-1">
                                            {userMenuLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <link.icon size={18} />
                                                    {link.name}
                                                </Link>
                                            ))}
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
                                    {/* Mobil Profil Özeti */}
                                    <Link
                                        href={user?.username ? `/profile/${user.username}` : '/dashboard'}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 hover:bg-slate-100 transition-colors active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm text-indigo-600 flex items-center justify-center overflow-hidden border border-slate-100">
                                            {user?.avatar_url ? (
                                                <img src={user.avatar_url} alt={getDisplayName()} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{getDisplayName()}</div>
                                            <div className="text-xs font-medium text-slate-500">{user ? `Seviye ${user.level}` : '...'}</div>
                                        </div>
                                    </Link>

                                    {/* Ana Linkler */}
                                    {mainNavLinks.map((link) => {
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

                                    {/* Kullanıcı Menüsü Linkleri (Mobilde devamı olarak) */}
                                    {userMenuLinks.map((link) => {
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