'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle, Sun } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Supabase, şifre sıfırlama linkine tıklandığında kullanıcıyı otomatik olarak
    // "Password Recovery" oturumuyla giriş yapmış sayar. 
    // Bizim tek yapmamız gereken updateUser ile şifreyi güncellemek.

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı.' });
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...' });
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">

            <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-600 font-bold text-2xl">
                <Sun className="w-8 h-8" />
                <span>Vocasun</span>
            </Link>

            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Yeni Şifre Belirle</h2>
                <p className="text-slate-500 text-center mb-6 text-sm">Lütfen hesabınız için yeni bir şifre girin.</p>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Yeni Şifre</label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                                placeholder="••••••"
                                required
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70"
                    >
                        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        {!loading && <Save size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}