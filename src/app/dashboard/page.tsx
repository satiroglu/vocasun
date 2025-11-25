'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, LogOut, BookOpen, Trophy, TrendingUp, Activity, Settings, Clock } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [recentWords, setRecentWords] = useState<any[]>([]); // Son öğrenilenler
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

            // 2. Son Çalışılan Kelimeleri Çek (Relational Query)
            // user_progress tablosundan vocabulary verilerini de çekiyoruz
            const { data: progressData } = await supabase
                .from('user_progress')
                .select(`
          updated_at,
          is_mastered,
          vocabulary ( word, meaning )
        `)
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(5); // Son 5 kelime

            if (progressData) setRecentWords(progressData);
            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
                    {/* MOBİL DÜZELTME: 'hidden sm:inline' yerine sadece 'font-bold' */}
                    <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 hover:opacity-80 transition">
                        <Sun className="w-8 h-8" />
                        <span className="font-bold text-xl">Vocasun</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-800">{profile?.username}</div>
                            <div className="text-xs text-slate-500 font-medium">{profile?.total_xp} XP</div>
                        </div>
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
                        <div className="flex gap-3">
                            <Link href="/learn" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg active:scale-95">
                                <BookOpen size={20} /> Çalış
                            </Link>
                            <Link href="/leaderboard" className="inline-flex items-center gap-2 bg-indigo-700/50 text-white border border-indigo-400/30 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                                <Trophy size={20} /> Sıralama
                            </Link>
                        </div>
                    </div>
                    <Sun className="absolute -right-10 -top-10 text-white opacity-10 w-64 h-64 rotate-12" />
                </section>

                {/* İstatistikler */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Trophy className="text-yellow-600" />} label="Toplam Puan" value={`${profile?.total_xp || 0} XP`} bg="bg-yellow-50" />
                    <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Seviye" value={profile?.level || 1} bg="bg-emerald-50" />
                    <StatCard icon={<Activity className="text-blue-600" />} label="Öğrenilen" value={`${recentWords.length} Kelime`} bg="bg-blue-50" />
                </div>

                {/* Son Çalışılan Kelimeler (GEÇMİŞ LOGU) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" /> Son Çalışılanlar
                    </h3>
                    {recentWords.length > 0 ? (
                        <div className="space-y-3">
                            {recentWords.map((item: any, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <span className="font-bold text-slate-800 block capitalize">{item.vocabulary?.word}</span>
                                        <span className="text-xs text-slate-500 capitalize">{item.vocabulary?.meaning}</span>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${item.is_mastered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.is_mastered ? 'Ezberlendi' : 'Çalışılıyor'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Henüz bir kelime çalışmadın. Hadi başlayalım!</p>
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