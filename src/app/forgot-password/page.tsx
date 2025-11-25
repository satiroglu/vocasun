'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Sun } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-600 font-bold text-2xl hover:opacity-80 transition">
                <Sun className="w-8 h-8" />
                <span>Vocasun</span>
            </Link>

            <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center mb-6">
                    <Link href="/login" className="text-slate-400 hover:text-slate-600 transition mr-auto">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mr-auto pr-5">Şifre Sıfırla</h2>
                </div>

                {message ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <p className="text-slate-500 text-sm">
                            Hesabınıza kayıtlı e-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                        </p>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-70 shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}