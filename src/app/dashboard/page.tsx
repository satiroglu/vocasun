'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, TrendingUp, Clock, ChevronRight, Volume2, BookOpen, Sun, Target, Zap, Sparkles } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { data, isLoading: dashboardLoading } = useDashboard(user?.id);

    // Auth check handled by AuthGuard in layout

    const loading = userLoading || dashboardLoading;
    const profile = data?.profile;
    const recentWords = data?.recentWords || [];
    const dailyProgress = data?.dailyProgress || 0;

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (diffInSeconds < 60) return 'Az önce';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} sa önce`;
        return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    };

    const playAudio = (e: React.MouseEvent, url: string | undefined, text: string) => {
        e.preventDefault();
        e.stopPropagation(); // Tıklamanın üst elemanlara geçmesini engelle
        if (url) new Audio(url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const getDisplayName = () => {
        if (!profile) return 'Öğrenci';
        if (profile.display_name_preference === 'fullname' && profile.first_name) {
            return profile.first_name;
        }
        return profile.username || profile.first_name || 'Öğrenci';
    };

    // Skeleton Loading
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center pt-24 px-4 bg-slate-50">
            <div className="w-full max-w-5xl space-y-8 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                    <div className="h-32 bg-slate-200 rounded-xl"></div>
                </div>
                <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-20 pb-20">
            <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-8">

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-6 sm:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-100 mb-4">
                            <Sparkles size={14} /> Günün Sözü
                        </div>
                        <h1 className="text-2xl sm:text-5xl font-bold mb-4 tracking-tight">Hoş geldin, {getDisplayName()}! 👋</h1>
                        <p className="text-indigo-100 mb-10 max-w-lg text-base sm:text-lg leading-relaxed">Bugünkü hedefine ulaşmak için harika bir zaman. Hadi kelime hazineni geliştirelim!</p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/learn" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:-translate-y-1">
                                <BookOpen size={22} /> Öğrenmeye Başla
                            </Link>
                            <Link
                                href="/leaderboard"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all shadow-lg active:scale-95 hover:-translate-y-1"
                            >
                                <Trophy size={22} className="text-yellow-300" />
                                Liderlik Tablosu
                            </Link>
                        </div>
                    </div>

                    {/* Background Decorations */}
                    <Sun className="absolute -right-12 -top-12 text-white opacity-10 w-80 h-80 rotate-12 group-hover:rotate-[20deg] transition-transform duration-1000" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-30"></div>
                </section>

                {/* İstatistikler Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Günlük Hedef Kartı */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group col-span-2">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <Target className="text-indigo-600" size={20} /> Günlük Hedef
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    Bugün <span className="font-bold text-slate-900">{dailyProgress}</span> / {profile?.daily_goal || 20} kelime
                                </p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-2">
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${Math.min((dailyProgress / (profile?.daily_goal || 20)) * 100, 100)}%` }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-full bg-white/30 animate-shimmer"></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                                <span>0</span>
                                <span>%{Math.round((dailyProgress / (profile?.daily_goal || 20)) * 100)} Tamamlandı</span>
                                <span>{profile?.daily_goal || 20}</span>
                            </div>
                        </div>
                    </div>

                    {/* Toplam XP */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Trophy size={24} />
                            </div>
                            <div className="font-bold text-slate-400 text-sm">Toplam Puan</div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800">{profile?.total_xp || 0} <span className="text-sm text-slate-400 font-medium">XP</span></div>
                    </div>

                    {/* Seviye */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div className="font-bold text-slate-400 text-sm">Seviye</div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800">{profile?.level || 1} <span className="text-sm text-slate-400 font-medium">. Lvl</span></div>
                    </div>
                </div>

                {/* Son Aktiviteler */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Son Aktiviteler</h2>
                                <p className="text-slate-500 text-sm">Çalıştığın son kelimeler.</p>
                            </div>
                        </div>
                        {recentWords.length > 0 && (
                            <Link href="/history" className="group flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition w-full sm:w-auto">
                                Tümünü Gör <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>

                    {recentWords.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentWords.map((item, i) => (
                                <div key={i} className="group p-5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${item.is_mastered ? 'bg-green-500 shadow-green-200 shadow-lg' : 'bg-amber-500 shadow-amber-200 shadow-lg'}`}></div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">{item.vocabulary?.word}</h3>
                                            <button
                                                onClick={(e) => playAudio(e, item.vocabulary?.audio_url, item.vocabulary?.word)}
                                                className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                            {timeAgo(item.updated_at)}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-sm mb-4 pl-6">{item.vocabulary?.meaning}</p>

                                    <div className="pl-6 border-l-2 border-slate-200 ml-1.5 space-y-1">
                                        <p className="text-xs text-slate-500 italic">"{item.vocabulary?.example_en}"</p>
                                        <p className="text-xs text-slate-400">{item.vocabulary?.example_tr}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Henüz kelime çalışılmadı</h3>
                            <p className="text-slate-500 mb-6 max-w-xs mx-auto">Öğrenme yolculuğuna başlamak için harika bir gün!</p>
                            <Link href="/learn" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
                                İlk kelimeni öğren <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div >
    );
}