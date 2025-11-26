// src/app/profile/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';
import { User, Trophy, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function UserProfile() {
    const params = useParams();
    const username = params.username as string;
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Username ile profil bul
            // Not: Supabase'de username sütunu unique olmalıdır.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [username]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20">Yükleniyor...</div>;

    if (!profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
            <h2 className="text-2xl font-bold text-slate-800">Kullanıcı Bulunamadı</h2>
            <Link href="/dashboard"><Button variant="outline">Anasayfaya Dön</Button></Link>
        </div>
    );

    // İsim Gösterimi (Gizlilik ayarına göre)
    const displayName = profile.display_name_preference === 'fullname' && profile.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`
        : profile.username;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                {/* Profil Kartı */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100 border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>

                    <div className="relative z-10">
                        <div className="w-32 h-32 mx-auto bg-white rounded-full p-1.5 shadow-lg mb-4">
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={displayName || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
                                )}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{displayName}</h1>
                        <p className="text-slate-500 font-medium mb-6">@{profile.username}</p>

                        {profile.bio && (
                            <p className="text-slate-600 mb-8 max-w-md mx-auto italic">"{profile.bio}"</p>
                        )}

                        {/* İstatistikler Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase"><Trophy size={14} /> Toplam XP</div>
                                <div className="text-xl font-black text-indigo-600">{profile.total_xp}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase"><Target size={14} /> Seviye</div>
                                <div className="text-xl font-black text-purple-600">{profile.level}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase"><Calendar size={14} /> Katılım</div>
                                <div className="text-sm font-bold text-slate-700">
                                    {new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}