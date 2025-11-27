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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6">

            <Logo className="mb-6 sm:mb-8" />

            <div className="bg-white w-full max-w-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-200/50">
                <div className="flex items-center mb-6 sm:mb-8">
                    <Link href="/login" className="text-slate-400 hover:text-slate-600 transition mr-3 sm:mr-4 -ml-1 p-1 hover:bg-slate-50 rounded-lg">
                        <ArrowLeft size={22} />
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Şifre Sıfırla</h2>
                </div>

                {message ? (
                    <div className="bg-green-50 text-green-700 p-4 sm:p-5 rounded-xl border border-green-200 text-center space-y-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Mail size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <p className="font-medium text-sm sm:text-base leading-relaxed">{message}</p>
                        <Link href="/login" className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-bold text-sm hover:underline">
                            Giriş sayfasına dön
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5 sm:space-y-6">
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
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
                            className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
                        >
                            Bağlantı Gönder
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}