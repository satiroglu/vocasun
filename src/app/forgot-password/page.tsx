'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            alert('Hata: ' + error.message);
        } else {
            setMessage('E-posta adresine şifre sıfırlama bağlantısı gönderildi.');
        }
        setLoading(false);
    };

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
                        <Link href="/login" className="text-slate-400 hover:text-slate-600 transition mr-4 -ml-2 p-2 hover:bg-slate-100/50 rounded-xl">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Şifre Sıfırla</h2>
                            <p className="text-slate-500 text-sm mt-1">Hesabına erişimini kurtar.</p>
                        </div>
                    </div>

                    {message ? (
                        <div className="bg-green-50/50 text-green-700 p-6 rounded-2xl border border-green-100 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Mail size={32} className="text-green-600" />
                            </div>
                            <p className="font-medium text-base leading-relaxed">{message}</p>
                            <Link href="/login" className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm hover:underline">
                                Giriş sayfasına dön
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Hesabınıza kayıtlı e-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                            </p>

                            <Input
                                label="E-posta"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                icon={<Mail size={20} />}
                            />

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full h-12 text-lg font-bold shadow-indigo-200 hover:shadow-indigo-300"
                            >
                                Bağlantı Gönder
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}