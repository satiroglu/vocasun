'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';

import SettingsSidebar from '@/components/settings/SettingsSidebar';
import PersonalInfo from '@/components/settings/PersonalInfo';
import LearningOptions from '@/components/settings/LearningOptions';
import AppearancePreferences from '@/components/settings/AppearancePreferences';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DangerZone from '@/components/settings/DangerZone';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('personal');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Veriler
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: '',
        dailyGoal: 20,
        preferredWordList: 'general',
        difficultyLevel: 'mixed',
        accent: 'american',
        displayPreference: 'username',
        leaderboardVisibility: 'visible',
        emailNotifications: true,
        marketingEmails: false
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            setFormData({
                id: user.id,
                firstName: data?.first_name || '',
                lastName: data?.last_name || '',
                username: data?.username || '',
                email: user.email || '',
                dailyGoal: data?.daily_goal || 20,
                bio: data?.bio || '',
                displayPreference: data?.display_name_preference || 'username',
                leaderboardVisibility: data?.leaderboard_visibility || 'visible',
                preferredWordList: data?.preferred_word_list || 'general',
                difficultyLevel: data?.difficulty_level || 'mixed',
                accent: 'american',
                emailNotifications: true,
                marketingEmails: false
            });
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const SettingsSkeleton = () => (
        <div className="w-full max-w-3xl space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg mb-8"></div>
            <div className="bg-white p-8 rounded-xl border border-slate-100 h-64"></div>
        </div>
    );

    if (loading) return <div className="min-h-screen pt-20 flex justify-center bg-slate-50"><SettingsSkeleton /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

                {/* Main Content */}
                <div className="flex-1">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 mt-4 lg:mt-0">
                            <h1 className="text-3xl font-bold text-slate-900">Hesap Ayarları</h1>
                            <p className="text-slate-500">Profilini ve tercihlerini yönet.</p>
                        </div>

                        {/* Global Mesaj */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-shake sticky top-24 z-30 shadow-xl ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                <span className="font-medium">{message.text}</span>
                            </div>
                        )}

                        <div className="space-y-8">
                            {activeSection === 'personal' && (
                                <PersonalInfo userData={formData} showMessage={showMessage} />
                            )}
                            {activeSection === 'learning' && (
                                <LearningOptions userData={formData} showMessage={showMessage} />
                            )}
                            {activeSection === 'appearance' && (
                                <AppearancePreferences userData={formData} showMessage={showMessage} />
                            )}
                            {activeSection === 'notifications' && (
                                <NotificationSettings userData={formData} showMessage={showMessage} />
                            )}
                            {activeSection === 'security' && (
                                <SecuritySettings userData={formData} showMessage={showMessage} />
                            )}
                            {activeSection === 'danger' && (
                                <DangerZone userData={formData} showMessage={showMessage} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
