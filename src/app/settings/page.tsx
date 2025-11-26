'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
    User, Lock, Mail, Save, AlertCircle,
    CheckCircle, Eye, EyeOff, Eye as EyeIcon, Trash2,
    AlertTriangle, Bell, Globe, Camera, Shield
} from 'lucide-react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Bölüm bazlı loading state'leri
    const [savingPersonal, setSavingPersonal] = useState(false);
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
        dailyGoal: 20, // Varsayılan 20
        bio: '',       // Yeni bio alanı
        id: '', firstName: '', lastName: '', username: '', email: '', displayPreference: 'username',
        emailNotifications: true, marketingEmails: false
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
                    daily_goal: formData.dailyGoal, // Eklendi
                    bio: formData.bio // Eklendi
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

    const saveAppearance = async () => {
        setSavingAppearance(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ display_name_preference: formData.displayPreference })
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
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 h-64"></div>
            ))}
        </div>
    );

    if (loading) return <div className="min-h-screen pt-20 flex justify-center bg-slate-50"><SettingsSkeleton /></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans pt-6 pb-20">

            <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Hesap Ayarları</h1>
                    <p className="text-slate-500">Profilini ve tercihlerini yönet.</p>
                </div>
                {/* Avatar UI (Mock) */}
                <div className="hidden sm:flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {formData.firstName.charAt(0) || 'U'}
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                        {formData.firstName || 'Kullanıcı'}
                    </div>
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
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                <User size={40} className="text-slate-300" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition hover:scale-110">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Profil Resmi</h2>
                            <p className="text-sm text-slate-500 mb-2">Bu fotoğraf liderlik tablosunda görünecek.</p>
                            <div className="flex gap-2">
                                <button className="text-xs font-bold text-indigo-600 hover:underline">Yükle</button>
                                <span className="text-slate-300">|</span>
                                <button className="text-xs font-bold text-red-500 hover:underline">Kaldır</button>
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
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Günlük Kelime Hedefi</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    step="5"
                                    value={formData.dailyGoal}
                                    onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <span className="font-bold text-indigo-600 w-12 text-right">{formData.dailyGoal}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 ml-1">Günde kaç kelime çalışmak istiyorsun?</p>
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

                {/* 2. GÖRÜNÜM & GİZLİLİK (Düzeltildi ve İyileştirildi) */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
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

                    <div className="flex justify-end border-t border-slate-50 pt-5">
                        <Button onClick={saveAppearance} isLoading={savingAppearance} variant="soft">
                            Tercihi Güncelle
                        </Button>
                    </div>
                </section>

                {/* 3. BİLDİRİM AYARLARI */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
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

                {/* 4. GÜVENLİK & ŞİFRE */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
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
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-red-100 relative overflow-hidden transition-all hover:shadow-md hover:border-red-200">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex items-center gap-3 mb-4 pl-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
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