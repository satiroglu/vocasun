'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 font-sans">

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
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Yeni Şifre Belirle</h2>
                        <p className="text-slate-600 text-sm">Lütfen hesabınız için yeni bir şifre girin.</p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50/50 text-green-700 border border-green-100' : 'bg-red-50/50 text-red-700 border border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle size={22} className="shrink-0 mt-0.5" /> : <AlertCircle size={22} className="shrink-0 mt-0.5" />}
                            <span className="text-sm font-medium leading-relaxed">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
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
                            className="w-full h-12 text-lg font-bold shadow-indigo-200 hover:shadow-indigo-300"
                            icon={!loading && <Save size={20} />}
                        >
                            Şifreyi Güncelle
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}