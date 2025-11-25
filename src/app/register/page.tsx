'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Sun, Mail } from 'lucide-react';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false); // Başarılı kayıt durumu
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', email: '', password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username
                }
            }
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            setSuccess(true); // Başarılı ekranını aç
        }
        setLoading(false);
    };

    // --- Başarılı Kayıt Ekranı ---
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">E-postanı Kontrol Et!</h2>
                    <p className="text-slate-600 mb-6">
                        <span className="font-semibold">{formData.email}</span> adresine bir doğrulama bağlantısı gönderdik.
                        Hesabını aktif etmek için lütfen o bağlantıya tıkla.
                    </p>
                    <Link href="/login" className="block w-full bg-slate-100 text-slate-700 p-3 rounded-xl font-bold hover:bg-slate-200 transition">
                        Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- Normal Kayıt Formu (Değişiklik yok, sadece errorMsg eklendi) ---
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-600 font-bold text-2xl hover:opacity-80 transition">
                <Sun className="w-8 h-8" /> <span>Vocasun</span>
            </Link>

            <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center mb-6">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 transition mr-auto"><ArrowLeft size={20} /></Link>
                    <h2 className="text-2xl font-bold text-slate-900 mr-auto pr-5">Kayıt Ol</h2>
                </div>

                {/* Hata Kutusu */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3">
                    {/* ... (Form inputları aynı kalacak, sadece yukarıdaki return kısmını değiştirmen yeterli) ... */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Ad</label>
                            <input name="firstName" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Soyad</label>
                            <input name="lastName" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                        <input name="username" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">E-posta</label>
                        <input name="email" type="email" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Şifre</label>
                        <div className="relative">
                            <input name="password" type={showPassword ? "text" : "password"} required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-10" onChange={handleChange} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3.5 mt-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70 shadow-lg shadow-indigo-200">
                        {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-600 text-sm">
                    Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}