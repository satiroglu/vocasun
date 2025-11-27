'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function UpdatePassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">

            <Logo className="mb-6 sm:mb-8" />

            <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-200/50">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} className="sm:w-10 sm:h-10" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Yeni Şifre Belirle</h2>
                    <p className="text-slate-600 text-sm sm:text-base">Lütfen hesabınız için yeni bir şifre girin.</p>
                </div>

                {message && (
                    <div className={`p-4 sm:p-5 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={22} className="shrink-0 mt-0.5" /> : <AlertCircle size={22} className="shrink-0 mt-0.5" />}
                        <span className="text-sm sm:text-base font-medium leading-relaxed">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-5 sm:space-y-6">
                    <div className="relative">
                        <Input
                            label="Yeni Şifre"
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="pr-12"
                            icon={<Lock size={18} />}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        >
                            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
                        icon={!loading && <Save size={20} />}
                    >
                        Şifreyi Güncelle
                    </Button>
                </form>
            </div>
        </div>
    );
}