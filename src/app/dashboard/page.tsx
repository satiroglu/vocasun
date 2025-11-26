'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, LogOut, BookOpen, Trophy, TrendingUp, Activity, Settings, Clock, ChevronRight, Volume2, HelpCircle } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [recentWords, setRecentWords] = useState<any[]>([]);
    const [stats, setStats] = useState({ learnedCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            // 1. Profil Çek
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // 2. İstatistik Çek
            const { count } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_mastered', true);

            setStats({ learnedCount: count || 0 });

            // 3. Son Çalışılanlar (Sorguya örnek cümleler eklendi)
            const { data: progressData } = await supabase
                .from('user_progress')
                .select(`
                  updated_at,
                  is_mastered,
                  vocabulary ( word, meaning, audio_url, example_en, example_tr )
                `)
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (progressData) setRecentWords(progressData);
            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (diffInSeconds < 60) return 'Az önce';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} sa önce`;
        return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    };

    const playAudio = (e: React.MouseEvent, url: string, text: string) => {
        e.preventDefault();
        if (url) new Audio(url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 hover:opacity-80 transition">
                        <Sun className="w-8 h-8" />
                        <span className="font-bold text-xl">Vocasun</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-800">{profile?.username}</div>
                            <div className="text-xs text-slate-500 font-medium">{profile?.total_xp} XP</div>
                        </div>
                        <Link
                            href="/info"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Nasıl Çalışır?"
                        >
                            <HelpCircle size={20} />
                        </Link>
                        <Link href="/settings" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Settings size={20} /></Link>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><LogOut size={20} /></button>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Hoş geldin, {profile?.first_name}! 👋</h1>
                        <p className="text-indigo-100 mb-8 max-w-lg text-sm sm:text-base">Kelime hazinene yatırım yapmaya devam et.</p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/learn" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg active:scale-95">
                                <BookOpen size={20} /> Çalış
                            </Link>
                            <Link
                                href="/leaderboard"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-white/20 transition shadow-lg active:scale-95"
                            >
                                <Trophy size={20} className="text-yellow-300" /> {/* İkonu sarı yaptık */}
                                Liderlik Tablosu
                            </Link>
                        </div>
                    </div>
                    <Sun className="absolute -right-10 -top-10 text-white opacity-10 w-64 h-64 rotate-12" />
                </section>

                {/* İstatistikler */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Trophy className="text-yellow-600" />} label="Toplam Puan" value={`${profile?.total_xp || 0} XP`} bg="bg-yellow-50" />
                    <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Seviye" value={profile?.level || 1} bg="bg-emerald-50" />
                    <StatCard icon={<Activity className="text-blue-600" />} label="Öğrenilen" value={`${stats.learnedCount} Kelime`} bg="bg-blue-50" />
                </div>

                {/* Son Aktiviteler (GÜNCELLENDİ) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <Clock size={20} className="text-indigo-500" /> Son Aktiviteler
                        </h3>
                        {recentWords.length > 0 && (
                            <Link href="/history" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                Tümünü Gör <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>

                    {recentWords.length > 0 ? (
                        <div className="space-y-4">
                            {recentWords.map((item: any, i) => (
                                <div key={i} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-100">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${item.is_mastered ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                    {item.vocabulary?.word}
                                                    <button onClick={(e) => playAudio(e, item.vocabulary?.audio_url, item.vocabulary?.word)} className="text-slate-400 hover:text-indigo-500 transition">
                                                        <Volume2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="text-sm text-slate-500">{item.vocabulary?.meaning}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-400 mb-1">{timeAgo(item.updated_at)}</div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block uppercase tracking-wide ${item.is_mastered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.is_mastered ? 'Öğrenildi' : 'Çalışılıyor'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Örnek Cümleler */}
                                    <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-600 ml-5">
                                        <p className="mb-1">🇬🇧 {item.vocabulary?.example_en}</p>
                                        <p className="text-slate-500">🇹🇷 {item.vocabulary?.example_tr}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">Henüz kelime çalışılmadı.</div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, bg }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl ${bg} w-12 h-12 flex items-center justify-center`}>{icon}</div>
            <div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
}