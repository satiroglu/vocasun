'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Lock, Mail, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// --- Yardımcı Bileşen (Lag sorununu çözmek için dışarı alındı) ---
const PasswordInput = ({ label, value, onChange, show, onToggleShow }: any) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{label}</label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition pr-10"
            />
            <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    </div>
);

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

    // Profil Verileri
    const [formData, setFormData] = useState({
        id: '', firstName: '', lastName: '', username: '', email: ''
    });

    // Şifre State'leri
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    // Veri Çekme
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
                email: user.email || ''
            });
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // 1. Profil Güncelle
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username,
                })
                .eq('id', formData.id);

            if (profileError) throw profileError;

            // 1.5 E-posta Güncelleme
            if (formData.email !== (await supabase.auth.getUser()).data.user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
                if (emailError) throw emailError;
                setEmailUpdateMsg('Yeni e-posta adresinize doğrulama bağlantısı gönderildi. Lütfen onaylayın.');
            }

            // 2. Şifre Değiştir
            if (passwords.new || passwords.current) {
                if (!passwords.current) throw new Error("Şifre değiştirmek için mevcut şifrenizi girmelisiniz.");
                if (!passwords.new) throw new Error("Yeni şifreyi girmediniz.");
                if (passwords.new.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
                if (passwords.new !== passwords.confirm) throw new Error("Yeni şifreler birbiriyle uyuşmuyor.");

                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: passwords.current
                });

                if (loginError) throw new Error("Mevcut şifreniz hatalı.");

                const { error: updateError } = await supabase.auth.updateUser({ password: passwords.new });
                if (updateError) throw updateError;

                setPasswords({ current: '', new: '', confirm: '' }); // Temizle
            }

            setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
        } catch (error: any) {
            if (error.code === '23505') setMessage({ type: 'error', text: 'Bu kullanıcı adı zaten alınmış.' });
            else setMessage({ type: 'error', text: error.message || 'Bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
            <div className="w-full max-w-2xl flex items-center gap-4 mb-6 mt-2">
                <Link href="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition"><ArrowLeft size={24} /></Link>
                <h1 className="text-2xl font-bold text-slate-800">Hesap Ayarları</h1>
            </div>

            <div className="w-full max-w-2xl">
                {message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={updateProfile} className="space-y-6">
                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><User size={24} /></div>
                            <h2 className="text-lg font-bold text-slate-800">Kişisel Bilgiler</h2>
                        </div>
                        {/* ... (Kişisel bilgiler inputları aynı kalabilir) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Ad</label>
                                <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Soyad</label>
                                <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Kullanıcı Adı</label>
                            <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            {emailUpdateMsg && <p className="text-xs text-amber-600 mt-2">{emailUpdateMsg}</p>}
                        </div>
                    </section>

                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Lock size={24} /></div>
                            <h2 className="text-lg font-bold text-slate-800">Şifre Değiştir</h2>
                        </div>

                        {/* Bileşeni artık prop geçerek kullanıyoruz */}
                        <PasswordInput
                            label="Mevcut Şifre"
                            value={passwords.current}
                            onChange={(e: any) => setPasswords(p => ({ ...p, current: e.target.value }))}
                            show={showPass.current}
                            onToggleShow={() => setShowPass(s => ({ ...s, current: !s.current }))}
                        />
                        <PasswordInput
                            label="Yeni Şifre"
                            value={passwords.new}
                            onChange={(e: any) => setPasswords(p => ({ ...p, new: e.target.value }))}
                            show={showPass.new}
                            onToggleShow={() => setShowPass(s => ({ ...s, new: !s.new }))}
                        />
                        <PasswordInput
                            label="Yeni Şifre Tekrar"
                            value={passwords.confirm}
                            onChange={(e: any) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                            show={showPass.confirm}
                            onToggleShow={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                        />
                    </section>

                    <div className="flex justify-end">
                        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-70">
                            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            {!saving && <Save size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}