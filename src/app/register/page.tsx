'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Mail, Check, X, Loader2 } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false); // Başarılı kayıt durumu
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Availability States
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', email: '', password: ''
    });

    // Legal Agreements State
    const [agreements, setAgreements] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgreements(e.target.checked);
    };

    // Username Check Effect
    useEffect(() => {
        const checkUsername = async () => {
            if (formData.username.length < 3) {
                setUsernameAvailable(null);
                setCheckingUsername(false);
                return;
            }

            // Alphanumeric Check
            const alphanumericRegex = /^[a-zA-Z0-9]+$/;
            if (!alphanumericRegex.test(formData.username)) {
                setUsernameAvailable(false);
                setCheckingUsername(false);
                return;
            }

            setCheckingUsername(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username')
                    .ilike('username', formData.username)
                    .single();

                if (error && error.code === 'PGRST116') {
                    setUsernameAvailable(true); // Bulunamadı -> Müsait
                } else if (data) {
                    setUsernameAvailable(false); // Bulundu -> Dolu
                } else {
                    setUsernameAvailable(null); // Diğer hatalar
                }
            } catch (error) {
                console.error(error);
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        };

        const timer = setTimeout(checkUsername, 500);
        return () => clearTimeout(timer);
    }, [formData.username]);

    // Email Check Effect
    useEffect(() => {
        const checkEmail = async () => {
            // Basit email regex kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setEmailAvailable(null);
                setCheckingEmail(false);
                return;
            }
            setCheckingEmail(true);
            try {
                // Not: Profiles tablosunda email olmayabilir. Eğer yoksa bu kontrol çalışmaz.
                // Ancak kullanıcı isteği üzerine ekliyoruz. Eğer RLS engellerse hata döner.
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id') // Sadece var mı diye bakıyoruz
                    .eq('email', formData.email) // Email kolonu varsa
                    .single();

                if (error && error.code === 'PGRST116') {
                    setEmailAvailable(true);
                } else if (data) {
                    setEmailAvailable(false);
                } else {
                    setEmailAvailable(null);
                }
            } catch (error) {
                setEmailAvailable(null);
            } finally {
                setCheckingEmail(false);
            }
        };

        const timer = setTimeout(checkEmail, 500);
        return () => clearTimeout(timer);
    }, [formData.email]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Username Validation
        if (formData.username.length < 3) {
            setErrorMsg("Kullanıcı adı en az 3 karakter olmalıdır.");
            return;
        }

        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(formData.username)) {
            setErrorMsg("Kullanıcı adı sadece harf ve rakamlardan oluşabilir.");
            return;
        }

        if (usernameAvailable === false) {
            setErrorMsg("Lütfen farklı bir kullanıcı adı seçin.");
            return;
        }
        if (emailAvailable === false) {
            setErrorMsg("Bu e-posta adresi zaten kayıtlı.");
            return;
        }

        // Password Validation
        if (formData.password.length < 5) {
            setErrorMsg("Şifre en az 5 karakter olmalıdır.");
            return;
        }

        // Legal Agreements Validation
        if (!agreements) {
            setErrorMsg("Lütfen kullanıcı sözleşmesi ve gizlilik politikalarını onaylayın.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: `${window.location.origin}/welcome`,
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
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-indigo-100/50 border border-white/50 text-center">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">E-postanı Kontrol Et!</h2>
                    <p className="text-slate-600 mb-8 text-base leading-relaxed px-2">
                        <span className="font-semibold text-indigo-600">{formData.email}</span> adresine bir doğrulama bağlantısı gönderdik.
                        Hesabını aktif etmek için lütfen o bağlantıya tıkla.
                    </p>
                    <Link href="/login" className="block w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition active:scale-[0.98] shadow-lg shadow-indigo-200">
                        Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- Normal Kayıt Formu ---
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-indigo-100/50 border border-white/50">
                    <div className="flex items-center mb-8">
                        <Link href="/" className="text-slate-400 hover:text-slate-600 transition mr-4 -ml-2 p-2 hover:bg-slate-100/50 rounded-xl">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Aramıza Katıl</h2>
                            <p className="text-slate-500 text-sm mt-1">Ücretsiz hesabını oluştur ve öğrenmeye başla.</p>
                        </div>
                    </div>

                    {/* Hata Kutusu */}
                    {errorMsg && (
                        <div className="mb-5 p-4 bg-red-50/50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                            <span className="text-lg mt-0.5">⚠️</span>
                            <span className="leading-relaxed font-medium">{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
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

                        <div className="relative">
                            <Input
                                label="Kullanıcı Adı"
                                name="username"
                                required
                                onChange={handleChange}
                                placeholder="ahmetyilmaz"
                                className={usernameAvailable === true ? "border-green-500 focus:border-green-500 focus:ring-green-200" : usernameAvailable === false ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}
                            />
                            <div className="absolute right-3 top-[38px]">
                                {checkingUsername ? (
                                    <Loader2 size={18} className="animate-spin text-slate-400" />
                                ) : usernameAvailable === true ? (
                                    <Check size={18} className="text-green-500" />
                                ) : usernameAvailable === false ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, username: '' });
                                            setUsernameAvailable(null);
                                        }}
                                        className="focus:outline-none"
                                    >
                                        <X size={18} className="text-red-500 hover:text-red-700 transition-colors" />
                                    </button>
                                ) : null}
                            </div>
                            {usernameAvailable === false && (
                                <p className="text-xs text-red-500 mt-1 ml-1">
                                    {/^[a-zA-Z0-9]+$/.test(formData.username)
                                        ? "Bu kullanıcı adı zaten alınmış."
                                        : "Sadece harf ve rakam kullanabilirsiniz."}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                label="E-posta"
                                name="email"
                                type="email"
                                required
                                onChange={handleChange}
                                placeholder="ornek@email.com"
                                className={emailAvailable === true ? "border-green-500 focus:border-green-500 focus:ring-green-200" : emailAvailable === false ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}
                            />
                            <div className="absolute right-3 top-[38px]">
                                {checkingEmail ? (
                                    <Loader2 size={18} className="animate-spin text-slate-400" />
                                ) : emailAvailable === true ? (
                                    <Check size={18} className="text-green-500" />
                                ) : emailAvailable === false ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, email: '' });
                                            setEmailAvailable(null);
                                        }}
                                        className="focus:outline-none"
                                    >
                                        <X size={18} className="text-red-500 hover:text-red-700 transition-colors" />
                                    </button>
                                ) : null}
                            </div>
                            {emailAvailable === false && (
                                <p className="text-xs text-red-500 mt-1 ml-1">Bu e-posta adresi zaten kayıtlı.</p>
                            )}
                        </div>

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

                        {/* Legal Agreements Checkboxes */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="agreements"
                                    name="agreements"
                                    checked={agreements}
                                    onChange={handleAgreementChange}
                                    className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                                />
                                <label htmlFor="agreements" className="text-sm text-slate-600 cursor-pointer select-none leading-relaxed">
                                    <span className="text-indigo-600 hover:underline font-medium">Kullanıcı Sözleşmesi</span>, <span className="text-indigo-600 hover:underline font-medium">Gizlilik Politikası</span> ve <span className="text-indigo-600 hover:underline font-medium">KVKK Aydınlatma Metni</span>&apos;ni okudum, anladım ve kabul ediyorum.
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full h-12 text-lg font-bold shadow-indigo-200 hover:shadow-indigo-300"
                            >
                                Hesap Oluştur
                            </Button>
                        </div>
                    </form>

                    <p className="text-center mt-8 text-slate-500 text-sm">
                        Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">Giriş Yap</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}