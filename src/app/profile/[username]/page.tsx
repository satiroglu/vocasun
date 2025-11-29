'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Profile, UserProgress } from '@/types';
import { User, Trophy, Calendar, Target, BookOpen, Clock, Medal, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';

// Extended profile type to include stats
interface ProfileData extends Profile {
    learned_count?: number;
    recent_activity?: UserProgress[];
}

export default function UserProfile() {
    const params = useParams();
    const username = params.username as string;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);

            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();
            if (profileError || !profileData) {
                setLoading(false);
                return;
            }

            // 2. Fetch Learned Words Count
            const { count: learnedCount } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profileData.id)
                .eq('is_mastered', true);

            // 3. Fetch Recent Activity (Last 7 Days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { data: recentActivity } = await supabase
                .from('user_progress')
                .select(`
                    *,
                    vocabulary ( word, meaning )
                `)
                .eq('user_id', profileData.id)
                .gte('updated_at', oneWeekAgo.toISOString())
                .order('updated_at', { ascending: false })
                .limit(5);

            setProfile({
                ...profileData,
                learned_count: learnedCount || 0,
                recent_activity: recentActivity || []
            });
            setLoading(false);
        };

        if (username) {
            fetchProfileData();
        }
    }, [username]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20 bg-slate-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <User size={48} className="text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Kullanıcı Bulunamadı</h2>
                <p className="text-slate-500 mb-6">Aradığınız profil mevcut değil veya gizli olabilir.</p>
                <Link href="/dashboard"><Button className="w-full">Anasayfaya Dön</Button></Link>
            </div>
        </div>
    );

    // Display Name Logic
    const displayName = profile.display_name_preference === 'fullname' && profile.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`
        : profile.username;

    const joinDate = new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative">
                    {/* Banner */}
                    <div className="h-24 sm:h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <Sparkles className="w-full h-full text-white scale-150 rotate-12 translate-x-10 -translate-y-10" strokeWidth={0.5} />
                        </div>
                    </div>

                    <div className="px-6 sm:px-10 pb-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-12 sm:-top-20 left-6 sm:left-10">
                            <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={displayName || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-slate-300 sm:w-16 sm:h-16" />
                                )}
                            </div>
                        </div>

                        {/* Actions (Top Right) */}
                        <div className="flex justify-end pt-4 mb-10 sm:mb-0 sm:h-20">
                            {/* Placeholder for future actions like 'Follow' or 'Edit Profile' */}
                        </div>

                        {/* User Info */}
                        <div className="mt-2 sm:mt-2">
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1">{displayName}</h1>
                            <p className="text-slate-500 font-medium text-base sm:text-lg mb-4">@{profile.username}</p>

                            {profile.bio && (
                                <p className="text-slate-600 max-w-2xl text-sm sm:text-lg leading-relaxed mb-6">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium bg-slate-50 inline-flex px-3 py-1.5 rounded-xl border border-slate-100">
                                <Calendar size={14} />
                                <span>Katılım: {joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Trophy size={20} className="text-yellow-600" />}
                        label="Haftalık XP" // Değişti
                        value={profile.weekly_xp?.toLocaleString() || 0} // Değişti
                        color="bg-yellow-50 border-yellow-100"
                    />
                    <StatCard
                        icon={<Star size={20} className="text-orange-500" />} // İkon değişti
                        label="Toplam XP"
                        value={profile.total_xp.toLocaleString()}
                        color="bg-orange-50 border-orange-100"
                    />
                    <StatCard
                        icon={<Target size={20} className="text-purple-600" />}
                        label="Seviye"
                        value={profile.level}
                        color="bg-purple-50 border-purple-100"
                    />
                    <StatCard
                        icon={<BookOpen size={20} className="text-indigo-600" />}
                        label="Kelime"
                        value={profile.learned_count || 0}
                        color="bg-indigo-50 border-indigo-100"
                    />
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Son Aktiviteler</h2>
                    </div>

                    {profile.recent_activity && profile.recent_activity.length > 0 ? (
                        <div className="space-y-3">
                            {profile.recent_activity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${activity.is_mastered ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                        <div>
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {activity.vocabulary?.word}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {activity.vocabulary?.meaning}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {new Date(activity.updated_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p>Henüz bir aktivite yok.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
    return (
        <div className={`p-5 rounded-2xl border ${color} flex flex-col items-start justify-center gap-2 transition-transform hover:-translate-y-1`}>
            <div className="mb-1">{icon}</div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
        </div>
    );
}