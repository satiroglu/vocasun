'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Sun, Mail } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';

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

    // --- Normal Kayıt Formu ---
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

                <form onSubmit={handleRegister} className="space-y-1">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Ad"
                            name="firstName"
                            required
                            onChange={handleChange}
                        />
                        <Input
                            label="Soyad"
                            name="lastName"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <Input
                        label="Kullanıcı Adı"
                        name="username"
                        required
                        onChange={handleChange}
                    />
                    <Input
                        label="E-posta"
                        name="email"
                        type="email"
                        required
                        onChange={handleChange}
                    />
                    <div className="relative">
                        <Input
                            label="Şifre"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            onChange={handleChange}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full mt-4"
                    >
                        Hesap Oluştur
                    </Button>
                </form>

                <p className="text-center mt-6 text-slate-600 text-sm">
                    Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}