import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Eye as EyeIcon, CheckCircle, Shield, Eye, EyeOff, User, Save } from 'lucide-react';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';

interface AppearancePreferencesProps {
    userData: {
        id: string;
        displayPreference: string;
        leaderboardVisibility: string;
        username: string;
        firstName: string;
        lastName: string;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function AppearancePreferences({ userData, showMessage }: AppearancePreferencesProps) {
    const { refreshUser } = useUser();
    const [formData, setFormData] = useState(userData);
    const [saving, setSaving] = useState(false);

    const saveAppearance = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name_preference: formData.displayPreference,
                    leaderboard_visibility: formData.leaderboardVisibility
                })
                .eq('id', formData.id);
            if (error) throw error;
            // KRİTİK NOKTA: Veritabanı güncellendi, şimdi arayüzü yenile
            await refreshUser();
            showMessage('success', 'Görünüm tercihleri kaydedildi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><EyeIcon size={24} /></div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Görünüm Tercihleri</h2>
                    <p className="text-sm text-slate-500">Liderlik tablosunda nasıl görüneceğini seç.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Seçenek 1: Kullanıcı Adı */}
                <div
                    onClick={() => setFormData({ ...formData, displayPreference: 'username' })}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2
            ${formData.displayPreference === 'username'
                            ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-500/10'
                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 font-bold">
                            @{formData.username || 'kullaniciadi'}
                        </div>
                        {formData.displayPreference === 'username' && <CheckCircle size={20} className="text-indigo-600" />}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">Kullanıcı Adı</div>
                        <div className="text-xs text-slate-500">Gerçek isminiz gizli kalır.</div>
                    </div>
                </div>

                {/* Seçenek 2: Ad Soyad */}
                <div
                    onClick={() => setFormData({ ...formData, displayPreference: 'fullname' })}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2
            ${formData.displayPreference === 'fullname'
                            ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-500/10'
                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 font-bold">
                            {formData.firstName} {formData.lastName}
                        </div>
                        {formData.displayPreference === 'fullname' && <CheckCircle size={20} className="text-indigo-600" />}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">Ad Soyad</div>
                        <div className="text-xs text-slate-500">Arkadaşlarınız sizi daha kolay bulur.</div>
                    </div>
                </div>
            </div>

            {/* Liderlik Tablosu Gizliliği */}
            <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-800">Liderlik Tablosu Gizliliği</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Liderlik tablosunda nasıl görünmek istediğini seç.</p>

                <div className="space-y-3">
                    {/* Görünür */}
                    <div
                        onClick={() => setFormData({ ...formData, leaderboardVisibility: 'visible' })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.leaderboardVisibility === 'visible'
                            ? 'border-green-500 bg-green-50/50'
                            : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Eye size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Görünür</div>
                                    <div className="text-xs text-slate-500">İsmim ve istatistiklerim görünsün</div>
                                </div>
                            </div>
                            {formData.leaderboardVisibility === 'visible' && (
                                <CheckCircle size={20} className="text-green-600" />
                            )}
                        </div>
                    </div>

                    {/* Anonim */}
                    <div
                        onClick={() => setFormData({ ...formData, leaderboardVisibility: 'anonymous' })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.leaderboardVisibility === 'anonymous'
                            ? 'border-amber-500 bg-amber-50/50'
                            : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Anonim</div>
                                    <div className="text-xs text-slate-500">"Gizli Kullanıcı" olarak görün</div>
                                </div>
                            </div>
                            {formData.leaderboardVisibility === 'anonymous' && (
                                <CheckCircle size={20} className="text-amber-600" />
                            )}
                        </div>
                    </div>

                    {/* Gizli */}
                    <div
                        onClick={() => setFormData({ ...formData, leaderboardVisibility: 'hidden' })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.leaderboardVisibility === 'hidden'
                            ? 'border-red-500 bg-red-50/50'
                            : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <EyeOff size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Liderlik Tablosunda Görünme</div>
                                    <div className="text-xs text-slate-500">Tamamen gizli kal</div>
                                </div>
                            </div>
                            {formData.leaderboardVisibility === 'hidden' && (
                                <CheckCircle size={20} className="text-red-600" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5 mt-6">
                <Button onClick={saveAppearance} isLoading={saving} variant="soft" icon={!saving && <Save size={18} />}>
                    Görünüm Ayarlarını Kaydet
                </Button>
            </div>
        </section>
    );
}
