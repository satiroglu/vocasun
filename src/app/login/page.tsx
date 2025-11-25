'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Sun } from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setErrorMsg("Lütfen önce e-posta adresinize gelen onay linkine tıklayın.");
            } else if (error.message.includes("Invalid login")) {
                setErrorMsg("E-posta veya şifre hatalı.");
            } else {
                setErrorMsg(error.message);
            }
        } else {
            router.push('/dashboard');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            {/* Logo ve Geri Dönüş */}
            <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-600 font-bold text-2xl hover:opacity-80 transition">
                <Sun className="w-8 h-8" />
                <span>Vocasun</span>
            </Link>

            <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center mb-6">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 transition mr-auto">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mr-auto pr-5">Giriş Yap</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <div className="text-sm text-red-700">{errorMsg}</div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                                Şifremi unuttum?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-600 text-sm">
                    Hesabın yok mu?{' '}
                    <Link href="/register" className="text-indigo-600 font-bold hover:underline">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
}