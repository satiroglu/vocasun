'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
    User, Lock, Mail, Save, AlertCircle,
    CheckCircle, Eye, EyeOff, Eye as EyeIcon, Trash2,
    AlertTriangle, Bell, Globe
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
        id: '', firstName: '', lastName: '', username: '', email: '', displayPreference: 'username',
        emailNotifications: true, marketingEmails: false // Yeni Alanlar
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
                displayPreference: data?.display_name_preference || 'username',
                emailNotifications: true, // Veritabanına eklenebilir, şimdilik local
                marketingEmails: false
            });
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000); // 4 sn sonra mesajı gizle
    };

    // --- 1. Kişisel Bilgileri Kaydet ---
    const savePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPersonal(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ first_name: formData.firstName, last_name: formData.lastName })
                .eq('id', formData.id);

            if (error) throw error;

            // Email Güncelleme Kontrolü
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

    // --- 2. Görünüm Ayarlarını Kaydet ---
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

    // --- 3. Bildirim Ayarlarını Kaydet (Mock) ---
    const saveNotifications = async () => {
        setSavingNotif(true);
        // Burada veritabanı güncellemesi yapılabilir.
        setTimeout(() => {
            showMessage('success', 'Bildirim ayarları güncellendi.');
            setSavingNotif(false);
        }, 800);
    };

    // --- 4. Şifreyi Kaydet ---
    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            if (!passwords.current || !passwords.new) throw new Error("Alanları doldurun.");
            if (passwords.new.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
            if (passwords.new !== passwords.confirm) throw new Error("Yeni şifreler uyuşmuyor.");

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email, // Mevcut email ile doğrula
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

    // --- 5. Hesabı Sil (Soft Delete) ---
    const handleDeleteRequest = async () => {
        try {
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 14);

            const { error } = await supabase
                .from('profiles')
                .update({ marked_for_deletion_at: deletionDate.toISOString() })
                .eq('id', formData.id);

            if (error) throw error;

            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true); // Başarı modalını aç
        } catch (error: any) {
            showMessage('error', "Hata: " + error.message);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 flex justify-center text-indigo-600">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans pt-6 pb-20">

            <div className="w-full max-w-2xl mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Hesap Ayarları</h1>
                <p className="text-slate-500">Profilini ve tercihlerini yönet.</p>
            </div>

            <div className="w-full max-w-2xl space-y-8">

                {/* Global Mesaj */}
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up sticky top-24 z-30 shadow-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                {/* 1. KİŞİSEL BİLGİLER */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><User size={24} /></div>
                            <h2 className="text-xl font-bold text-slate-800">Kişisel Bilgiler</h2>
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
                                className="bg-slate-100 text-slate-500 cursor-not-allowed"
                            />
                            <div className="text-xs text-slate-400 font-medium text-right mt-1">Değiştirilemez</div>
                        </div>

                        <div className="mb-6">
                            <Input
                                label="E-posta"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon={<Mail size={20} />}
                            />
                            {emailUpdateMsg && <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">{emailUpdateMsg}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" isLoading={savingPersonal} icon={!savingPersonal && <Save size={18} />}>
                                Bilgileri Kaydet
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 2. GÖRÜNÜM & GİZLİLİK */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><EyeIcon size={24} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Görünüm & Gizlilik</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 mb-4 ml-1 uppercase tracking-wide">Liderlik Tablosunda Hangi İsim Görünsün?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.displayPreference === 'username' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 hover:border-purple-200'}`}>
                                <input type="radio" name="displayPref" value="username" checked={formData.displayPreference === 'username'} onChange={() => setFormData({ ...formData, displayPreference: 'username' })} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                                <div>
                                    <div className="font-bold text-slate-800">Kullanıcı Adı</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">@{formData.username}</div>
                                </div>
                            </label>

                            <label className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.displayPreference === 'fullname' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 hover:border-purple-200'}`}>
                                <input type="radio" name="displayPref" value="fullname" checked={formData.displayPreference === 'fullname'} onChange={() => setFormData({ ...formData, displayPreference: 'fullname' })} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                                <div>
                                    <div className="font-bold text-slate-800">Ad Soyad</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">{formData.firstName} {formData.lastName}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={saveAppearance} isLoading={savingAppearance} variant="primary" icon={!savingAppearance && <CheckCircle size={18} />}>
                            Tercihi Kaydet
                        </Button>
                    </div>
                </section>

                {/* 3. BİLDİRİM AYARLARI (YENİ - PROFESYONEL GÖRÜNÜM) */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Bell size={24} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Bildirim Ayarları</h2>
                    </div>

                    <div className="space-y-4 mb-6">
                        <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm"><Mail size={18} className="text-slate-400" /></div>
                                <div>
                                    <div className="font-bold text-slate-800">Haftalık Özeti E-posta ile Al</div>
                                    <div className="text-xs text-slate-500">Öğrendiğin kelimelerin raporu.</div>
                                </div>
                            </div>
                            <input type="checkbox" checked={formData.emailNotifications} onChange={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })} className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm"><Globe size={18} className="text-slate-400" /></div>
                                <div>
                                    <div className="font-bold text-slate-800">Ürün ve Özellik Haberleri</div>
                                    <div className="text-xs text-slate-500">Vocasun'daki yeniliklerden haberdar ol.</div>
                                </div>
                            </div>
                            <input type="checkbox" checked={formData.marketingEmails} onChange={() => setFormData({ ...formData, marketingEmails: !formData.marketingEmails })} className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={saveNotifications} isLoading={savingNotif} variant="primary">
                            Ayarları Güncelle
                        </Button>
                    </div>
                </section>

                {/* 4. ŞİFRE DEĞİŞTİRME */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Lock size={24} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Şifre Değiştir</h2>
                    </div>

                    <form onSubmit={savePassword}>
                        <div className="relative">
                            <Input
                                label="MEVCUT ŞİFRE"
                                value={passwords.current}
                                onChange={(e: any) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                type={showPass.current ? "text" : "password"}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                                {showPass.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                            <div className="relative">
                                <Input
                                    label="YENİ ŞİFRE"
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
                                    label="YENİ ŞİFRE (TEKRAR)"
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
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={savingPassword} variant="primary" icon={!savingPassword && <Lock size={18} />}>
                                Şifreyi Yenile
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 5. TEHLİKELİ BÖLGE */}
                <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
                        <h2 className="text-xl font-bold text-slate-800">Tehlikeli Bölge</h2>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">
                        Hesabınızı silme talebi oluşturduğunuzda, verileriniz <b>14 gün boyunca</b> saklanır. Bu süre içinde tekrar giriş yaparsanız silme işlemi iptal edilir.
                    </p>
                    <div className="flex justify-end">
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
                onClose={() => { }} // Kapatılamaz, yönlendirecek
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