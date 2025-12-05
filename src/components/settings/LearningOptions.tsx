import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Target, Languages, List, CheckCircle, TrendingUp, Save, Volume2 } from 'lucide-react';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';
// 1. useQueryClient'i import et
import { useQueryClient } from '@tanstack/react-query';

interface LearningOptionsProps {
    userData: {
        id: string;
        dailyGoal: number;
        preferredWordList: string;
        difficultyLevel: string;
        accent: string;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function LearningOptions({ userData, showMessage }: LearningOptionsProps) {
    const { refreshUser } = useUser();
    const [formData, setFormData] = useState(userData);
    const [saving, setSaving] = useState(false);
    const [vocabSets, setVocabSets] = useState<{ id: number; title: string; slug: string; description: string | null }[]>([]);

    // 2. QueryClient'ı başlat
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const fetchVocabSets = async () => {
            const { data } = await supabase
                .from('vocabulary_sets')
                .select('id, title, slug, description')
                .eq('is_active', true);

            if (data) {
                setVocabSets(data);
                if (!userData.preferredWordList && data.find(s => s.slug === 'general')) {
                    setFormData(prev => ({ ...prev, preferredWordList: 'general' }));
                }
            }
        };
        fetchVocabSets();
    }, [userData.preferredWordList]);

    const saveLearning = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    daily_goal: formData.dailyGoal,
                    preferred_word_list: [formData.preferredWordList],
                    difficulty_level: formData.difficultyLevel,
                    accent_preference: formData.accent
                })
                .eq('id', formData.id);
            if (error) throw error;

            // 3. Kritik Güncellemeler Burada:

            // A. Kullanıcı context'ini güncelle (Aksan vb. için)
            await refreshUser();

            // B. React Query Cache'ini Temizle (Kelime sayısı ve oturum için)
            // Bu satır, /learn sayfasına gidildiğinde verinin sunucudan TEKRAR çekilmesini sağlar.
            await queryClient.invalidateQueries({ queryKey: ['learn-session'] });

            // İsteğe bağlı: Profil verisini kullanan diğer sorguları da tazeleyelim
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            showMessage('success', 'Öğrenim ayarları kaydedildi.');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
            showMessage('error', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={24} /></div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Öğrenim Seçenekleri</h2>
                    <p className="text-sm text-slate-500">Öğrenme deneyimini kişiselleştir.</p>
                </div>
            </div>

            {/* Günlük Kelime Hedefi */}
            <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                    <Target size={20} className="text-indigo-600" />
                    <label className="block text-sm font-bold text-slate-800">Günlük Kelime Hedefi</label>
                </div>
                <div className="flex items-center gap-4 mb-2">
                    <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={formData.dailyGoal}
                        onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                        className="w-full h-2.5 bg-white rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                    />
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-200 min-w-[60px] text-center">
                        <span className="font-bold text-indigo-600 text-lg">{formData.dailyGoal}</span>
                    </div>
                </div>
                <p className="text-xs text-indigo-700 ml-1">Her gün {formData.dailyGoal} kelime çalışmayı hedefle.</p>
            </div>

            {/* Aksan Seçimi */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Languages size={20} className="text-indigo-600" />
                    <label className="block text-sm font-bold text-slate-800">Aksan Tercihi</label>
                </div>
                <p className="text-xs text-slate-500 mb-3 ml-7">Kelime telaffuzlarında duymak istediğin aksanı seç.</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'US', label: 'Amerikan' },
                        { value: 'UK', label: 'İngiliz' },
                    ].map(accent => (
                        <div
                            key={accent.value}
                            onClick={() => setFormData({ ...formData, accent: accent.value })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.accent === accent.value
                                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${formData.accent === accent.value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <Volume2 size={20} />
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">{accent.label}</div>
                                </div>
                                {formData.accent === accent.value && <CheckCircle size={20} className="text-indigo-600" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kelime Listesi Seçimi */}
            <div className="mb-6 relative">
                <div className="flex items-center gap-2 mb-1">
                    <List size={20} className="text-indigo-600" />
                    <label className="block text-sm font-bold text-slate-800">Çalışılacak Kelime Listesi</label>
                </div>
                <p className="text-xs text-slate-500 mb-3 ml-7">Günlük çalışmalarında karşına çıkacak kelime havuzunu belirle.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vocabSets.map(set => (
                        <div
                            key={set.slug}
                            onClick={() => setFormData({ ...formData, preferredWordList: set.slug })}
                            className={`p-4 rounded-xl border-2 transition-all relative cursor-pointer ${formData.preferredWordList === set.slug
                                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-2xl">📚</span>
                                {formData.preferredWordList === set.slug && <CheckCircle size={18} className="text-indigo-600" />}
                            </div>
                            <div className="font-bold text-slate-800 text-sm mb-0.5">{set.title}</div>
                            <div className="text-xs text-slate-500">{set.description || 'Kelime listesi'}</div>
                        </div>
                    ))}

                    {[
                        { value: 'academic', label: 'Akademik', desc: 'Üniversite ve akademik metinler', icon: '🎓' },
                        { value: 'toefl', label: 'TOEFL', desc: 'TOEFL sınavına yönelik', icon: '📝' },
                        { value: 'ielts', label: 'IELTS', desc: 'IELTS sınavına yönelik', icon: '📋' },
                    ].map(list => (
                        <div
                            key={list.value}
                            className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed relative"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-2xl">{list.icon}</span>
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">YAKINDA</span>
                            </div>
                            <div className="font-bold text-slate-800 text-sm mb-0.5">{list.label}</div>
                            <div className="text-xs text-slate-500">{list.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zorluk Seviyesi - YAKINDA */}
            <div className="mb-6 relative">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={20} className="text-slate-400" />
                    <label className="block text-sm font-bold text-slate-400">Zorluk Seviyesi</label>
                    <span className="ml-auto px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">YAKINDA</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 ml-7">Karşına çıkacak kelimelerin zorluk derecesini ayarla.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-50 pointer-events-none">
                    {[
                        { value: 'beginner', label: 'Başlangıç', color: 'green' },
                        { value: 'intermediate', label: 'Orta', color: 'yellow' },
                        { value: 'advanced', label: 'İleri', color: 'red' },
                        { value: 'mixed', label: 'Karışık', color: 'indigo' },
                    ].map(level => (
                        <div
                            key={level.value}
                            className={`p-3 rounded-xl border-2 text-center ${formData.difficultyLevel === level.value
                                ? `border-${level.color}-500 bg-${level.color}-50`
                                : 'border-slate-200'
                                }`}
                        >
                            <div className="font-bold text-sm text-slate-800">{level.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
                <Button onClick={saveLearning} variant="soft" isLoading={saving} icon={!saving && <Save size={18} />}>
                    Öğrenim Ayarlarını Kaydet
                </Button>
            </div>
        </section>
    );
}