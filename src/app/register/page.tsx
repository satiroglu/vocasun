'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Sun, Mail } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

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

        const { data, error } = await supabase.auth.signUp({
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

        // Supabase bazen duplicate kullanıcıda data.user null döner ama error vermez (rate limit vb).
        // Ancak genelde "User already registered" hatası döner.
        if (error) {
            setErrorMsg(error.message); // Hatayı ekrana bas
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            // Kritik Kontrol: Eğer identities boş dizi ise, bu email zaten kayıtlıdır!
            setErrorMsg("Bu e-posta adresi zaten kullanımda.");
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    // --- Başarılı Kayıt Ekranı ---
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6">
                <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-200/50 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Mail size={32} className="sm:w-10 sm:h-10" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">E-postanı Kontrol Et!</h2>
                    <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-2">
                        <span className="font-semibold text-indigo-600">{formData.email}</span> adresine bir doğrulama bağlantısı gönderdik.
                        Hesabını aktif etmek için lütfen o bağlantıya tıkla.
                    </p>
                    <Link href="/login" className="block w-full bg-indigo-600 text-white p-3 sm:p-4 rounded-xl font-bold hover:bg-indigo-700 transition active:scale-[0.98]">
                        Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- Normal Kayıt Formu ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6">

            {/* Logo */}
            <Logo className="mb-6 sm:mb-8" />

            <div className="bg-white w-full max-w-md p-5 sm:p-8 rounded-xl shadow-2xl shadow-indigo-100/50 border border-slate-200/50">
                <div className="flex items-center mb-6 sm:mb-8">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 transition mr-3 sm:mr-4 -ml-1 p-1 hover:bg-slate-50 rounded-lg">
                        <ArrowLeft size={22} />
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Kayıt Ol</h2>
                </div>

                {/* Hata Kutusu */}
                {errorMsg && (
                    <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <span className="leading-relaxed">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Input
                            label="Ad"
                            name="firstName"
                            required
                            onChange={handleChange}
                            placeholder="Ahmet"
                        />
                        <Input
                            label="Soyad"
                            name="lastName"
                            required
                            onChange={handleChange}
                            placeholder="Yılmaz"
                        />
                    </div>
                    <Input
                        label="Kullanıcı Adı"
                        name="username"
                        required
                        onChange={handleChange}
                        placeholder="ahmetyilmaz"
                    />
                    <Input
                        label="E-posta"
                        name="email"
                        type="email"
                        required
                        onChange={handleChange}
                        placeholder="ornek@email.com"
                    />
                    <div className="relative">
                        <Input
                            label="Şifre"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            onChange={handleChange}
                            className="pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="pt-2">
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
                        >
                            Hesap Oluştur
                        </Button>
                    </div>
                </form>

                <p className="text-center mt-6 sm:mt-8 text-slate-600 text-sm sm:text-base">
                    Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}