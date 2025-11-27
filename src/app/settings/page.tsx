'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
    User, Lock, Mail, Save, AlertCircle,
    CheckCircle, Eye, EyeOff, Eye as EyeIcon, Trash2,
    AlertTriangle, Bell, Globe, Camera, Shield, BookOpen, Target, TrendingUp, List
} from 'lucide-react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Bölüm bazlı loading state'leri
    const [savingPersonal, setSavingPersonal] = useState(false);
    const [savingLearning, setSavingLearning] = useState(false);
    const [savingAppearance, setSavingAppearance] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingNotif, setSavingNotif] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

    // Veriler
    const [formData, setFormData] = useState({
        dailyGoal: 20,
        bio: '',
        id: '', firstName: '', lastName: '', username: '', email: '',
        displayPreference: 'username',
        leaderboardVisibility: 'visible', // 'visible', 'anonymous', 'hidden'
        preferredWordList: 'general', // 'general', 'academic', 'business', 'toefl', 'ielts'
        difficultyLevel: 'mixed', // 'beginner', 'intermediate', 'advanced', 'mixed'
        emailNotifications: true,
        marketingEmails: false
    });

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

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

    // --- FONKSİYONLAR (Aynı mantık korundu) ---
    const savePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPersonal(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    bio: formData.bio
                })
                .eq('id', formData.id);

            if (error) throw error;

            if (formData.email !== (await supabase.auth.getUser()).data.user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
                if (emailError) throw emailError;
                setEmailUpdateMsg('Yeni e-posta adresinize doğrulama bağlantısı gönderildi.');
            }
            showMessage('success', 'Kişisel bilgiler güncellendi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSavingPersonal(false);
        }
    };

    const saveLearning = async () => {
        setSavingLearning(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    daily_goal: formData.dailyGoal,
                    preferred_word_list: formData.preferredWordList,
                    difficulty_level: formData.difficultyLevel
                })
                .eq('id', formData.id);
            if (error) throw error;
            showMessage('success', 'Öğrenim ayarları kaydedildi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSavingLearning(false);
        }
    };

    const saveAppearance = async () => {
        setSavingAppearance(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name_preference: formData.displayPreference,
                    leaderboard_visibility: formData.leaderboardVisibility
                })
                .eq('id', formData.id);
            if (error) throw error;
            showMessage('success', 'Görünüm tercihleri kaydedildi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSavingAppearance(false);
        }
    };

    const saveNotifications = async () => {
        setSavingNotif(true);
        setTimeout(() => {
            showMessage('success', 'Bildirim ayarları güncellendi.');
            setSavingNotif(false);
        }, 800);
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            if (!passwords.current || !passwords.new) throw new Error("Alanları doldurun.");
            if (passwords.new.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
            if (passwords.new !== passwords.confirm) throw new Error("Yeni şifreler uyuşmuyor.");

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: passwords.current
            });
            if (loginError) throw new Error("Mevcut şifreniz hatalı.");

            const { error: updateError } = await supabase.auth.updateUser({ password: passwords.new });
            if (updateError) throw updateError;

            setPasswords({ current: '', new: '', confirm: '' });
            showMessage('success', 'Şifreniz başarıyla değiştirildi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteRequest = async () => {
        try {
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 14);
            const { error } = await supabase.from('profiles').update({ marked_for_deletion_at: deletionDate.toISOString() }).eq('id', formData.id);
            if (error) throw error;
            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true);
        } catch (error: any) {
            showMessage('error', "Hata: " + error.message);
        }
    };

    // --- SKELETON LOADING COMPONENT ---
    const SettingsSkeleton = () => (
        <div className="w-full max-w-3xl space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg mb-8"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 h-64"></div>
            ))}
        </div>
    );

    if (loading) return <div className="min-h-screen pt-20 flex justify-center bg-slate-50"><SettingsSkeleton /></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans pt-20 pb-20">

            <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Hesap Ayarları</h1>
                    <p className="text-slate-500">Profilini ve tercihlerini yönet.</p>
                </div>
            </div>

            <div className="w-full max-w-3xl space-y-8">

                {/* Global Mesaj */}
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-shake sticky top-24 z-30 shadow-xl ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                {/* 1. KİŞİSEL BİLGİLER & AVATAR */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><User size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Kişisel Bilgiler</h2>
                            <p className="text-sm text-slate-500">Profil bilgilerini ve fotoğrafını yönet.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                                <User size={32} className="text-slate-300" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition hover:scale-110">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="font-bold text-slate-800 text-sm">Profil Fotoğrafı</h3>
                            <p className="text-xs text-slate-500 mb-3">Liderlik tablosunda diğer kullanıcılar bu fotoğrafı görecek.</p>
                            <div className="flex justify-center sm:justify-start gap-2">
                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition">Fotoğraf Yükle</button>
                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-red-500 hover:border-red-200 hover:bg-red-50 transition">Kaldır</button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={savePersonalInfo}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                            <Input
                                label="Ad"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <Input
                                label="Soyad"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>

                        <div className="mb-5">
                            <Input
                                label="Kullanıcı Adı"
                                value={formData.username}
                                disabled
                                className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100"
                                icon={<span className="text-slate-400 text-sm font-bold">@</span>}
                            />
                        </div>

                        <div className="mb-8">
                            <Input
                                label="E-posta"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon={<Mail size={18} />}
                            />
                            {emailUpdateMsg && <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">{emailUpdateMsg}</p>}
                        </div>

                        <div className="mb-5">
                            <Input
                                label="Hakkımda (Bio)"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Kısaca kendinden bahset..."
                            />
                        </div>

                        <div className="flex justify-end border-t border-slate-50 pt-5">
                            <Button type="submit" variant="soft" isLoading={savingPersonal} icon={!savingPersonal && <Save size={18} />}>
                                Değişiklikleri Kaydet
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 2. ÖĞRENİM SEÇENEKLERİ */}
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

                    {/* Kelime Listesi Seçimi */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <List size={20} className="text-slate-600" />
                            <label className="block text-sm font-bold text-slate-800">Çalışılacak Kelime Listesi</label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { value: 'general', label: 'Genel Kelimeler', desc: 'Günlük hayatta kullanılan kelimeler', icon: '📚' },
                                { value: 'academic', label: 'Akademik', desc: 'Üniversite ve akademik metinler', icon: '🎓' },
                                { value: 'business', label: 'İş İngilizcesi', desc: 'İş hayatı ve profesyonel', icon: '💼' },
                                { value: 'toefl', label: 'TOEFL', desc: 'TOEFL sınavına yönelik', icon: '📝' },
                                { value: 'ielts', label: 'IELTS', desc: 'IELTS sınavına yönelik', icon: '📋' },
                            ].map(list => (
                                <div
                                    key={list.value}
                                    onClick={() => setFormData({ ...formData, preferredWordList: list.value })}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.preferredWordList === list.value
                                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-2xl">{list.icon}</span>
                                        {formData.preferredWordList === list.value && <CheckCircle size={18} className="text-indigo-600" />}
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm mb-0.5">{list.label}</div>
                                    <div className="text-xs text-slate-500">{list.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zorluk Seviyesi */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={20} className="text-slate-600" />
                            <label className="block text-sm font-bold text-slate-800">Zorluk Seviyesi</label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { value: 'beginner', label: 'Başlangıç', color: 'green' },
                                { value: 'intermediate', label: 'Orta', color: 'yellow' },
                                { value: 'advanced', label: 'İleri', color: 'red' },
                                { value: 'mixed', label: 'Karışık', color: 'purple' },
                            ].map(level => (
                                <div
                                    key={level.value}
                                    onClick={() => setFormData({ ...formData, difficultyLevel: level.value })}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.difficultyLevel === level.value
                                        ? `border-${level.color}-500 bg-${level.color}-50`
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="font-bold text-sm text-slate-800">{level.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-5">
                        <Button onClick={saveLearning} variant="soft" isLoading={savingLearning} icon={!savingLearning && <Save size={18} />}>
                            Öğrenim Ayarlarını Kaydet
                        </Button>
                    </div>
                </section>

                {/* 3. GÖRÜNÜM & GİZLİLİK */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><EyeIcon size={24} /></div>
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
                                    ? 'border-purple-500 bg-purple-50/30 ring-4 ring-purple-500/10'
                                    : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 font-bold">
                                    @{formData.username || 'kullaniciadi'}
                                </div>
                                {formData.displayPreference === 'username' && <CheckCircle size={20} className="text-purple-600" />}
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
                                    ? 'border-purple-500 bg-purple-50/30 ring-4 ring-purple-500/10'
                                    : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 font-bold">
                                    {formData.firstName} {formData.lastName}
                                </div>
                                {formData.displayPreference === 'fullname' && <CheckCircle size={20} className="text-purple-600" />}
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
                            <Shield size={20} className="text-purple-600" />
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
                        <Button onClick={saveAppearance} isLoading={savingAppearance} variant="soft" icon={!savingAppearance && <Save size={18} />}>
                            Görünüm Ayarlarını Kaydet
                        </Button>
                    </div>
                </section>

                {/* 4. BİLDİRİM AYARLARI */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Bell size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Bildirimler</h2>
                            <p className="text-sm text-slate-500">E-posta tercihlerini yönet.</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-slate-400 group-hover:text-indigo-500 transition"><Mail size={18} /></div>
                                <div>
                                    <div className="font-bold text-slate-800">Haftalık Özet</div>
                                    <div className="text-xs text-slate-500">İlerleme raporun her Pazartesi cebinde.</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                <input type="checkbox" checked={formData.emailNotifications} onChange={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })} className="opacity-0 w-full h-full absolute cursor-pointer z-10" />
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.emailNotifications ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-slate-400 group-hover:text-indigo-500 transition"><Globe size={18} /></div>
                                <div>
                                    <div className="font-bold text-slate-800">Ürün Haberleri</div>
                                    <div className="text-xs text-slate-500">Yeni özelliklerden ilk senin haberin olsun.</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.marketingEmails ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                <input type="checkbox" checked={formData.marketingEmails} onChange={() => setFormData({ ...formData, marketingEmails: !formData.marketingEmails })} className="opacity-0 w-full h-full absolute cursor-pointer z-10" />
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.marketingEmails ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end border-t border-slate-50 pt-5">
                        <Button onClick={saveNotifications} isLoading={savingNotif} variant="soft">
                            Ayarları Kaydet
                        </Button>
                    </div>
                </section>

                {/* 5. GÜVENLİK & ŞİFRE */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Shield size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Güvenlik</h2>
                            <p className="text-sm text-slate-500">Şifreni güncelle.</p>
                        </div>
                    </div>

                    <form onSubmit={savePassword}>
                        <div className="relative mb-5">
                            <Input
                                label="Mevcut Şifre"
                                value={passwords.current}
                                onChange={(e: any) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                type={showPass.current ? "text" : "password"}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                                {showPass.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                            <div className="relative">
                                <Input
                                    label="Yeni Şifre"
                                    value={passwords.new}
                                    onChange={(e: any) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                    type={showPass.new ? "text" : "password"}
                                    className="pr-10"
                                />
                                <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                                    {showPass.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    label="Yeni Şifre (Tekrar)"
                                    value={passwords.confirm}
                                    onChange={(e: any) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                    type={showPass.confirm ? "text" : "password"}
                                    className="pr-10"
                                />
                                <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                                    {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-slate-50 pt-5">
                            <Button type="submit" isLoading={savingPassword} variant="soft" icon={!savingPassword && <Lock size={18} />}>
                                Şifreyi Yenile
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 5. TEHLİKELİ BÖLGE */}
                <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-red-100 relative overflow-hidden transition-all hover:shadow-md hover:border-red-200">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex items-center gap-3 mb-4 pl-2">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
                        <h2 className="text-lg font-bold text-slate-800">Tehlikeli Bölge</h2>
                    </div>
                    <p className="text-slate-500 text-sm mb-6 pl-2">
                        Hesabınızı silme talebi oluşturduğunuzda, verileriniz <b>14 gün boyunca</b> saklanır. Bu süre içinde tekrar giriş yaparsanız silme işlemi iptal edilir.
                    </p>
                    <div className="flex justify-end border-t border-red-50 pt-5">
                        <Button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            variant="danger"
                            icon={<Trash2 size={18} />}
                        >
                            Hesabımı Sil
                        </Button>
                    </div>
                </section>

            </div>

            {/* --- MODALS --- */}

            {/* 1. Silme Onay Modalı */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hesabını Silmek Üzeresin"
                icon={<Trash2 size={32} />}
                type="danger"
            >
                <p className="mb-6">Bu işlem başlatıldığında oturumun kapatılacak. 14 gün boyunca giriş yapmazsan tüm verilerin kalıcı olarak silinecek. Emin misin?</p>
                <div className="flex gap-3">
                    <Button onClick={() => setShowDeleteModal(false)} variant="outline" className="flex-1">Vazgeç</Button>
                    <Button onClick={handleDeleteRequest} variant="danger" className="flex-1">Evet, Sil</Button>
                </div>
            </Modal>

            {/* 2. Başarı Modalı */}
            <Modal
                isOpen={showDeleteSuccessModal}
                onClose={() => { }}
                title="İşlem Başlatıldı"
                icon={<CheckCircle size={32} />}
                type="danger"
            >
                <p className="mb-6">Hesabınız silinmek üzere işaretlendi. Sizi ana sayfaya yönlendiriyoruz. Tekrar görüşmek dileğiyle!</p>
                <Button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                    }}
                    variant="secondary"
                    className="w-full"
                >
                    Anladım, Çıkış Yap
                </Button>
            </Modal>

        </div>
    );
}